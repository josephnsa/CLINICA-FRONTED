import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  PageResponse,
  ClinicalService,
  Specialty,
  Doctor,
  Cie10Diagnosis,
  Medication,
  Tariff,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getServices(params: {
    search?: string;
    specialtyId?: string | null;
    active?: boolean;
    page?: number;
    size?: number;
  }) {
    let httpParams = new HttpParams()
      .set('search', params.search ?? '')
      .set('specialtyId', params.specialtyId ?? '')
      .set('active', String(params.active ?? true))
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<ClinicalService[]>>(
      `${this.baseUrl}/catalog/services`,
      { params: httpParams }
    );
  }

  getSpecialties() {
    return this.http.get<ApiResponse<Specialty[]>>(
      `${this.baseUrl}/catalog/specialties`
    );
  }

  getDoctors(params: { specialtyId?: string; q?: string }) {
    let httpParams = new HttpParams()
      .set('specialtyId', params.specialtyId ?? '')
      .set('q', params.q ?? '');

    return this.http.get<ApiResponse<Doctor[]>>(
      `${this.baseUrl}/catalog/doctors`,
      { params: httpParams }
    );
  }

  searchCie10(params: { code?: string; q?: string; page?: number; size?: number }) {
    let httpParams = new HttpParams()
      .set('code', params.code ?? '')
      .set('q', params.q ?? '')
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<PageResponse<Cie10Diagnosis>>>(
      `${this.baseUrl}/catalog/cie10`,
      { params: httpParams }
    );
  }

  getMedications(params: { code?: string; q?: string; active?: boolean; page?: number; size?: number }) {
    let httpParams = new HttpParams()
      .set('code', params.code ?? '')
      .set('q', params.q ?? '')
      .set('active', String(params.active ?? true))
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<PageResponse<Medication>>>(
      `${this.baseUrl}/catalog/medications`,
      { params: httpParams }
    );
  }

  getTariffs(params: { sedeId: string; serviceId?: string; page?: number; size?: number }) {
    let httpParams = new HttpParams()
      .set('sedeId', params.sedeId)
      .set('serviceId', params.serviceId ?? '')
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<PageResponse<Tariff>>>(
      `${this.baseUrl}/catalog/tariffs`,
      { params: httpParams }
    );
  }
}

