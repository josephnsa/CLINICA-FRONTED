import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { UserSummary } from 'src/app/core/models';
import { SecurityService } from 'src/app/core/services/security.service';

@Component({
  selector: 'app-user-autocomplete-field',
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
        [displayWith]="displayUser"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let u of options; trackBy: trackById" [value]="u">
          <div class="flex flex-col">
            <span class="font-medium">{{ u.fullName }}</span>
            <span class="text-xs text-gray-500">{{ u.email }}</span>
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
export class UserAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly securityService = inject(SecurityService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) label!: string;
  @Input({ required: true }) idControl!: FormControl<string>;
  @Input() placeholder = 'Busca usuario por nombre o correo';
  @Input() minChars = 2;

  displayCtrl = new FormControl<string | UserSummary>('', { nonNullable: true });
  options: UserSummary[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.idControl.valueChanges
      .pipe(
        startWith(this.idControl.value),
        distinctUntilChanged(),
        switchMap((id) => {
          if (!id) return of(null);
          return this.securityService.getUsers({ page: 0, size: 100 }).pipe(
            map((resp) => resp.data.items.find((u) => u.id === id) ?? null),
            catchError(() => of(null))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((u) => {
        if (!u) return;
        this.displayCtrl.setValue(u, { emitEvent: false });
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
          if (term.length < this.minChars) return of<UserSummary[]>([]);
          this.isLoading = true;
          return this.securityService.getUsers({ search: term, active: true, page: 0, size: 20 }).pipe(
            map((resp) => resp.data.items ?? []),
            catchError(() => of<UserSummary[]>([])),
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

  trackById(_: number, u: UserSummary): string {
    return u.id;
  }

  displayUser = (u: UserSummary | null): string => (u ? u.fullName : '');

  onSelected(u: UserSummary): void {
    this.idControl.setValue(u.id);
    this.displayCtrl.setValue(u, { emitEvent: false });
  }

  clear(): void {
    this.idControl.setValue('');
    this.displayCtrl.setValue('', { emitEvent: false });
    this.options = [];
  }
}

