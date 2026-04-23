import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { PortalService } from 'src/app/core/services/portal.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatTabsModule, MatCardModule,
  ],
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private svc    = inject(PortalService);
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading = signal(false);
  hidePass = signal(true);

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.svc.login(this.loginForm.value as any).subscribe({
      next: (auth) => {
        this.svc.saveSession(auth);
        this.router.navigate(['/portal/busqueda']);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Credenciales incorrectas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.svc.register(this.registerForm.value as any).subscribe({
      next: (auth) => {
        this.svc.saveSession(auth);
        this.router.navigate(['/portal/busqueda']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.status === 404
          ? 'No existe un paciente con ese email'
          : err.status === 409
          ? 'Ya tienes una cuenta registrada'
          : 'Error al registrarse';
        this.snack.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}