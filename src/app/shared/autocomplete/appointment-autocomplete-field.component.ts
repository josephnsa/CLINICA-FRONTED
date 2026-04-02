import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, catchError, distinctUntilChanged, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { AppointmentResponse } from 'src/app/core/models';
import { AgendaService } from 'src/app/core/services/agenda.service';

@Component({
  selector: 'app-appointment-autocomplete-field',
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
        [disabled]="!patientIdValue"
        autocomplete="off"
      />
      <mat-hint *ngIf="!patientIdValue">{{ hintNoPatient }}</mat-hint>

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
        [displayWith]="displayAppointment"
        (optionSelected)="onSelected($event.option.value)"
      >
        <mat-option *ngFor="let a of options; trackBy: trackById" [value]="a">
          <div class="flex flex-col">
            <span class="font-medium">{{ a.startTime | date:'dd/MM/yyyy HH:mm' }} — {{ a.endTime | date:'HH:mm' }}</span>
            <span class="text-xs text-gray-500">{{ a.doctorName }} · {{ a.serviceName }}</span>
          </div>
        </mat-option>
        <mat-option *ngIf="!isLoading && patientIdValue && options.length === 0" disabled>
          Sin citas para este paciente
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class AppointmentAutocompleteFieldComponent implements OnInit, OnDestroy {
  private readonly agendaService = inject(AgendaService);
  private readonly destroy$ = new Subject<void>();
  private readonly patientId$ = new Subject<string | null>();
  patientIdValue: string | null = null;

  @Input({ required: true }) label!: string;
  @Input({ required: true }) appointmentIdControl!: FormControl<string>;
  @Input() set patientId(value: string | null) {
    this.patientIdValue = value ?? null;
    this.patientId$.next(this.patientIdValue);
  }
  @Input() placeholder = 'Selecciona la cita del paciente';
  @Input() hintNoPatient = 'Primero selecciona un paciente';

  displayCtrl = new FormControl<string | AppointmentResponse>('', { nonNullable: true });
  options: AppointmentResponse[] = [];
  isLoading = false;

  ngOnInit(): void {
    // Carga citas cuando cambia el paciente.
    this.patientId$
      .pipe(
        startWith(null),
        distinctUntilChanged(),
        tap(() => {
          this.options = [];
          this.clearDisplayOnly();
          this.appointmentIdControl.setValue('');
        }),
        switchMap((pid) => {
          if (!pid) return of<AppointmentResponse[]>([]);
          this.isLoading = true;
          return this.agendaService.getAppointmentsByPatient(pid).pipe(
            map((resp) => resp.data),
            catchError(() => of<AppointmentResponse[]>([])),
            tap(() => (this.isLoading = false))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((rows) => {
        this.options = [...rows].sort((a, b) => String(b.startTime).localeCompare(String(a.startTime)));
      });

    // Si setean appointmentId (edición), resuelve display desde las opciones actuales.
    this.appointmentIdControl.valueChanges
      .pipe(startWith(this.appointmentIdControl.value), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((id) => {
        if (!id) {
          this.clearDisplayOnly();
          return;
        }
        const found = this.options.find((x) => x.id === id);
        if (found) {
          this.displayCtrl.setValue(found, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_: number, a: AppointmentResponse): string {
    return a.id;
  }

  displayAppointment = (a: AppointmentResponse | null): string => {
    if (!a) return '';
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()} ${pad(start.getHours())}:${pad(start.getMinutes())} — ${pad(end.getHours())}:${pad(end.getMinutes())}`;
  };

  onSelected(a: AppointmentResponse): void {
    this.appointmentIdControl.setValue(a.id);
    this.displayCtrl.setValue(a, { emitEvent: false });
  }

  clear(): void {
    this.appointmentIdControl.setValue('');
    this.clearDisplayOnly();
  }

  private clearDisplayOnly(): void {
    this.displayCtrl.setValue('', { emitEvent: false });
  }
}

