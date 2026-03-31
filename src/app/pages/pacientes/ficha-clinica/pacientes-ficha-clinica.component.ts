import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, ClinicalProfile, ApiResponse, PageResponse } from 'src/app/core/models';

@Component({
  selector: 'app-pacientes-ficha-clinica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './pacientes-ficha-clinica.component.html',
})
export class PacientesFichaClinicaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);

  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  profile: ClinicalProfile | null = null;
  showForm = false;

  searchForm = this.fb.group({ search: [''] });

  profileForm = this.fb.group({
    allergies:       [''],
    personalHistory: [''],
    familyHistory:   [''],
    surgicalHistory: [''],
    currentMeds:     [''],
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
    this.loadProfile();
  }

  loadProfile(): void {
  if (!this.selectedPatient) return;
  this.patientService.getClinicalNotes(this.selectedPatient.id).subscribe({
    next: (resp: ApiResponse<any>) => {
      this.profile = resp.data;
      this.profileForm.patchValue(this.profile ?? {});
      this.showForm = true;
    },
    error: () => { this.showForm = true; },
  });
}

  save(): void {/*no existe un endpoint para guardar la ficha clinica o soy wbon una de dos, creo que mas probable es lo segundo xd*/}
  

  onSearch(): void {
    this.loadPatients();
  }
}