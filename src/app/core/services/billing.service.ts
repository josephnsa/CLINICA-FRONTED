import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  CashRegisterSummary,
  CreateInvoiceRequest,
  InvoiceResponse,
  PaymentRequest,
  SunatStatusResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createInvoice(payload: CreateInvoiceRequest) {
    return this.http.post<ApiResponse<InvoiceResponse>>(
      `${this.baseUrl}/invoices`,
      payload
    );
  }

  getInvoice(id: string) {
    return this.http.get<ApiResponse<InvoiceResponse>>(
      `${this.baseUrl}/invoices/${id}`
    );
  }

  refundInvoice(invoiceId: string) {
    return this.http.patch<ApiResponse<InvoiceResponse>>(
      `${this.baseUrl}/invoices/${invoiceId}/refund`,
      {}
    );
  }

  createPayment(payload: PaymentRequest) {
    return this.http.post<ApiResponse<InvoiceResponse>>(
      `${this.baseUrl}/payments`,
      payload
    );
  }

  getCashRegisterSummary(params: { sedeId: string; date: string }) {
    const httpParams = new HttpParams()
      .set('sedeId', params.sedeId)
      .set('date', params.date);

    return this.http.get<ApiResponse<CashRegisterSummary>>(
      `${this.baseUrl}/invoices/cash-register-summary`,
      { params: httpParams }
    );
  }

  sendToSunat(invoiceId: string) {
    return this.http.post<ApiResponse<SunatStatusResponse>>(
      `${this.baseUrl}/invoices/${invoiceId}/send-sunat`,
      {}
    );
  }

  getSunatStatus(invoiceId: string) {
    return this.http.get<ApiResponse<SunatStatusResponse>>(
      `${this.baseUrl}/invoices/${invoiceId}/sunat-status`
    );
  }

  downloadInvoicePdf(invoiceId: string) {
    return this.http.get(`${this.baseUrl}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
  }
}

