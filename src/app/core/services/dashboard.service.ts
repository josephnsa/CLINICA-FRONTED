import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardPerformanceDto,
  DashboardRecentTransactionDto,
  DashboardRevenuePointDto,
  DashboardSummaryDto,
  DashboardYearlyBreakupDto,
  HeaderUserDto,
  NotificationSummaryDto,
} from '../models/dashboard.model';

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

  getSummary(sedeId: string, year?: number): Observable<ApiResponse<DashboardSummaryDto>> {
    const params: Record<string, string> = { sedeId };
    if (year) params['year'] = String(year);
    return this.http.get<ApiResponse<DashboardSummaryDto>>(`${this.base}/summary`, { params });
  }

  getRevenue(sedeId: string, year?: number): Observable<ApiResponse<DashboardRevenuePointDto[]>> {
    const params: Record<string, string> = { sedeId };
    if (year) params['year'] = String(year);
    return this.http.get<ApiResponse<DashboardRevenuePointDto[]>>(`${this.base}/revenue`, { params });
  }

  getYearlyBreakup(sedeId: string): Observable<ApiResponse<DashboardYearlyBreakupDto>> {
    return this.http.get<ApiResponse<DashboardYearlyBreakupDto>>(`${this.base}/yearly-breakup`, {
      params: { sedeId },
    });
  }

  getRecentTransactions(
    sedeId: string,
    limit?: number
  ): Observable<ApiResponse<DashboardRecentTransactionDto[]>> {
    const params: Record<string, string> = { sedeId };
    if (limit) params['limit'] = String(limit);
    return this.http.get<ApiResponse<DashboardRecentTransactionDto[]>>(
      `${this.base}/recent-transactions`,
      { params }
    );
  }

  getPerformance(
    sedeId: string,
    month?: number,
    year?: number
  ): Observable<ApiResponse<DashboardPerformanceDto[]>> {
    const params: Record<string, string> = { sedeId };
    if (month) params['month'] = String(month);
    if (year) params['year'] = String(year);
    return this.http.get<ApiResponse<DashboardPerformanceDto[]>>(`${this.base}/performance`, {
      params,
    });
  }
}
