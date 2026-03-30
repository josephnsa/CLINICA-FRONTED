import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, CreatePatientDto, PageResponse, ApiResponse } from 'src/app/core/models';

@Component({
  selector: 'app-pacientes-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './pacientes-registro.component.html',
})
export class PacientesRegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  isLoading = false;
  showForm = false;
  editingId: string | null = null;

  displayedColumns = [
    'docType', 'docNumber', 'firstName', 'lastName',
    'phone', 'bloodType', 'isActive', 'actions'
  ];

  searchForm = this.fb.group({
    search: [''],
  });

  patientForm = this.fb.group({
    docType:        ['DNI', Validators.required],
    docNumber:      ['', Validators.required],
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    birthDate:      ['', Validators.required],
    gender:         ['F', Validators.required],
    bloodType:      [''],
    email:          [''],
    phone:          [''],
    address:        [''],
    emergencyName:  [''],
    emergencyPhone: [''],
  });

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    const search = this.searchForm.value.search ?? '';
    this.patientService.getPatients({ search }).subscribe({
      next: (resp: ApiResponse<PageResponse<Patient>>) => {
        this.patients = resp.data.content;
        this.filteredPatients = this.patients;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.patientForm.reset({ docType: 'DNI', gender: 'F' });
    this.showForm = true;
  }

  openEdit(patient: Patient): void {
    this.editingId = patient.id;
    this.patientForm.patchValue(patient);
    this.showForm = true;
  }

  save(): void {
    if (this.patientForm.invalid) return;
    const body = this.patientForm.value as CreatePatientDto;

    if (this.editingId) {
      this.patientService.updatePatient(this.editingId, body).subscribe({
        next: () => { this.showForm = false; this.loadPatients(); },
        error: () => {},
      });
    } else {
      this.patientService.createPatient(body).subscribe({
        next: () => { this.showForm = false; this.loadPatients(); },
        error: () => {},
      });
    }
  }

  cancel(): void {
    this.showForm = false;
    this.patientForm.reset({ docType: 'DNI', gender: 'F' });
  }

  onSearch(): void {
    this.loadPatients();
  }
}