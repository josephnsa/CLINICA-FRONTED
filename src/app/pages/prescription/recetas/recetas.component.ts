import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { PrescriptionResponse } from 'src/app/core/models';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';
import { AppointmentAutocompleteFieldComponent } from 'src/app/shared/autocomplete/appointment-autocomplete-field.component';
import { MedicationAutocompleteFieldComponent } from 'src/app/shared/autocomplete/medication-autocomplete-field.component';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    PatientAutocompleteFieldComponent,
    AppointmentAutocompleteFieldComponent,
    MedicationAutocompleteFieldComponent,
  ],
  templateUrl: './recetas.component.html',
})
export class RecetasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly prescriptionService = inject(PrescriptionService);

  prescriptions: PrescriptionResponse[] = [];
  showForm = false;
  isSaving = false;

  displayedColumns = ['patientName', 'status', 'createdAt', 'actions'];

  createForm = this.fb.group({
    patientId:     ['', Validators.required],
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

  save(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const raw = this.createForm.getRawValue();
    const payload = {
      patientId: raw.patientId!,
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