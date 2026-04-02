import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, takeUntil, tap, catchError } from 'rxjs';
import { Patient } from 'src/app/core/models';
import { PatientService } from 'src/app/core/services/patient.service';

@Component({
  selector: 'app-patient-autocomplete-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        type="text"
        [placeholder]="placeholder"
        [formControl]="displayCtrl"
        [matAutocomplete]="auto"
        autocomplete="off"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        aria-label="Limpiar"
        *ngIf="displayCtrl.value"
        (click)="clear()"
      >
        <mat-icon>close</mat-icon>
      </button>

      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayPatient"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let p of options; trackBy: trackById" [value]="p">
          <div class="flex flex-col">
            <span class="font-medium">{{ p.firstName }} {{ p.lastName }}</span>
            <span class="text-xs text-gray-500">{{ p.docType }} {{ p.docNumber }}</span>
          </div>
        </mat-option>
        <mat-option
          *ngIf="!isLoading && options.length === 0 && (typeof displayCtrl.value === 'string' ? displayCtrl.value.trim().length : 0) >= minChars"
          disabled
        >
          Sin resultados
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class PatientAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly patientService = inject(PatientService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) label!: string;
  @Input({ required: true }) idControl!: FormControl<string>;
  @Input() placeholder = 'Busca por nombre o documento';
  @Input() minChars = 2;

  displayCtrl = new FormControl<string | Patient>('', { nonNullable: true });
  options: Patient[] = [];
  isLoading = false;

  ngOnInit(): void {
    // Si ya hay id (edición), carga el display.
    this.idControl.valueChanges
      .pipe(
        startWith(this.idControl.value),
        distinctUntilChanged(),
        switchMap((id) => {
          if (!id) return of(null);
          return this.patientService.getPatientById(id).pipe(
            map((resp) => resp.data),
            catchError(() => of(null))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((p) => {
        if (!p) return;
        this.displayCtrl.setValue(p, { emitEvent: false });
      });

    this.displayCtrl.valueChanges
      .pipe(
        debounceTime(250),
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        distinctUntilChanged(),
        tap((term) => {
          if (term.length < this.minChars) {
            this.options = [];
          }
        }),
        switchMap((term) => {
          if (term.length < this.minChars) return of<Patient[]>([]);
          this.isLoading = true;
          return this.patientService.getPatients({ search: term, page: 0, size: 20 }).pipe(
            map((resp) => resp.data.content),
            catchError(() => of<Patient[]>([])),
            tap(() => (this.isLoading = false))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((rows) => {
        this.options = rows;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_: number, p: Patient): string {
    return p.id;
  }

  displayPatient = (p: Patient | null): string => {
    if (!p) return '';
    return `${p.firstName} ${p.lastName}`;
  };

  onSelected(p: Patient): void {
    this.idControl.setValue(p.id);
    this.displayCtrl.setValue(p, { emitEvent: false });
  }

  clear(): void {
    this.idControl.setValue('');
    this.displayCtrl.setValue('', { emitEvent: false });
    this.options = [];
  }
}

