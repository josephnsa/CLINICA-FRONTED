import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { Doctor } from 'src/app/core/models';
import { CatalogService } from 'src/app/core/services/catalog.service';

@Component({
  selector: 'app-doctor-autocomplete-field',
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
        [displayWith]="displayDoctor"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let d of options; trackBy: trackById" [value]="d">
          <div class="flex flex-col">
            <span class="font-medium">{{ d.fullName }}</span>
            <span class="text-xs text-gray-500">
              CMP: {{ d.licenseNumber }} @if (d.specialtyName) { — {{ d.specialtyName }} }
            </span>
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
export class DoctorAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly catalogService = inject(CatalogService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) label!: string;
  @Input({ required: true }) idControl!: FormControl<string>;
  @Input() placeholder = 'Busca por nombre';
  @Input() minChars = 2;

  displayCtrl = new FormControl<string | Doctor>('', { nonNullable: true });
  options: Doctor[] = [];
  isLoading = false;

  ngOnInit(): void {
    // Si ya hay id (edición), intenta resolverlo desde la lista (fallback: no muestra nada).
    this.idControl.valueChanges
      .pipe(startWith(this.idControl.value), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((id) => {
        if (!id) {
          this.displayCtrl.setValue('', { emitEvent: false });
          return;
        }
        const found = this.options.find((x) => x.id === id);
        if (found) {
          this.displayCtrl.setValue(found, { emitEvent: false });
        }
      });

    this.displayCtrl.valueChanges
      .pipe(
        debounceTime(250),
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        distinctUntilChanged(),
        tap((term) => {
          if (term.length < this.minChars) this.options = [];
        }),
        switchMap((term) => {
          if (term.length < this.minChars) return of<Doctor[]>([]);
          this.isLoading = true;
          return this.catalogService.getDoctors({ q: term }).pipe(
            map((resp) => resp.data),
            catchError(() => of<Doctor[]>([])),
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

  trackById(_: number, d: Doctor): string {
    return d.id;
  }

  displayDoctor = (d: Doctor | null): string => {
    if (!d) return '';
    return d.fullName;
  };

  onSelected(d: Doctor): void {
    this.idControl.setValue(d.id);
    this.displayCtrl.setValue(d, { emitEvent: false });
  }

  clear(): void {
    this.idControl.setValue('');
    this.displayCtrl.setValue('', { emitEvent: false });
    this.options = [];
  }
}

