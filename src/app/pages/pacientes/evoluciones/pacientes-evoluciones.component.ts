import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, ApiResponse, PageResponse } from 'src/app/core/models';
import { AppointmentAutocompleteFieldComponent } from 'src/app/shared/autocomplete/appointment-autocomplete-field.component';

@Component({
  selector: 'app-pacientes-evoluciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, AppointmentAutocompleteFieldComponent],
  templateUrl: './pacientes-evoluciones.component.html',
})
export class PacientesEvolucionesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);

  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  evoluciones: any[] = [];
  showForm = false;

  displayedColumns = ['date', 'diagnosisCode', 'reason', 'notes', 'createdBy'];

  searchForm = this.fb.group({ search: [''] });

  evolucionForm = this.fb.group({
  appointmentId:  ['', Validators.required],
  diagnosisCode:  ['', Validators.required],
  reason:         ['', Validators.required],
  treatmentPlan:  ['', Validators.required],
  notes:          [''],
});

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    const search = this.searchForm.value.search ?? '';
    this.patientService.getPatients({ search }).subscribe({
      next: (resp: ApiResponse<PageResponse<Patient>>) => {
        this.patients = resp.data.content;
      },
      error: () => {},
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.loadEvoluciones();
  }

  loadEvoluciones(): void {
    if (!this.selectedPatient) return;
    // GET /api/clinical-notes?patientId=...
    this.patientService.getClinicalNotes(this.selectedPatient.id).subscribe({
      next: (resp: ApiResponse<any[]>) => {
        this.evoluciones = resp.data;
      },
      error: () => {},
    });
  }

  openForm(): void {
    this.evolucionForm.reset();
    this.showForm = true;
  }

  save(): void {
    if (this.evolucionForm.invalid || !this.selectedPatient) return;
    const body = this.evolucionForm.value as {
      appointmentId: string;
      diagnosisCode: string;
      reason: string;
      treatmentPlan: string;
      notes?: string;
    };
    this.patientService.createClinicalNote(this.selectedPatient.id, body).subscribe({
      next: () => { this.showForm = false; this.loadEvoluciones(); },
      error: () => {},
    });
  }

  cancel(): void { this.showForm = false; }
  onSearch(): void { this.loadPatients(); }
}