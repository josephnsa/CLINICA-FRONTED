import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { KardexEntry } from 'src/app/core/models';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './kardex.component.html',
})
export class KardexComponent {
  private readonly fb = inject(FormBuilder);
  private readonly prescriptionService = inject(PrescriptionService);

  kardex: KardexEntry[] = [];
  isLoading = false;

  displayedColumns = ['medicationName', 'dosage', 'frequency', 'duration', 'status', 'createdAt'];

  searchForm = this.fb.group({
    patientId: ['', Validators.required],
  });

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const patientId = this.searchForm.get('patientId')?.value || '';
    this.isLoading = true;
    this.prescriptionService.getKardex(patientId).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.kardex = resp.data;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}