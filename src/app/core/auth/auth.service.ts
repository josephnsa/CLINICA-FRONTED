import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  LoginData,
  JwtPayload,
  MenuItemDto,
  AuthMeData,
  RefreshTokenData,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly menuKey = 'auth_menu';

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success) {
            this.setSession(response.data);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.menuKey);
    this.router.navigate(['/authentication/login']);
  }

  loadMenu(): Observable<ApiResponse<MenuItemDto[]>> {
    return this.http
      .get<ApiResponse<MenuItemDto[]>>(`${this.baseUrl}/menu`)
      .pipe(
        tap((response: ApiResponse<MenuItemDto[]>) => {
          if (response.success) {
            localStorage.setItem(this.menuKey, JSON.stringify(response.data));
          }
        })
      );
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenData>> {
    const current = this.getCurrentUser();
    const refreshToken = current?.refreshToken;

    return this.http
      .post<ApiResponse<RefreshTokenData>>(`${this.baseUrl}/refresh`, null, {
        headers: refreshToken ? { 'Refresh-Token': refreshToken } : {},
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const updated: LoginData | null = this.getCurrentUser();
            if (updated) {
              const nextUser: LoginData = {
                ...updated,
                accessToken: response.data.accessToken,
              };
              this.setSession(nextUser);
            }
          }
        })
      );
  }

  getMe(): Observable<ApiResponse<AuthMeData>> {
    return this.http.get<ApiResponse<AuthMeData>>(`${this.baseUrl}/me`);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): LoginData | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as LoginData;
  }

  getTokenPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeJwt(token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodeJwt(token);
    if (!payload?.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  }

  private setSession(data: LoginData): void {
    localStorage.setItem(this.tokenKey, data.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(data));
  }

  private decodeJwt(token: string): JwtPayload | null {
    try {
      const payloadPart = token.split('.')[1];
      const decoded = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}

