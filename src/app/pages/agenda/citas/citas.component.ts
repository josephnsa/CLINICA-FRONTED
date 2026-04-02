import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AppointmentResponse, AppointmentStatus } from 'src/app/core/models';
import { PatientService } from 'src/app/core/services/patient.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { TimePickerFieldComponent } from 'src/app/shared/datetime/time-picker-field.component';
import { combineDateAndTimeToLocalIso } from 'src/app/shared/datetime/datetime.utils';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';
import { DoctorAutocompleteFieldComponent } from 'src/app/shared/autocomplete/doctor-autocomplete-field.component';
import { ServiceAutocompleteFieldComponent } from 'src/app/shared/autocomplete/service-autocomplete-field.component';
import { SedeAutocompleteFieldComponent } from 'src/app/shared/autocomplete/sede-autocomplete-field.component';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    DatePickerFieldComponent,
    TimePickerFieldComponent,
    PatientAutocompleteFieldComponent,
    DoctorAutocompleteFieldComponent,
    ServiceAutocompleteFieldComponent,
    SedeAutocompleteFieldComponent,
  ],
  templateUrl: './citas.component.html',
})
export class CitasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly patientService = inject(PatientService);
  private readonly catalogService = inject(CatalogService);
  private readonly snackBar = inject(MatSnackBar);

  appointments: AppointmentResponse[] = [];
  showForm = false;
  isSaving = false;
  private readonly patientNameById = new Map<string, string>();
  private readonly doctorNameById = new Map<string, string>();

  displayedColumns = ['patientName', 'doctorName', 'startTime', 'status', 'actions'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  createForm = this.fb.group({
    patientId: ['', Validators.required],
    doctorId: ['', Validators.required],
    serviceId: ['', Validators.required],
    sedeId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    startTime: ['09:00', Validators.required],
    endDate: [null as Date | null, Validators.required],
    endTime: ['10:00', Validators.required],
    notes: [''],
  });

  cancelForm = this.fb.group({
    appointmentId: ['', Validators.required],
    reason:        ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAllAppointments();
  }

  onSearch(): void {
    const patientId = this.searchForm.get('patientId')?.value || '';
    if (!patientId) return;
    this.agendaService.getAppointmentsByPatient(patientId).subscribe({
      next: (resp) => {
        this.appointments = resp.data;
        this.hydrateMissingNames();
      },
      error: () => {},
    });
  }

  private loadAllAppointments(): void {
    this.agendaService.getAllAppointments().subscribe({
      next: (resp) => {
        this.appointments = resp.data;
        this.hydrateMissingNames();
      },
      error: () => {},
    });
  }

  openForm(): void {
    const today = new Date();
    this.createForm.reset({
      patientId: '',
      doctorId: '',
      serviceId: '',
      sedeId: '',
      startDate: today,
      startTime: '09:00',
      endDate: today,
      endTime: '10:00',
      notes: '',
    });
    this.showForm = true;
  }

  save(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    if (!v.startDate || !v.endDate) {
      return;
    }
    const patientId = this.normalizeId(v.patientId);
    const doctorId = this.normalizeId(v.doctorId);
    const serviceId = this.normalizeId(v.serviceId);
    const sedeId = this.normalizeId(v.sedeId);
    if (!patientId || !doctorId || !serviceId || !sedeId) {
      this.snackBar.open('Selecciona paciente, doctor, servicio y sede desde la lista.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    this.isSaving = true;
    this.agendaService
      .createAppointment({
        patientId,
        doctorId,
        serviceId,
        sedeId,
        startTime: combineDateAndTimeToLocalIso(v.startDate, v.startTime ?? '00:00'),
        endTime: combineDateAndTimeToLocalIso(v.endDate, v.endTime ?? '00:00'),
        notes: v.notes ?? '',
      })
      .subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.showForm = false;
        this.appointments = [resp.data, ...this.appointments];
        this.hydrateMissingNames();
        this.snackBar.open(`Cita creada con estado: ${resp.data.status}`, 'Cerrar', {
          duration: 3500,
        });
      },
      error: (err) => {
        this.isSaving = false;
        const message = err?.error?.message || 'No se pudo guardar la cita.';
        this.snackBar.open(message, 'Cerrar', { duration: 5000 });
      },
    });
  }

  cancel(): void {
    this.showForm = false;
  }

  cancelAppointment(id: string): void {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    this.agendaService.cancelAppointment(id, reason).subscribe({
      next: (resp) => {
        this.appointments = this.appointments.map(a =>
          a.id === id ? resp.data : a
        );
        this.hydrateMissingNames();
      },
      error: () => {},
    });
  }

  confirmAppointment(id: string): void {
    this.agendaService.confirmAppointment(id).subscribe({
      next: (resp) => {
        this.appointments = this.appointments.map((a) =>
          a.id === id ? resp.data : a
        );
        this.hydrateMissingNames();
        this.snackBar.open('Cita confirmada.', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo confirmar la cita.';
        this.snackBar.open(message, 'Cerrar', { duration: 5000 });
      },
    });
  }

  displayPatientName(row: AppointmentResponse): string {
    const direct = row.patientName?.trim();
    if (direct) return direct;
    return this.patientNameById.get(row.patientId) ?? '—';
  }

  displayDoctorName(row: AppointmentResponse): string {
    const direct = row.doctorName?.trim();
    if (direct) return direct;
    return this.doctorNameById.get(row.doctorId) ?? '—';
  }

  private hydrateMissingNames(): void {
    const missingPatients = Array.from(
      new Set(
        this.appointments
          .filter((a) => !a.patientName?.trim() && !!a.patientId)
          .map((a) => a.patientId)
      )
    ).filter((id) => !this.patientNameById.has(id));

    for (const patientId of missingPatients) {
      this.patientService.getPatientById(patientId).subscribe({
        next: (resp) => {
          this.patientNameById.set(patientId, `${resp.data.firstName} ${resp.data.lastName}`.trim());
        },
        error: () => {},
      });
    }

    const missingDoctorIds = Array.from(
      new Set(
        this.appointments
          .filter((a) => !a.doctorName?.trim() && !!a.doctorId)
          .map((a) => a.doctorId)
      )
    ).filter((id) => !this.doctorNameById.has(id));

    if (missingDoctorIds.length) {
      this.catalogService.getDoctors({}).subscribe({
        next: (resp) => {
          for (const d of resp.data) {
            if (missingDoctorIds.includes(d.id)) {
              this.doctorNameById.set(d.id, d.fullName);
            }
          }
        },
        error: () => {},
      });
    }
  }

  getStatusColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = {
      PENDING:    'bg-yellow-100 text-yellow-700',
      CONFIRMED:  'bg-blue-100 text-blue-700',
      CHECKED_IN: 'bg-purple-100 text-purple-700',
      IN_PROGRESS:'bg-orange-100 text-orange-700',
      ATTENDED:   'bg-green-100 text-green-700',
      CANCELLED:  'bg-red-100 text-red-700',
      NO_SHOW:    'bg-gray-100 text-gray-700',
    };
    return colors[status];
  }

  private normalizeId(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object' && value !== null && 'id' in (value as Record<string, unknown>)) {
      const idValue = (value as Record<string, unknown>)['id'];
      return typeof idValue === 'string' ? idValue.trim() : '';
    }
    return '';
  }
}