import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ExamService } from 'src/app/core/services/exam.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { ExamOrder, Patient, ApiResponse, PageResponse } from 'src/app/core/models';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly examService = inject(ExamService);
  private readonly patientService = inject(PatientService);

  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  orders: ExamOrder[] = [];

  displayedColumns = ['examType', 'status', 'createdAt'];
  statuses = ['PENDIENTE', 'EN_PROCESO', 'LISTO', 'ENTREGADO'];

  searchForm = this.fb.group({ search: [''] });
  filterForm = this.fb.group({ status: [''] });

  ngOnInit(): void { this.loadPatients(); }

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
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.selectedPatient) return;
    const status = this.filterForm.value.status ?? '';
    this.examService.getOrders({
      patientId: this.selectedPatient.id,
      status: status || undefined,
    }).subscribe({
      next: (resp: ApiResponse<ExamOrder[]>) => {
        this.orders = resp.data;
      },
      error: () => {},
    });
  }

  onSearch(): void { this.loadPatients(); }
  onFilter(): void { this.loadOrders(); }
}