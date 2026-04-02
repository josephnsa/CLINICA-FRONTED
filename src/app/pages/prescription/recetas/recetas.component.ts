import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { PrescriptionResponse } from 'src/app/core/models';
import { PatientService } from 'src/app/core/services/patient.service';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';
import { AppointmentAutocompleteFieldComponent } from 'src/app/shared/autocomplete/appointment-autocomplete-field.component';
import { MedicationAutocompleteFieldComponent } from 'src/app/shared/autocomplete/medication-autocomplete-field.component';
import { DoctorAutocompleteFieldComponent } from 'src/app/shared/autocomplete/doctor-autocomplete-field.component';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    PatientAutocompleteFieldComponent,
    DoctorAutocompleteFieldComponent,
    AppointmentAutocompleteFieldComponent,
    MedicationAutocompleteFieldComponent,
  ],
  templateUrl: './recetas.component.html',
})
export class RecetasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly prescriptionService = inject(PrescriptionService);
  private readonly patientService = inject(PatientService);

  prescriptions: PrescriptionResponse[] = [];
  private readonly patientNameById = new Map<string, string>();
  showForm = false;
  isSaving = false;

  displayedColumns = ['patientName', 'status', 'createdAt', 'actions'];

  createForm = this.fb.group({
    patientId:     ['', Validators.required],
    doctorId:      ['', Validators.required],
    appointmentId: ['', Validators.required],
    medicationId:  ['', Validators.required],
    quantity:      [1, Validators.required],
    dosage:        ['', Validators.required],
    frequency:     ['', Validators.required],
    duration:      ['', Validators.required],
  });

  ngOnInit(): void {}

  searchForm = this.fb.group({
  patientId: ['', Validators.required],
});

loadPrescriptions(): void {
  const patientId = this.searchForm.get('patientId')?.value || '';
  if (!patientId) return;
  this.prescriptionService.getPrescriptions(patientId).subscribe({
    next: (resp) => {
      this.prescriptions = resp.data;
      this.hydrateMissingPatientNames();
    },
    error: () => {},
  });
}

onSearch(): void {
  this.loadPrescriptions();
}

  openForm(): void {
    this.createForm.reset({ quantity: 1 });
    this.showForm = true;
  }

  cancelPrescription(id: string): void {
    this.prescriptionService.cancelPrescription(id).subscribe({
      next: (resp) => {
        this.prescriptions = this.prescriptions.map((p) =>
          p.id === id ? resp.data : p
        );
      },
      error: () => {},
    });
  }

  displayPatientName(row: PrescriptionResponse): string {
    return this.patientNameById.get(row.patientId) ?? '—';
  }

  private hydrateMissingPatientNames(): void {
    const missingPatientIds = Array.from(
      new Set(this.prescriptions.map((p) => p.patientId).filter(Boolean))
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

  save(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const raw = this.createForm.getRawValue();
    const payload = {
      patientId: raw.patientId!,
      doctorId: raw.doctorId!,
      appointmentId: raw.appointmentId!,
      items: [{
        medicationId: raw.medicationId!,
        quantity: raw.quantity!,
        dose: raw.dosage!,
        frequency: raw.frequency!,
        duration: raw.duration!,
      }],
    };
    this.isSaving = true;
    this.prescriptionService.createPrescription(payload).subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.showForm = false;
        this.prescriptions = [resp.data, ...this.prescriptions];
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }

  cancel(): void {
    this.showForm = false;
  }
}