import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse, ExamOrder, CreateExamOrderDto, ExamResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

getOrders(params: { patientId?: string; status?: string; page?: number; size?: number }) {
  let httpParams = new HttpParams()
    .set('page', String(params.page ?? 0))
    .set('size', String(params.size ?? 20));

  if (params.patientId) {
    httpParams = httpParams.set('patientId', params.patientId);
  }
  if (params.status) {
    httpParams = httpParams.set('status', params.status);
  }

  return this.http.get<ApiResponse<ExamOrder[]>>(
    `${this.baseUrl}/exams/orders`,
    { params: httpParams }
  );
}
  createOrder(body: CreateExamOrderDto) {
    return this.http.post<ApiResponse<ExamOrder>>(
      `${this.baseUrl}/exams/orders`,
      body
    );
  }

  registerResult(id: string, body: ExamResult) {
    return this.http.post<ApiResponse<ExamOrder>>(
      `${this.baseUrl}/exams/orders/${id}/result`,
      body
    );
  }

  signOrder(id: string) {
    return this.http.patch<ApiResponse<ExamOrder>>(
      `${this.baseUrl}/exams/orders/${id}/sign`,
      {}
    );
  }
}