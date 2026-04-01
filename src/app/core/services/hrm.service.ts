import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Employee,
  CreateEmployeeRequest,
  EmployeeSchedule,
  CreateScheduleRequest,
} from '../models/hrm.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class HrmService {
  private http = inject(HttpClient);
  // `environment.apiUrl` ya incluye `/api`
  private base = `${environment.apiUrl}/hrm`;

  // ── Empleados ──────────────────────────────────────────────
 getEmployees(): Observable<Employee[]> {
  const token = localStorage.getItem('auth_token');
  const payload = JSON.parse(atob(token!.split('.')[1]));
  const sedeId = payload.sedeId;

  const params: any = {};
  if (sedeId && sedeId !== '') params['sedeId'] = sedeId;

  return this.http
    .get<ApiResponse<Employee[]>>(`${this.base}/employees`, { params })
    .pipe(map((r) => r.data));
}

  createEmployee(body: CreateEmployeeRequest): Observable<Employee> {
    return this.http
      .post<ApiResponse<Employee>>(`${this.base}/employees`, body)
      .pipe(map((r) => r.data));
  }

  deactivateEmployee(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/employees/${id}`)
      .pipe(map(() => undefined));
  }

  // ── Horarios ───────────────────────────────────────────────
  getSchedules(employeeId: string): Observable<EmployeeSchedule[]> {
    return this.http
      .get<ApiResponse<EmployeeSchedule[]>>(
        `${this.base}/employees/${employeeId}/schedules`,
        { params: { activeOnly: 'true' } }
      )
      .pipe(map((r) => r.data));
  }

  createSchedule(body: CreateScheduleRequest): Observable<EmployeeSchedule> {
    return this.http
      .post<ApiResponse<EmployeeSchedule>>(
        `${this.base}/employees/schedules`,
        body
      )
      .pipe(map((r) => r.data));
  }

  deleteSchedule(scheduleId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(
        `${this.base}/employees/schedules/${scheduleId}`
      )
      .pipe(map(() => undefined));
  }
}