import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, PatientConsent, ApiResponse, PageResponse } from 'src/app/core/models';

@Component({
  selector: 'app-pacientes-consentimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './pacientes-consentimientos.component.html',
})
export class PacientesConsentimientosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);

  // Lista de pacientes para buscar
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;

  // Consentimientos del paciente seleccionado
  consents: PatientConsent[] = [];
  displayedColumns = ['type', 'signedAt', 'fileUrl', 'actions'];

  showForm = false;

  searchForm = this.fb.group({
    search: [''],
  });

  consentForm = this.fb.group({
    type:    ['TRATAMIENTO', Validators.required],
    fileUrl: [''],
  });

  consentTypes = [
    'CIRUGÍA', 'ANESTESIA', 'TRATAMIENTO',
    'FOTOGRAFÍA', 'DATOS_PERSONALES', 'OTRO'
  ];

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
    this.loadConsents();
  }

  loadConsents(): void {
    if (!this.selectedPatient) return;
    this.patientService.getConsents(this.selectedPatient.id).subscribe({
      next: (resp: ApiResponse<PatientConsent[]>) => {
        this.consents = resp.data;
      },
      error: () => {},
    });
  }

  openForm(): void {
    this.consentForm.reset({ type: 'TRATAMIENTO' });
    this.showForm = true;
  }

  save(): void {
    if (this.consentForm.invalid || !this.selectedPatient) return;
    const { type, fileUrl } = this.consentForm.value;
    this.patientService.createConsent(this.selectedPatient.id, {
      type: type!,
      fileUrl: fileUrl ?? undefined,
    }).subscribe({
      next: () => { this.showForm = false; this.loadConsents(); },
      error: () => {},
    });
  }

  delete(consent: PatientConsent): void {
    if (!this.selectedPatient) return;
    this.patientService.deleteConsent(this.selectedPatient.id, consent.id).subscribe({
      next: () => { this.loadConsents(); },
      error: () => {},
    });
  }

  cancel(): void {
    this.showForm = false;
  }

  onSearch(): void {
    this.loadPatients();
  }
}