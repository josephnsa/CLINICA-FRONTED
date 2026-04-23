import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import { Complaint, CreateComplaintRequest, ResolveComplaintRequest, CreateSurveyRequest, SatisfactionSurvey } from '../models/customer-service.model';

@Injectable({ providedIn: 'root' })
export class CustomerServiceService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/customer-service`;

  createComplaint(body: CreateComplaintRequest): Observable<Complaint> {
    return this.http.post<ApiResponse<Complaint>>(`${this.base}/complaints`, body)
      .pipe(map(r => r.data));
  }

  resolveComplaint(id: string, body: ResolveComplaintRequest): Observable<Complaint> {
    return this.http.patch<ApiResponse<Complaint>>(`${this.base}/complaints/${id}/resolve`, body)
      .pipe(map(r => r.data));
  }

  createSurvey(body: CreateSurveyRequest): Observable<SatisfactionSurvey> {
    return this.http.post<ApiResponse<SatisfactionSurvey>>(`${this.base}/surveys`, body)
      .pipe(map(r => r.data));
  }
  getComplaints(filters?: { patientId?: string; sedeId?: string; status?: string }): Observable<Complaint[]> {
  let params = new HttpParams();
  if (filters?.patientId) params = params.set('patientId', filters.patientId);
  if (filters?.sedeId)    params = params.set('sedeId', filters.sedeId);
  if (filters?.status)    params = params.set('status', filters.status);

  return this.http
    .get<ApiResponse<Complaint[]>>(`${this.base}/complaints`, { params })
    .pipe(map(r => r.data));
}

getComplaint(id: string): Observable<Complaint> {
  return this.http
    .get<ApiResponse<Complaint>>(`${this.base}/complaints/${id}`)
    .pipe(map(r => r.data));
}

getSurveys(filters?: { patientId?: string; appointmentId?: string }): Observable<SatisfactionSurvey[]> {
  let params = new HttpParams();
  if (filters?.patientId)     params = params.set('patientId', filters.patientId);
  if (filters?.appointmentId) params = params.set('appointmentId', filters.appointmentId);

  return this.http
    .get<ApiResponse<SatisfactionSurvey[]>>(`${this.base}/surveys`, { params })
    .pipe(map(r => r.data));
}
}