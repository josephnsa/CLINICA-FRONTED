import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, switchMap } from 'rxjs';
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

  // ── Estado reactivo ──────────────────────────────────────────────────────────
  private readonly _currentUser = signal<LoginData | null>(this.loadStoredUser());

  /** Rol actual del usuario como signal (reactivo). */
  readonly currentRole = computed(() => this._currentUser()?.role ?? '');

  /** Permisos actuales como signal (reactivo). */
  readonly currentPermissions = computed(() => this._currentUser()?.permissions ?? []);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Devuelve true si el usuario tiene el permiso indicado. */
  hasPermission(permission: string): boolean {
    return this._currentUser()?.permissions?.includes(permission) ?? false;
  }

  /** Devuelve el código de rol actual (ej. 'ADMIN', 'MEDICO'). */
  getRole(): string {
    return this._currentUser()?.role ?? '';
  }

  /** Devuelve true si el usuario tiene el rol indicado. */
  hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  // ── Auth flows ────────────────────────────────────────────────────────────────

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

  googleLogin(idToken: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/google/login`, { idToken }, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
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
    this._currentUser.set(null);
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

  /**
   * Sincroniza el rol y permisos del usuario con el backend.
   * Útil para detectar cambios de rol sin cerrar sesión.
   * Llama a /api/auth/me y actualiza localStorage + signal si cambia el rol.
   */
  syncSession(): Observable<void> {
    return this.getMe().pipe(
      tap((response) => {
        if (response.success) {
          const current = this.getCurrentUser();
          if (current && current.role !== response.data.role) {
            const updated: LoginData = {
              ...current,
              role: response.data.role,
              permissions: response.data.permissions,
            };
            this.setSession(updated);
          }
        }
      }),
      map(() => void 0),
      catchError(() => of(void 0))
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
    return this._currentUser();
  }

  getTokenPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeJwt(token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeJwt(token);
    if (!payload?.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  }

  // ── Internos ─────────────────────────────────────────────────────────────────

  private setSession(data: LoginData): void {
    localStorage.setItem(this.tokenKey, data.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(data));
    this._currentUser.set(data);
  }

  private loadStoredUser(): LoginData | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? (JSON.parse(stored) as LoginData) : null;
    } catch {
      return null;
    }
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
