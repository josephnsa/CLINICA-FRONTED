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
    /** true = solo activos; false = todos (activos e inactivos). */
    activeOnly?: boolean;
    page?: number;
    size?: number;
  }) {
    let httpParams = new HttpParams();
    if (params.specialtyId) {
      httpParams = httpParams.set('specialtyId', params.specialtyId);
    }
    if (params.activeOnly !== undefined) {
      httpParams = httpParams.set('activeOnly', String(params.activeOnly));
    } else {
      httpParams = httpParams.set('activeOnly', 'true');
    }

    return this.http.get<ApiResponse<ClinicalService[]>>(
      `${this.baseUrl}/catalog/services`,
      { params: httpParams }
    );
  }

  createService(body: {
    code: string;
    name: string;
    specialtyId: string;
    durationMin: number;
    price: number;
    active?: boolean;
  }) {
    return this.http.post<ApiResponse<ClinicalService>>(
      `${this.baseUrl}/catalog/services`,
      {
        code: body.code,
        name: body.name,
        specialtyId: body.specialtyId,
        durationMin: body.durationMin,
        price: body.price,
        active: body.active ?? true,
      }
    );
  }

  updateService(
    id: string,
    body: {
      code: string;
      name: string;
      specialtyId: string | null;
      durationMin: number;
      price: number;
      isActive: boolean;
    }
  ) {
    return this.http.put<ApiResponse<ClinicalService>>(
      `${this.baseUrl}/catalog/services/${id}`,
      body
    );
  }

  deactivateService(id: string) {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/catalog/services/${id}`);
  }

  getSpecialties() {
    return this.http.get<ApiResponse<Specialty[]>>(
      `${this.baseUrl}/catalog/specialties`
    );
  }

  createSpecialty(body: { code: string; name: string }) {
    return this.http.post<ApiResponse<Specialty>>(
      `${this.baseUrl}/catalog/specialties`,
      body
    );
  }

  createDoctor(body: {
    userId: string;
    licenseNumber: string;
    specialtyId?: string | null;
  }) {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/catalog/doctors`,
      {
        userId: body.userId,
        licenseNumber: body.licenseNumber.trim(),
        specialtyId: body.specialtyId || null,
      }
    );
  }

  getDoctors(params: { specialtyId?: string; q?: string }) {
    let httpParams = new HttpParams();
    if (params.specialtyId?.trim()) {
      httpParams = httpParams.set('specialtyId', params.specialtyId.trim());
    }
    const q = params.q?.trim();
    if (q) {
      httpParams = httpParams.set('q', q);
    }

    return this.http.get<ApiResponse<Doctor[]>>(
      `${this.baseUrl}/catalog/doctors`,
      { params: httpParams }
    );
  }

  searchCie10(params: { code?: string; q?: string; page?: number; size?: number }) {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    const code = params.code?.trim();
    const q = params.q?.trim();
    if (code) {
      httpParams = httpParams.set('code', code);
    }
    if (q) {
      httpParams = httpParams.set('q', q);
    }

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

