import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ExamService } from 'src/app/core/services/exam.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { ExamOrder, CreateExamOrderDto, ApiResponse, PageResponse, Patient, Doctor, ClinicalService } from 'src/app/core/models';
import { AppointmentAutocompleteFieldComponent } from 'src/app/shared/autocomplete/appointment-autocomplete-field.component';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, AppointmentAutocompleteFieldComponent],
  templateUrl: './ordenes.component.html',
})
export class OrdenesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly examService = inject(ExamService);
  private readonly patientService = inject(PatientService);
  private readonly catalogService = inject(CatalogService);

  patients: Patient[] = [];
  doctors: Doctor[] = [];
  services: ClinicalService[] = [];
  selectedPatient: Patient | null = null;
  orders: ExamOrder[] = [];
  showForm = false;

  displayedColumns = ['status', 'createdAt', 'notes'];

  searchForm = this.fb.group({ search: [''] });

  orderForm = this.fb.group({
    appointmentId: ['', Validators.required],
    doctorId:      ['', Validators.required],
    serviceId:     ['', Validators.required],
    notes:         [''],
  });

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.loadServices();
  }

  loadPatients(): void {
    const search = this.searchForm.value.search ?? '';
    this.patientService.getPatients({ search }).subscribe({
      next: (resp: ApiResponse<PageResponse<Patient>>) => {
        this.patients = resp.data.content;
      },
      error: () => {},
    });
  }

  loadDoctors(): void {
    this.catalogService.getDoctors({}).subscribe({
      next: (resp) => { this.doctors = resp.data; },
      error: () => {},
    });
  }

  loadServices(): void {
    this.catalogService.getServices({}).subscribe({
      next: (resp) => { this.services = resp.data; },
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

  openForm(): void {
    this.orderForm.reset();
    this.showForm = true;
  }

  save(): void {
    if (this.orderForm.invalid || !this.selectedPatient) return;
    const body: CreateExamOrderDto = {
      patientId:     this.selectedPatient.id,
      doctorId:      this.orderForm.value.doctorId!,
      appointmentId: this.orderForm.value.appointmentId!,
      notes:         this.orderForm.value.notes ?? undefined,
      items: [{ serviceId: this.orderForm.value.serviceId! }],
    };
    this.examService.createOrder(body).subscribe({
      next: () => { this.showForm = false; this.loadOrders(); },
      error: () => {},
    });
  }

  cancel(): void { this.showForm = false; }
  onSearch(): void { this.loadPatients(); }
}