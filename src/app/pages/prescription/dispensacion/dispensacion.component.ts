import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { PrescriptionResponse } from 'src/app/core/models';
import { PatientService } from 'src/app/core/services/patient.service';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';

@Component({
  selector: 'app-dispensacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, PatientAutocompleteFieldComponent],
  templateUrl: './dispensacion.component.html',
})
export class DispensacionComponent {
  private readonly prescriptionService = inject(PrescriptionService);
  private readonly patientService = inject(PatientService);
  private readonly fb = inject(FormBuilder);

  prescriptions: PrescriptionResponse[] = [];
  private readonly patientNameById = new Map<string, string>();
  isDispensing: string | null = null;

  displayedColumns = ['patientName', 'createdAt', 'status', 'actions'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  onSearch(): void {
    const patientId = this.searchForm.get('patientId')?.value || '';
    if (!patientId) return;
    this.prescriptionService.getPrescriptions(patientId).subscribe({
      next: (resp) => {
        this.prescriptions = resp.data.filter((p) => p.status === 'ACTIVE');
        this.hydrateMissingPatientNames();
      },
      error: () => {},
    });
  }

  dispense(prescription: PrescriptionResponse): void {
    this.isDispensing = prescription.id;
    this.prescriptionService.dispensePrescription(prescription.id).subscribe({
      next: () => {
        this.isDispensing = null;
        this.prescriptions = this.prescriptions.filter(p => p.id !== prescription.id);
      },
      error: () => {
        this.isDispensing = null;
      },
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
}