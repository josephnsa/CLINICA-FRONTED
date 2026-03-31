import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  private static phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phone = control.value.replace(/\D/g, '');
    if (phone.length === 0) return null;
    if (!phone.startsWith('9')) return { phoneStart: true };
    if (phone.length > 9) return { phoneMax: true };
    return null;
  }

  private static dniValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const dni = control.value.replace(/\D/g, '');
    if (dni.length === 0) return null;
    if (dni.length > 8) return { dniMax: true };
    return null;
  }

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
    docNumber:      ['', [Validators.required, PacientesRegistroComponent.dniValidator]],
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    birthDate:      ['', Validators.required],
    gender:         ['F', Validators.required],
    bloodType:      [''],
    email:          ['', Validators.email],
    phone:          ['', PacientesRegistroComponent.phoneValidator],
    address:        [''],
    emergencyName:  [''],
    emergencyPhone: ['', PacientesRegistroComponent.phoneValidator],
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

  // ─── Filtros de entrada para campos numéricos ───
  onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    this.patientForm.patchValue({ docNumber: value });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Si se intenta escribir algo que no comienza con 9
    if (value && !value.startsWith('9')) {
      value = '';
    }
    
    // Máximo de 9 dígitos
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    this.patientForm.patchValue({ phone: value });
  }

  onEmergencyPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Si se intenta escribir algo que no comienza con 9
    if (value && !value.startsWith('9')) {
      value = '';
    }
    
    // Máximo de 9 dígitos
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    this.patientForm.patchValue({ emergencyPhone: value });
  }
}