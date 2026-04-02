import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AppointmentResponse } from 'src/app/core/models';
import { PatientService } from 'src/app/core/services/patient.service';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, PatientAutocompleteFieldComponent],
  templateUrl: './consulta.component.html',
})
export class ConsultaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly patientService = inject(PatientService);

  appointments: AppointmentResponse[] = [];
  private readonly patientNameById = new Map<string, string>();
  displayedColumns = ['patientName', 'startTime', 'status', 'actions'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAllAppointments();
  }

  onSearch(): void {
    const patientId = this.searchForm.get('patientId')?.value || '';
    if (!patientId) return;
    this.agendaService.getAppointmentsByPatient(patientId).subscribe({
      next: (resp) => {
        this.appointments = [...resp.data].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        this.hydrateMissingPatientNames();
      },
      error: () => {},
    });
  }

  private loadAllAppointments(): void {
    this.agendaService.getAllAppointments().subscribe({
      next: (resp) => {
        this.appointments = [...resp.data].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        this.hydrateMissingPatientNames();
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
        this.hydrateMissingPatientNames();
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
        this.hydrateMissingPatientNames();
      },
      error: () => {},
    });
  }

  displayPatientName(row: AppointmentResponse): string {
    const direct = row.patientName?.trim();
    if (direct) return direct;
    return this.patientNameById.get(row.patientId) ?? '—';
  }

  private hydrateMissingPatientNames(): void {
    const missingPatientIds = Array.from(
      new Set(
        this.appointments
          .filter((a) => !a.patientName?.trim() && !!a.patientId)
          .map((a) => a.patientId)
      )
    ).filter((id) => !this.patientNameById.has(id));

    for (const patientId of missingPatientIds) {
      this.patientService.getPatientById(patientId).subscribe({
        next: (resp) => {
          this.patientNameById.set(patientId, `${resp.data.firstName} ${resp.data.lastName}`.trim());
        },
        error: () => {},
      });
    }
  }
}