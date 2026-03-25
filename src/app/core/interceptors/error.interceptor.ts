import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.toastr.warning('Sesión expirada', 'Autenticación');
        } else if (error.status === 403) {
          this.toastr.error('Sin permisos para esta acción', 'Permisos');
        } else if (error.status === 404) {
          this.toastr.error(
            'El recurso solicitado no existe',
            'Recurso no encontrado'
          );
        } else if (error.status === 422) {
          const backendMessage =
            (error.error && (error.error.message as string)) ||
            'Datos inválidos. Verifica la información ingresada.';
          this.toastr.error(backendMessage, 'Validación');
        } else if (error.status >= 500) {
          this.toastr.error(
            'Error interno del servidor. Intenta nuevamente.',
            'Servidor'
          );
        }

        return throwError(() => error);
      })
    );
  }
}

