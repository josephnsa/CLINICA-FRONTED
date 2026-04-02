import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Medication } from 'src/app/core/models';
import { CatalogService } from 'src/app/core/services/catalog.service';

@Component({
  selector: 'app-medication-autocomplete-field',
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
        [displayWith]="displayMedication"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let m of options; trackBy: trackById" [value]="m">
          <div class="flex flex-col">
            <span class="font-medium">{{ m.genericName }}</span>
            <span class="text-xs text-gray-500">{{ m.tradeName }}</span>
          </div>
        </mat-option>
        <mat-option *ngIf="!isLoading && options.length === 0 && typedTerm.length >= minChars" disabled>
          Sin resultados
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class MedicationAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly catalogService = inject(CatalogService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) label!: string;
  @Input({ required: true }) idControl!: FormControl<string>;
  @Input() placeholder = 'Busca medicamento';
  @Input() minChars = 2;

  displayCtrl = new FormControl<string | Medication>('', { nonNullable: true });
  options: Medication[] = [];
  isLoading = false;
  typedTerm = '';

  ngOnInit(): void {
    this.displayCtrl.valueChanges
      .pipe(
        debounceTime(250),
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        distinctUntilChanged(),
        tap((term) => {
          this.typedTerm = term;
          if (term.length < this.minChars) this.options = [];
        }),
        switchMap((term) => {
          if (term.length < this.minChars) return of<Medication[]>([]);
          this.isLoading = true;
          return this.catalogService.getMedications({ q: term, activeOnly: true, page: 0, size: 20 }).pipe(
            map((resp: any) => (resp.data?.content ?? []) as Medication[]),
            catchError(() => of<Medication[]>([])),
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

  trackById(_: number, m: Medication): string {
    return m.id;
  }

  displayMedication = (m: Medication | null): string => (m ? m.genericName : '');

  onSelected(m: Medication): void {
    this.idControl.setValue(m.id);
    this.displayCtrl.setValue(m, { emitEvent: false });
  }

  clear(): void {
    this.idControl.setValue('');
    this.displayCtrl.setValue('', { emitEvent: false });
    this.options = [];
    this.typedTerm = '';
  }
}

