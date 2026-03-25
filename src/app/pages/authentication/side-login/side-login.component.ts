import { Component, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginRequest, LoginResponse } from 'src/app/core/models';

@Component({
  selector: 'app-side-login',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = false;
  hidePassword = true;

  form = new FormGroup({
    email: new FormControl<string>('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    remember: new FormControl<boolean>(false, { nonNullable: true }),
  });

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: LoginRequest = {
      email: value.email ?? '',
      password: value.password ?? '',
      remember: value.remember ?? false,
    };

    this.isLoading = true;

    this.authService
      .login(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: LoginResponse) => {
          if (!response.success) {
            this.isLoading = false;
            this.toastr.error(
              response.message ?? 'Credenciales inválidas',
              'Inicio de sesión'
            );
            return;
          }

          this.authService
            .loadMenu()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.isLoading = false;
                this.toastr.success(
                  'Bienvenido al sistema',
                  'Inicio de sesión'
                );
                this.router.navigate(['/dashboard']);
              },
              error: () => {
                this.isLoading = false;
              },
            });
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
