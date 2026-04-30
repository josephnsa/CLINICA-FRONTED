import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
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
  private legacyBase = `${environment.apiUrl}`;

  // ── AUTH (sin token) ────────────────────────────────────
  register(body: PortalRegisterRequest): Observable<PortalAuthResponse> {
    return this.http
      .post<ApiResponse<PortalAuthResponse>>(`${this.base}/auth/register`, body)
      .pipe(map(r => this.normalizeAuthResponse(r.data as any)));
  }

  login(body: PortalLoginRequest): Observable<PortalAuthResponse> {
    return this.http
      .post<ApiResponse<PortalAuthResponse>>(`${this.base}/auth/login`, body)
      .pipe(map(r => this.normalizeAuthResponse(r.data as any)));
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

  getPublicSpecialties(): Observable<{ id: string; name: string; description?: string }[]> {
    return this.http
      .get<ApiResponse<{ id: string; name: string; description?: string }[]>>(
        `${environment.apiUrl}/public/specialties`
      )
      .pipe(map(r => r.data));
  }

  getDoctors(): Observable<PortalDoctor[]> {
  return this.http
    .get<ApiResponse<any[]>>(`${environment.apiUrl}/public/doctors`)
    .pipe(
      map(r => r.data.map(d => ({
        id: d.id,
        doctorName: d.name ?? d.doctorName ?? d.fullName ?? 'Especialista',
        specialty: d.specialty ?? d.specialtyName ?? 'Sin especialidad',
        services: Array.isArray(d.services)
          ? d.services.map((s: any) =>
              typeof s === 'string'
                ? { id: '', name: s }
                : { id: s.id ?? '', name: s.name ?? s.serviceName ?? 'Servicio' }
            )
          : [],
        sede: d.sede,
        sedeId: d.sedeId ?? '',
        consultationFee: d.consultationFee ?? d.fee ?? 0,
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
    .get<ApiResponse<any[]>>(`${environment.apiUrl}/public/availability`, {
      params: { doctorId, date }
    })
    .pipe(
      map(r => r.data.map((s: any) => ({
        id: s.scheduleId ?? s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        sedeId: s.sedeId ?? '',
      })))
    );
}

bookAppointment(body: BookAppointmentRequest): Observable<any> {
  return this.http
    .post<ApiResponse<any>>(`${this.base}/appointments`, body)
    .pipe(
      map(r => r.data),
      catchError((err: HttpErrorResponse) => {
        // Compatibilidad con backend legado que expone /appointments fuera de /portal.
        if (err.status !== 404) {
          return throwError(() => err);
        }
        return this.http
          .post<ApiResponse<any>>(`${this.legacyBase}/appointments`, body)
          .pipe(map(r => r.data));
      })
    );
}
getPayments(): Observable<PortalPayment[]> {
  return this.http
    .get<ApiResponse<PortalPayment[]>>(`${this.base}/payments`)
    .pipe(map(r => r.data));
}

private normalizeAuthResponse(raw: any): PortalAuthResponse {
  const patient = raw?.patient ?? {};
  return {
    accessToken: raw?.accessToken ?? raw?.token ?? raw?.jwt ?? raw?.access_token ?? '',
    refreshToken: raw?.refreshToken ?? raw?.refresh_token ?? '',
    patientId: raw?.patientId ?? patient?.id ?? '',
    fullName: raw?.fullName ?? raw?.name ?? patient?.fullName ?? patient?.name ?? '',
    email: raw?.email ?? patient?.email ?? '',
    permissions: Array.isArray(raw?.permissions) ? raw.permissions : [],
  };
}
}