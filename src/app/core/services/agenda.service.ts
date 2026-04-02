import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  AppointmentResponse,
  AvailabilitySlot,
  AvailabilityRule,
  AvailabilityBlock,
  CreateAppointmentRequest,
  CreateAvailabilityRuleRequest,
  CreateAvailabilityBlockRequest,
  CreateTriageRequest,
  TriageResponse,
  RescheduleAppointmentRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Citas
  createAppointment(body: CreateAppointmentRequest) {
    return this.http.post<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments`, body
    );
  }

  getAppointmentsByPatient(patientId: string) {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.baseUrl}/appointments/patient/${patientId}`
    );
  }

  getAllAppointments(params?: { page?: number; size?: number }) {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 0))
      .set('size', String(params?.size ?? 200));
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.baseUrl}/appointments`,
      { params: httpParams }
    );
  }

  cancelAppointment(id: string, reason: string) {
    return this.http.delete<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}`,
      { body: { reason } }
    );
  }

  rescheduleAppointment(id: string, body: RescheduleAppointmentRequest) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/reschedule`, body
    );
  }

  confirmAppointment(id: string) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/confirm`, {}
    );
  }

  checkInAppointment(id: string) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/checkin`, {}
    );
  }

  startConsultation(id: string) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/start-consultation`, {}
    );
  }

  completeAppointment(id: string) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/complete`, {}
    );
  }

  markNoShow(id: string) {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/appointments/${id}/no-show`, {}
    );
  }

  // ── Disponibilidad ─────────────────────────────────
  getAvailability(params: { doctorId: string; sedeId: string; date: string }) {
    const httpParams = new HttpParams()
      .set('doctorId', params.doctorId)
      .set('sedeId', params.sedeId)
      .set('date', params.date);
    return this.http.get<ApiResponse<AvailabilitySlot[]>>(
      `${this.baseUrl}/appointments/availability`, { params: httpParams }
    );
  }

  getRules(doctorId: string) {
  return this.http.get<ApiResponse<AvailabilityRule[]>>(
    `${this.baseUrl}/availability/rules?doctorId=${doctorId}`
  );
}

  createRule(body: CreateAvailabilityRuleRequest) {
    return this.http.post<ApiResponse<AvailabilityRule>>(
      `${this.baseUrl}/availability/rules`, body
    );
  }

  deleteRule(ruleId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/availability/rules/${ruleId}`
    );
  }

 getBlocks(doctorId: string) {
  return this.http.get<ApiResponse<AvailabilityBlock[]>>(
    `${this.baseUrl}/availability/blocks?doctorId=${doctorId}`
  );
}

  createBlock(body: CreateAvailabilityBlockRequest) {
    return this.http.post<ApiResponse<AvailabilityBlock>>(
      `${this.baseUrl}/availability/blocks`, body
    );
  }

  deleteBlock(blockId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/availability/blocks/${blockId}`
    );
  }

  // ── Triaje ─────────────────────────────────────────
  registerTriage(body: CreateTriageRequest) {
    return this.http.post<ApiResponse<TriageResponse>>(
      `${this.baseUrl}/triage`, body
    );
  }

  getTriageByPatient(patientId: string) {
    return this.http.get<ApiResponse<TriageResponse[]>>(
      `${this.baseUrl}/triage/patient/${patientId}`
    );
  }

  getTriageByAppointment(appointmentId: string) {
    return this.http.get<ApiResponse<TriageResponse[]>>(
      `${this.baseUrl}/triage/appointment/${appointmentId}`
    );
  }
}