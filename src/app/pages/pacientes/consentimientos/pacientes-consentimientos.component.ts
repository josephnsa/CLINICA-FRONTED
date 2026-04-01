import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MaterialModule } from 'src/app/material.module';
import { PatientService } from 'src/app/core/services/patient.service';
import { Patient, PatientConsent, ApiResponse, PageResponse } from 'src/app/core/models';

@Component({
  selector: 'app-pacientes-consentimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './pacientes-consentimientos.component.html',
})
export class PacientesConsentimientosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);
  private readonly sanitizer = inject(DomSanitizer);

  // Lista de pacientes para buscar
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;

  // Consentimientos del paciente seleccionado
  consents: PatientConsent[] = [];
  displayedColumns = ['type', 'signedAt', 'fileUrl', 'actions'];

  showForm = false;
  selectedPdfPreviewUrl: SafeResourceUrl | null = null;
  private selectedPdfObjectUrl: string | null = null;

  searchForm = this.fb.group({
    search: [''],
  });

  consentForm = this.fb.group({
    type:    ['TRATAMIENTO', Validators.required],
    file:    [null as File | null, Validators.required],
  });

  consentTypes = [
    'CIRUGÍA', 'ANESTESIA', 'TRATAMIENTO',
    'FOTOGRAFÍA', 'DATOS_PERSONALES', 'OTRO'
  ];

  ngOnInit(): void {
    this.loadPatients();
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

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.loadConsents();
  }

  loadConsents(): void {
    if (!this.selectedPatient) return;
    this.patientService.getConsents(this.selectedPatient.id).subscribe({
      next: (resp: ApiResponse<PatientConsent[]>) => {
        this.consents = resp.data;
      },
      error: () => {},
    });
  }

  openForm(): void {
    this.consentForm.reset({ type: 'TRATAMIENTO', file: null });
    this.clearSelectedPdfPreview();
    this.showForm = true;
  }

  save(): void {
    if (this.consentForm.invalid || !this.selectedPatient) {
      this.consentForm.markAllAsTouched();
      return;
    }
    const { type, file } = this.consentForm.value;
    if (!file) return;
    this.patientService.createConsent(this.selectedPatient.id, {
      type: type!,
      file,
    }).subscribe({
      next: () => {
        this.showForm = false;
        this.clearSelectedPdfPreview();
        this.loadConsents();
      },
      error: () => {},
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.consentForm.patchValue({ file: null });
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.consentForm.patchValue({ file: null });
      this.consentForm.get('file')?.setErrors({ invalidType: true });
      this.clearSelectedPdfPreview();
      input.value = '';
      return;
    }

    this.consentForm.patchValue({ file });
    this.consentForm.get('file')?.setErrors(null);

    this.clearSelectedPdfPreview();
    const objectUrl = URL.createObjectURL(file);
    this.selectedPdfObjectUrl = objectUrl;
    this.selectedPdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }

  delete(consent: PatientConsent): void {
    if (!this.selectedPatient) return;
    this.patientService.deleteConsent(this.selectedPatient.id, consent.id).subscribe({
      next: () => { this.loadConsents(); },
      error: () => {},
    });
  }

  cancel(): void {
    this.showForm = false;
    this.clearSelectedPdfPreview();
  }

  onSearch(): void {
    this.loadPatients();
  }

  private clearSelectedPdfPreview(): void {
    if (this.selectedPdfObjectUrl) {
      URL.revokeObjectURL(this.selectedPdfObjectUrl);
      this.selectedPdfObjectUrl = null;
    }
    this.selectedPdfPreviewUrl = null;
  }
}