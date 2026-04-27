import { Component, AfterViewInit, ViewChild, ElementRef, DestroyRef, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [CommonModule, MaterialModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef;

  private readonly router     = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastr     = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone     = inject(NgZone);

  isLoading = false;
  showGoogleFallback = false;
  readonly currentYear = new Date().getFullYear();

  readonly features = [
    { icon: 'calendar_month', label: 'Online appointments'        },
    { icon: 'description',    label: 'Electronic medical records' },
    { icon: 'science',        label: 'Exam management'            },
    { icon: 'receipt_long',   label: 'Billing'                    },
    { icon: 'medication',     label: 'Pharmacy'                   },
  ];

  ngAfterViewInit(): void {
    if (environment.googleClientId) {
      this.waitForGoogleSdk();
      setTimeout(() => {
        const rendered = !!this.googleBtnRef?.nativeElement?.children?.length;
        this.showGoogleFallback = !rendered;
      }, 2000);
    }
  }

  private waitForGoogleSdk(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleButton();
    } else {
      setTimeout(() => this.waitForGoogleSdk(), 150);
    }
  }

  private initGoogleButton(): void {
    this.googleBtnRef.nativeElement.innerHTML = '';
    const containerWidth = this.googleBtnRef.nativeElement.offsetWidth || 300;
    const buttonWidth = Math.min(containerWidth, 400);
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      },
    });
    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      theme: 'filled_blue',
      size:  'large',
      text:  'continue_with',
      shape: 'rectangular',
      width: buttonWidth,
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
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error al conectar con el servidor', 'Google Sign-In');
        },
      });
  }
}