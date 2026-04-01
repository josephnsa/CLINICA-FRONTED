import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  ReportRequest,
  OperationalReportResponse,
  ClinicalReportResponse,
  FinancialReportResponse,
  InventoryReportResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  generateOperational(body: ReportRequest) {
    return this.http.post<ApiResponse<OperationalReportResponse>>(
      `${this.baseUrl}/reports/operational`, body
    );
  }

  generateClinical(body: ReportRequest) {
    return this.http.post<ApiResponse<ClinicalReportResponse>>(
      `${this.baseUrl}/reports/clinical`, body
    );
  }

  generateFinancial(body: ReportRequest) {
    return this.http.post<ApiResponse<FinancialReportResponse>>(
      `${this.baseUrl}/reports/financial`, body
    );
  }

  generateInventory(sedeId: string) {
  return this.http.get<ApiResponse<InventoryReportResponse>>(
    `${this.baseUrl}/reports/inventory?sedeId=${sedeId}`
  );
}
}