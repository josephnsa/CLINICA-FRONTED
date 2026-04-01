import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ExamService } from 'src/app/core/services/exam.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { ExamOrder, ExamResult, Patient, ApiResponse, PageResponse } from 'src/app/core/models';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './resultados.component.html',
})
export class ResultadosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly examService = inject(ExamService);
  private readonly patientService = inject(PatientService);

  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  orders: ExamOrder[] = [];
  selectedOrder: ExamOrder | null = null;
  showForm = false;

  displayedColumns = ['examType', 'status', 'actions'];

  searchForm = this.fb.group({ search: [''] });

  resultForm = this.fb.group({
    result:  ['', Validators.required],
    fileUrl: [''],
  });

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
    this.examService.getOrders({ patientId: this.selectedPatient.id }).subscribe({
      next: (resp: ApiResponse<ExamOrder[]>) => {
        this.orders = resp.data;
      },
      error: () => {},
    });
  }

  selectOrder(order: ExamOrder): void {
    this.selectedOrder = order;
    this.resultForm.reset();
    this.showForm = true;
  }

  save(): void {
    if (this.resultForm.invalid || !this.selectedOrder) return;
    const body = this.resultForm.value as ExamResult;
    this.examService.registerResult(this.selectedOrder.id, body).subscribe({
      next: () => { this.showForm = false; this.selectedOrder = null; this.loadOrders(); },
      error: () => {},
    });
  }

  cancel(): void { this.showForm = false; this.selectedOrder = null; }
  onSearch(): void { this.loadPatients(); }
}