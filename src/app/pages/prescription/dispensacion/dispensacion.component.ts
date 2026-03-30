import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { PrescriptionResponse } from 'src/app/core/models';

@Component({
  selector: 'app-dispensacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './dispensacion.component.html',
})
export class DispensacionComponent {
  private readonly prescriptionService = inject(PrescriptionService);
  private readonly fb = inject(FormBuilder);

  prescriptions: PrescriptionResponse[] = [];
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
        this.prescriptions = resp.data.filter(p => p.status === 'ACTIVE');
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
}