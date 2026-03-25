import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  PageResponse,
  UserSummary,
  UserListResponse,
  Role,
  Permission,
  AuditLog,
  AuditLogListResponse,
  Sede,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(params: {
    search?: string;
    role?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }) {
    let httpParams = new HttpParams()
      .set('search', params.search ?? '')
      .set('role', params.role ?? '')
      .set('active', params.active === undefined ? '' : String(params.active))
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<UserListResponse>>(
      `${this.baseUrl}/security/users`,
      { params: httpParams }
    );
  }

  getRoles() {
    return this.http.get<ApiResponse<Role[]>>(
      `${this.baseUrl}/security/roles`
    );
  }

  getPermissions() {
    return this.http.get<ApiResponse<Permission[]>>(
      `${this.baseUrl}/security/permissions`
    );
  }

  getAuditLogs(params: {
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) {
    let httpParams = new HttpParams()
      .set('userId', params.userId ?? '')
      .set('action', params.action ?? '')
      .set('from', params.from ?? '')
      .set('to', params.to ?? '')
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    return this.http.get<ApiResponse<AuditLogListResponse>>(
      `${this.baseUrl}/security/audit-logs`,
      { params: httpParams }
    );
  }

  getSedes() {
    return this.http.get<ApiResponse<Sede[]>>(
      `${this.baseUrl}/catalog/sedes`
    );
  }

  updateUserSedes(userId: string, sedeIds: string[]) {
    return this.http.post<ApiResponse<UserSummary>>(
      `${this.baseUrl}/security/users/${userId}/sedes`,
      { sedeIds }
    );
  }
}

