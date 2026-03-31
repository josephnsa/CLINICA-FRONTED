import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AppointmentResponse } from 'src/app/core/models';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './consulta.component.html',
})
export class ConsultaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  appointments: AppointmentResponse[] = [];
  displayedColumns = ['patientName', 'startTime', 'status', 'actions'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  onSearch(): void {
    const patientId = this.searchForm.get('patientId')?.value || '';
    if (!patientId) return;
    this.agendaService.getAppointmentsByPatient(patientId).subscribe({
      next: (resp) => {
        this.appointments = resp.data.filter(a =>
          a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS'
        );
      },
      error: () => {},
    });
  }

  startConsultation(id: string): void {
    this.agendaService.startConsultation(id).subscribe({
      next: (resp) => {
        this.appointments = this.appointments.map(a =>
          a.id === id ? resp.data : a
        );
      },
      error: () => {},
    });
  }

  complete(id: string): void {
    this.agendaService.completeAppointment(id).subscribe({
      next: (resp) => {
        this.appointments = this.appointments.map(a =>
          a.id === id ? resp.data : a
        );
      },
      error: () => {},
    });
  }
}