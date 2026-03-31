import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AppointmentResponse, AppointmentStatus } from 'src/app/core/models';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './citas.component.html',
})
export class CitasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  appointments: AppointmentResponse[] = [];
  showForm = false;
  isSaving = false;

  displayedColumns = ['patientName', 'doctorName', 'startTime', 'status', 'actions'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  createForm = this.fb.group({
    patientId:   ['', Validators.required],
    doctorId:    ['', Validators.required],
    serviceId:   ['', Validators.required],
    sedeId:      ['', Validators.required],
    startTime:   ['', Validators.required],
    endTime:     ['', Validators.required],
    notes:       [''],
  });

  cancelForm = this.fb.group({
    appointmentId: ['', Validators.required],
    reason:        ['', Validators.required],
  });

  onSearch(): void {
    const patientId = this.searchForm.get('patientId')?.value || '';
    if (!patientId) return;
    this.agendaService.getAppointmentsByPatient(patientId).subscribe({
      next: (resp) => {
        this.appointments = resp.data;
      },
      error: () => {},
    });
  }

  openForm(): void {
    this.createForm.reset();
    this.showForm = true;
  }

  save(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.agendaService.createAppointment(this.createForm.getRawValue() as any).subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.showForm = false;
        this.appointments = [resp.data, ...this.appointments];
      },
      error: () => {
        this.isSaving = false;
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
      },
      error: () => {},
    });
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
}