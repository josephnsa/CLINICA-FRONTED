import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  DestroyRef,
  inject,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginResponse } from 'src/app/core/models';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-side-login',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  showGoogleFallback = false;
  hidePassword = true;
  readonly currentYear = new Date().getFullYear();
  readonly googleLoginEnabled = !!environment.googleClientId;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
    remember: [true],
  });

  readonly features: { icon: string; title: string; desc: string }[] = [
    {
      icon: 'calendar_month',
      title: 'Gestión de citas',
      desc: 'Agenda unificada, recordatorios y disponibilidad en tiempo real.',
    },
    {
      icon: 'description',
      title: 'Historia clínica',
      desc: 'Evolución clínica segura, notas y documentación centralizada.',
    },
    {
      icon: 'science',
      title: 'Exámenes y resultados',
      desc: 'Órdenes, seguimiento de laboratorio e integración de informes.',
    },
    {
      icon: 'receipt_long',
      title: 'Facturación electrónica',
      desc: 'Emisión, control de caja y trazabilidad contable.',
    },
    {
      icon: 'medication',
      title: 'Farmacia y stock',
      desc: 'Inventario, alertas de mínimos y trazabilidad de medicamentos.',
    },
    {
      icon: 'people',
      title: 'Gestión de pacientes',
      desc: 'Admisión, datos demográficos y acceso controlado por rol.',
    },
  ];

  ngAfterViewInit(): void {
    if (this.googleLoginEnabled) {
      this.waitForGoogleSdk();
      setTimeout(() => {
        const el = this.googleBtnRef?.nativeElement;
        const rendered = !!el?.children?.length;
        this.showGoogleFallback = !rendered;
      }, 2000);
    }
  }

  onSubmitCredentials(): void {
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password, remember } = this.loginForm.getRawValue();
    this.isLoading = true;
    this.authService
      .login({ email: email.trim(), password, remember })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LoginResponse) => {
          if (!response.success) {
            this.isLoading = false;
            this.toastr.error(response.message ?? 'Credenciales incorrectas', 'Inicio de sesión');
            return;
          }
          this.afterAuthSuccess();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error al conectar con el servidor', 'Inicio de sesión');
        },
      });
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    this.toastr.info('Contacte al administrador del sistema para restablecer su acceso.', 'Recuperar contraseña');
  }

  contactAdmin(event: Event): void {
    event.preventDefault();
    this.toastr.info('Su administrador puede ayudarle con accesos y permisos.', 'Ayuda');
  }

  private waitForGoogleSdk(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleButton();
    } else {
      setTimeout(() => this.waitForGoogleSdk(), 150);
    }
  }

  private initGoogleButton(): void {
    const host = this.googleBtnRef?.nativeElement;
    if (!host) return;
    host.innerHTML = '';
    const containerWidth = host.offsetWidth || 300;
    const buttonWidth = Math.min(containerWidth, 400);
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      },
    });
    google.accounts.id.renderButton(host, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: buttonWidth,
      locale: 'es',
    });
    this.showGoogleFallback = false;
  }

  retryGoogleButton(): void {
    this.showGoogleFallback = false;
    this.waitForGoogleSdk();
  }

  private handleGoogleCredential(idToken: string): void {
    this.isLoading = true;
    this.authService
      .googleLogin(idToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LoginResponse) => {
          if (!response.success) {
            this.isLoading = false;
            this.toastr.error(response.message ?? 'Error al iniciar sesión con Google', 'Google Sign-In');
            return;
          }
          this.afterAuthSuccess();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error al conectar con el servidor', 'Google Sign-In');
        },
      });
  }

  private afterAuthSuccess(): void {
    this.authService
      .loadMenu()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Bienvenido al sistema', 'Inicio de sesión');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error al cargar el menú', 'Inicio de sesión');
        },
      });
  }
}
