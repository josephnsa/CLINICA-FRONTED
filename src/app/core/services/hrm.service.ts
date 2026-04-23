import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  Employee,
  CreateEmployeeRequest,
  EmployeeSchedule,
  CreateScheduleRequest,
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  ProductivityReport,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class HrmService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── Empleados ──────────────────────────────────────
  getEmployees(params?: { sedeId?: string; activeOnly?: boolean }) {
    let httpParams = new HttpParams();
    if (params?.sedeId) httpParams = httpParams.set('sedeId', params.sedeId);
    if (params?.activeOnly !== undefined) httpParams = httpParams.set('activeOnly', String(params.activeOnly));
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.baseUrl}/hrm/employees`, { params: httpParams }
    );
  }

  createEmployee(body: CreateEmployeeRequest) {
    return this.http.post<ApiResponse<Employee>>(
      `${this.baseUrl}/hrm/employees`, body
    );
  }

  deleteEmployee(id: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/hrm/employees/${id}`
    );
  }

  deactivateEmployee(id: string) {
    return this.http.patch<ApiResponse<Employee>>(
      `${this.baseUrl}/hrm/employees/${id}/deactivate`, {}
    );
  }

  // ── Horarios ───────────────────────────────────────
  getSchedules(employeeId: string) {
    return this.http.get<ApiResponse<EmployeeSchedule[]>>(
      `${this.baseUrl}/hrm/employees/${employeeId}/schedules`
    );
  }

  createSchedule(body: CreateScheduleRequest) {
    return this.http.post<ApiResponse<EmployeeSchedule>>(
      `${this.baseUrl}/hrm/employees/schedules`, body
    );
  }

  deleteSchedule(scheduleId: string) {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/hrm/employees/schedules/${scheduleId}`
    );
  }

  // ── Asistencia ─────────────────────────────────────
  checkIn(body: CheckInRequest) {
    return this.http.post<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/hrm/attendance/checkin`, body
    );
  }

  checkOut(body: CheckOutRequest) {
    return this.http.post<ApiResponse<AttendanceRecord>>(
      `${this.baseUrl}/hrm/attendance/checkout`, body
    );
  }

  getAttendance(params: { employeeId: string; from: string; to: string }) {
    const httpParams = new HttpParams()
      .set('employeeId', params.employeeId)
      .set('from', params.from)
      .set('to', params.to);
    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/hrm/attendance`, { params: httpParams }
    );
  }

  // ── Productividad ──────────────────────────────────
  getProductivity(employeeId: string, params: { from: string; to: string }) {
    const httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);
    return this.http.get<ApiResponse<ProductivityReport>>(
      `${this.baseUrl}/hrm/attendance/productivity/${employeeId}`, { params: httpParams }
    );
  }
}