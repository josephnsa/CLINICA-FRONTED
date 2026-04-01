import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerServiceService } from '../../../core/services/customer-service.service';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-encuestas',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule,MatCardModule,
  ],
  templateUrl: './encuestas.component.html',
})
export class EncuestasComponent {
  private svc = inject(CustomerServiceService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  saving = signal(false);
  selectedScore = signal<number | null>(null);

  scores = [
    { value: 5, label: 'Excelente', icon: '😄' },
    { value: 4, label: 'Bueno', icon: '🙂' },
    { value: 3, label: 'Regular', icon: '😐' },
    { value: 2, label: 'Malo', icon: '😕' },
    { value: 1, label: 'Muy malo', icon: '😞' },
  ];

  form = this.fb.group({
    patientId: ['', Validators.required],
    appointmentId: ['', Validators.required],
    comment: [''],
  });

  selectScore(value: number) {
    this.selectedScore.set(value);
  }
  showForm = signal(false);
openForm() { this.showForm.set(true); this.form.reset(); }
cancelForm() { this.showForm.set(false); }

  submit() {
    if (this.form.invalid || !this.selectedScore()) return;
    this.saving.set(true);
    const auth = JSON.parse(localStorage.getItem('auth_token') ?? '{}');
    this.svc.createSurvey({
      patientId: this.form.value.patientId!,
      appointmentId: this.form.value.appointmentId!,
      sedeId: auth.sedeId ?? '',
      score: this.selectedScore()!,
      comment: this.form.value.comment ?? undefined,
    }).subscribe({
      next: () => {
        this.snack.open('Encuesta registrada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/atencion-cliente']);
      },
      error: () => { this.saving.set(false); this.snack.open('Error al registrar', 'Cerrar', { duration: 3000 }); },
    });
  }
}