import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  UserSummary,
  UserListResponse,
  UserCreateRequest,
  UserUpdateRequest,
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
  private readonly preferScopedSecurity = true;

  private isNotFound(err: unknown): boolean {
    return !!err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
  }

  private getWithFallback<T>(
    scopedPath: string,
    legacyPath: string,
    options?: { params?: HttpParams }
  ): Observable<T> {
    const primary = this.preferScopedSecurity ? scopedPath : legacyPath;
    const secondary = this.preferScopedSecurity ? legacyPath : scopedPath;
    return this.http.get<T>(`${this.baseUrl}${primary}`, options).pipe(
      catchError((err) => {
        if (!this.isNotFound(err)) return throwError(() => err);
        return this.http.get<T>(`${this.baseUrl}${secondary}`, options);
      })
    );
  }

  private postWithFallback<T>(
    scopedPath: string,
    legacyPath: string,
    body: unknown
  ): Observable<T> {
    const primary = this.preferScopedSecurity ? scopedPath : legacyPath;
    const secondary = this.preferScopedSecurity ? legacyPath : scopedPath;
    return this.http.post<T>(`${this.baseUrl}${primary}`, body).pipe(
      catchError((err) => {
        if (!this.isNotFound(err)) return throwError(() => err);
        return this.http.post<T>(`${this.baseUrl}${secondary}`, body);
      })
    );
  }

  private putWithFallback<T>(
    scopedPath: string,
    legacyPath: string,
    body: unknown
  ): Observable<T> {
    const primary = this.preferScopedSecurity ? scopedPath : legacyPath;
    const secondary = this.preferScopedSecurity ? legacyPath : scopedPath;
    return this.http.put<T>(`${this.baseUrl}${primary}`, body).pipe(
      catchError((err) => {
        if (!this.isNotFound(err)) return throwError(() => err);
        return this.http.put<T>(`${this.baseUrl}${secondary}`, body);
      })
    );
  }

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

    return this.getWithFallback<ApiResponse<UserListResponse>>('/security/users', '/users', {
      params: httpParams,
    });
  }

  createUser(body: UserCreateRequest) {
    return this.postWithFallback<ApiResponse<UserSummary>>('/security/users', '/users', body);
  }

  updateUser(userId: string, body: UserUpdateRequest) {
    return this.putWithFallback<ApiResponse<UserSummary>>(
      `/security/users/${userId}`,
      `/users/${userId}`,
      body
    );
  }

  getRoles() {
    return this.getWithFallback<ApiResponse<Role[]>>('/security/roles', '/roles');
  }

  getPermissions() {
    return this.getWithFallback<ApiResponse<Permission[]>>('/security/permissions', '/permissions');
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

    return this.getWithFallback<ApiResponse<AuditLogListResponse>>('/security/audit-logs', '/audit', {
      params: httpParams,
    });
  }

  getSedes() {
    return this.http.get<ApiResponse<Sede[]>>(
      `${this.baseUrl}/catalog/sedes`
    );
  }

  updateUserSedes(userId: string, sedeIds: string[]) {
    return this.postWithFallback<ApiResponse<UserSummary>>(
      `/security/users/${userId}/sedes`,
      `/users/${userId}/sedes`,
      { sedeIds }
    );
  }
}

