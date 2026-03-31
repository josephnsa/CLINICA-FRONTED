import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  PageResponse,
  Patient,
  CreatePatientDto,
  PatientConsent,
  ClinicalProfile,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── Pacientes ──────────────────────────────────────
  getPatients(params: { search?: string; page?: number; size?: number }) {
  let httpParams = new HttpParams()
    .set('search', params.search ?? '')
    .set('page', String(params.page ?? 0))
    .set('size', String(params.size ?? 20));

  return this.http.get<ApiResponse<PageResponse<Patient>>>(
    `${this.baseUrl}/patients/search`,   // ← cambia aquí
    { params: httpParams }
  );
}

  getPatientById(id: string) {
    return this.http.get<ApiResponse<Patient>>(
      `${this.baseUrl}/patients/${id}`
    );
  }

  createPatient(body: CreatePatientDto) {
    return this.http.post<ApiResponse<Patient>>(
      `${this.baseUrl}/patients`,
      body
    );
  }

  updatePatient(id: string, body: CreatePatientDto) {
    return this.http.put<ApiResponse<Patient>>(
      `${this.baseUrl}/patients/${id}`,
      body
    );
  }

  // ── Consentimientos ────────────────────────────────
  getConsents(patientId: string) {
    return this.http.get<ApiResponse<PatientConsent[]>>(
      `${this.baseUrl}/patients/${patientId}/consents`
    );
  }

  createConsent(patientId: string, body: { type: string; fileUrl?: string }) {
    return this.http.post<ApiResponse<PatientConsent>>(
      `${this.baseUrl}/patients/${patientId}/consents`,
      body
    );
  }

  deleteConsent(patientId: string, consentId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/patients/${patientId}/consents/${consentId}`
    );
  }

  // ── Ficha clínica ──────────────────────────────────
  getClinicalNotes(patientId: string) {
  return this.http.get<ApiResponse<any>>(
    `${this.baseUrl}/patients/${patientId}/history`
  );
}

  updateClinicalProfile(patientId: string, body: Partial<ClinicalProfile>) {
    return this.http.put<ApiResponse<ClinicalProfile>>(
      `${this.baseUrl}/patients/${patientId}/clinical-profile`,
      body
    );
  }

  createClinicalNote(patientId: string, body: {
  appointmentId: string;
  diagnosisCode: string;
  reason: string;
  treatmentPlan: string;
  notes?: string;
}) {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/clinical-notes`,
    { ...body, patientId }
  );
}
  // Kardex del paciente
getKardex(patientId: string) {
  return this.http.get<ApiResponse<any[]>>(
    `${this.baseUrl}/patients/${patientId}/kardex`
  );
}
}