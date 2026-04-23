import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalService } from '../services/portal.service';

@Injectable()
export class PortalInterceptor implements HttpInterceptor {
  constructor(private readonly portalService: PortalService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Solo aplicar a rutas del portal
    if (!req.url.includes('/api/portal')) {
      return next.handle(req);
    }

    const token = this.portalService.getToken();

    // Las rutas de auth no necesitan token
    const isAuthRequest =
      req.url.includes('/auth/login') || req.url.includes('/auth/register');

    if (!token || isAuthRequest) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq);
  }
}
