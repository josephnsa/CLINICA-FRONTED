import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, CreatePatientDto, PageResponse, ApiResponse } from 'src/app/core/models';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { formatDateToYmd, parseYmdToDate } from 'src/app/shared/datetime/datetime.utils';

@Component({
  selector: 'app-pacientes-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, DatePickerFieldComponent],
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

  private static docNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const digits = String(control.value).replace(/\D/g, '');
    if (digits.length === 0) return null;

    const docType = control.parent?.get('docType')?.value as string | null | undefined;
    const max = docType === 'DNI' ? 8 : 9;

    if (digits.length > max) return { docMax: { max, actual: digits.length } };
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
    docNumber:      ['', [Validators.required, PacientesRegistroComponent.docNumberValidator]],
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
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

    this.patientForm.controls.docType.valueChanges.subscribe(() => {
      // Revalida y ajusta docNumber cuando cambia el tipo de documento
      this.patientForm.controls.docNumber.updateValueAndValidity({ emitEvent: false });
      const current = this.patientForm.controls.docNumber.value;
      if (current != null && String(current).length > 0) {
        // Normaliza y recorta si excede el nuevo max
        this.onDocNumberInput({ target: { value: String(current) } } as unknown as Event);
      }
    });
  }

  get docNumberMaxLength(): number {
    return this.patientForm.controls.docType.value === 'DNI' ? 8 : 9;
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
    this.patientForm.patchValue({
      ...patient,
      birthDate: parseYmdToDate(patient.birthDate) ?? null,
    });
    this.showForm = true;
  }

  save(): void {
    if (this.patientForm.invalid) {
      return;
    }
    const v = this.patientForm.getRawValue();
    if (!v.birthDate) {
      return;
    }
    const body: CreatePatientDto = {
      docType: v.docType!,
      docNumber: v.docNumber!,
      firstName: v.firstName!,
      lastName: v.lastName!,
      birthDate: formatDateToYmd(v.birthDate),
      gender: v.gender!,
      bloodType: v.bloodType || undefined,
      email: v.email || undefined,
      phone: v.phone || undefined,
      address: v.address || undefined,
      emergencyName: v.emergencyName || undefined,
      emergencyPhone: v.emergencyPhone || undefined,
    };

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
  onDocNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = (input?.value ?? '').replace(/\D/g, '');
    const max = this.docNumberMaxLength;
    if (value.length > max) value = value.slice(0, max);
    this.patientForm.patchValue({ docNumber: value }, { emitEvent: false });
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