import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, startWith, takeUntil, tap } from 'rxjs';
import { Sede } from 'src/app/core/models';
import { SecurityService } from 'src/app/core/services/security.service';

@Component({
  selector: 'app-sede-autocomplete-field',
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
        [displayWith]="displaySede"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let s of filtered; trackBy: trackById" [value]="s">
          <span class="font-medium">{{ s.name }}</span>
        </mat-option>
        <mat-option *ngIf="filtered.length === 0 && isLoaded && typedTerm.length >= minChars" disabled>
          Sin resultados
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class SedeAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly securityService = inject(SecurityService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) label!: string;
  @Input({ required: true }) idControl!: FormControl<string>;
  @Input() placeholder = 'Selecciona sede';
  @Input() minChars = 0;

  displayCtrl = new FormControl<string | Sede>('', { nonNullable: true });
  sedes: Sede[] = [];
  filtered: Sede[] = [];
  isLoaded = false;
  typedTerm = '';

  ngOnInit(): void {
    this.securityService
      .getSedes()
      .pipe(catchError(() => of({ data: [] as Sede[] } as { data: Sede[] })))
      .subscribe((resp) => {
        this.sedes = resp.data ?? [];
        this.isLoaded = true;
        this.applyFilter('');

        const currentId = this.idControl.value;
        if (currentId) {
          const found = this.sedes.find((x) => x.id === currentId);
          if (found) this.displayCtrl.setValue(found, { emitEvent: false });
        }
      });

    this.idControl.valueChanges
      .pipe(startWith(this.idControl.value), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((id) => {
        if (!id) {
          this.displayCtrl.setValue('', { emitEvent: false });
          return;
        }
        const found = this.sedes.find((x) => x.id === id);
        if (found) this.displayCtrl.setValue(found, { emitEvent: false });
      });

    this.displayCtrl.valueChanges
      .pipe(
        debounceTime(100),
        map((v) => (typeof v === 'string' ? v.trim() : '')),
        distinctUntilChanged(),
        tap((term) => {
          this.typedTerm = term;
          this.applyFilter(term);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_: number, s: Sede): string {
    return s.id;
  }

  displaySede = (s: Sede | null): string => (s ? s.name : '');

  onSelected(s: Sede): void {
    this.idControl.setValue(s.id);
    this.displayCtrl.setValue(s, { emitEvent: false });
  }

  clear(): void {
    this.idControl.setValue('');
    this.displayCtrl.setValue('', { emitEvent: false });
    this.applyFilter('');
  }

  private applyFilter(term: string): void {
    const t = term.toLowerCase();
    this.filtered = !t
      ? [...this.sedes]
      : this.sedes.filter((s) => s.name.toLowerCase().includes(t));
  }
}

