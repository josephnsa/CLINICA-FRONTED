import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HeaderUserDto, NotificationSummaryDto } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getHeaderUser(): Observable<ApiResponse<HeaderUserDto>> {
    return this.http.get<ApiResponse<HeaderUserDto>>(`${this.base}/me`);
  }

  getNotifications(sedeId: string): Observable<ApiResponse<NotificationSummaryDto>> {
    return this.http.get<ApiResponse<NotificationSummaryDto>>(
      `${this.base}/notifications`,
      { params: { sedeId } }
    );
  }
}
