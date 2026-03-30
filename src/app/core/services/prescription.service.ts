import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  CreatePrescriptionRequest,
  PrescriptionResponse,
  KardexEntry,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── Recetas ────────────────────────────────────────
  getPrescriptions(patientId: string) {
  return this.http.get<ApiResponse<PrescriptionResponse[]>>(
    `${this.baseUrl}/prescriptions?patientId=${patientId}`
  );
}

  createPrescription(body: CreatePrescriptionRequest) {
    return this.http.post<ApiResponse<PrescriptionResponse>>(
      `${this.baseUrl}/prescriptions`,
      body
    );
  }

  // ── Dispensación ───────────────────────────────────
  dispensePrescription(id: string) {
    return this.http.post<ApiResponse<PrescriptionResponse>>(
      `${this.baseUrl}/prescriptions/${id}/dispense`,
      {}
    );
  }

  // ── Kardex ─────────────────────────────────────────
  getKardex(patientId: string) {
    return this.http.get<ApiResponse<KardexEntry[]>>(
      `${this.baseUrl}/patients/${patientId}/kardex`
    );
  }
}