import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import {
  PortalLoginRequest, PortalRegisterRequest, PortalAuthResponse,
  PortalAppointment, PortalExamOrder, PortalPrescription,
  PortalDoctor, PortalSlot, BookAppointmentRequest,PortalPayment
} from '../models';

@Injectable({ providedIn: 'root' })
export class PortalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/portal`;

  // ── AUTH (sin token) ────────────────────────────────────
  register(body: PortalRegisterRequest): Observable<PortalAuthResponse> {
    return this.http
      .post<ApiResponse<PortalAuthResponse>>(`${this.base}/auth/register`, body)
      .pipe(map(r => r.data));
  }

  login(body: PortalLoginRequest): Observable<PortalAuthResponse> {
    return this.http
      .post<ApiResponse<PortalAuthResponse>>(`${this.base}/auth/login`, body)
      .pipe(map(r => r.data));
  }

  // ── HELPERS de sesión ───────────────────────────────────
  saveSession(auth: PortalAuthResponse): void {
    localStorage.setItem('portal_token', auth.accessToken);
    localStorage.setItem('portal_patient', JSON.stringify({
      patientId: auth.patientId,
      fullName: auth.fullName,
      email: auth.email,
    }));
  }

  getToken(): string | null {
    return localStorage.getItem('portal_token');
  }

  getPatient(): { patientId: string; fullName: string; email: string } | null {
    const raw = localStorage.getItem('portal_patient');
    return raw ? JSON.parse(raw) : null;
  }
  getDoctors(): Observable<PortalDoctor[]> {
  return this.http
    .get<ApiResponse<any[]>>(`${environment.apiUrl}/public/doctors`)
    .pipe(
      map(r => r.data.map(d => ({
        id: d.id,
        doctorName: d.name,
        specialty: d.specialty,
        services: d.services ?? [],
        sede: d.sede,
        consultationFee: d.consultationFee,
        available: d.available,
      })))
    );
}

  logout(): void {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_patient');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ── PORTAL AUTENTICADO ──────────────────────────────────
  getAppointments(): Observable<PortalAppointment[]> {
    return this.http
      .get<ApiResponse<PortalAppointment[]>>(`${this.base}/appointments`)
      .pipe(map(r => r.data));
  }

  getExams(): Observable<PortalExamOrder[]> {
    return this.http
      .get<ApiResponse<PortalExamOrder[]>>(`${this.base}/exams`)
      .pipe(map(r => r.data));
  }

  getPrescriptions(): Observable<PortalPrescription[]> {
    return this.http
      .get<ApiResponse<PortalPrescription[]>>(`${this.base}/prescriptions`)
      .pipe(map(r => r.data));
  }
  getAvailability(doctorId: string, date: string): Observable<PortalSlot[]> {
  return this.http
    .get<ApiResponse<PortalSlot[]>>(`${environment.apiUrl}/public/availability`, {
      params: { doctorId, date }
    })
    .pipe(map(r => r.data));
}

bookAppointment(body: BookAppointmentRequest): Observable<any> {
  return this.http
    .post<ApiResponse<any>>(`${this.base}/appointments`, body)
    .pipe(map(r => r.data));

}
getPayments(): Observable<PortalPayment[]> {
  return this.http
    .get<ApiResponse<PortalPayment[]>>(`${this.base}/payments`)
    .pipe(map(r => r.data));
}
}