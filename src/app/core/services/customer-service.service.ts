import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}