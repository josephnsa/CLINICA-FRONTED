import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { CustomerServiceService } from '../../../core/services/customer-service.service';
import {
  Complaint, ComplaintType, ComplaintPriority,
  COMPLAINT_TYPE_LABELS, COMPLAINT_PRIORITY_LABELS, COMPLAINT_STATUS_LABELS
} from '../../../core/models/customer-service.model';

@Component({
  selector: 'app-reclamos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatCardModule,
  ],
  templateUrl: './reclamos.component.html',
})
export class ReclamosComponent {
  private svc = inject(CustomerServiceService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  complaints = signal<Complaint[]>([]);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  resolvingId = signal<string | null>(null);

  typeLabels = COMPLAINT_TYPE_LABELS;
  priorityLabels = COMPLAINT_PRIORITY_LABELS;
  statusLabels = COMPLAINT_STATUS_LABELS;

  typeOptions = Object.entries(COMPLAINT_TYPE_LABELS) as [ComplaintType, string][];
  priorityOptions = Object.entries(COMPLAINT_PRIORITY_LABELS) as [ComplaintPriority, string][];

  createForm = this.fb.group({
    patientId: ['', Validators.required],
    type: ['' as ComplaintType, Validators.required],
    priority: ['MEDIUM' as ComplaintPriority, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  resolveForm = this.fb.group({
    resolution: ['', Validators.required],
  });

  statusColor(s: string): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-700': s === 'PENDING',
      'bg-blue-100 text-blue-700': s === 'IN_PROGRESS',
      'bg-green-100 text-green-700': s === 'RESOLVED',
      'bg-gray-100 text-gray-500': s === 'CLOSED',
    };
  }

  openForm() {
    this.showForm.set(true);
    this.createForm.reset({ priority: 'MEDIUM' });
  }

  cancelForm() {
    this.showForm.set(false);
  }

  submitCreate() {
    if (this.createForm.invalid) return;
    this.saving.set(true);
    const auth = JSON.parse(localStorage.getItem('auth_token') ?? '{}');
    this.svc.createComplaint({
      patientId: this.createForm.value.patientId!,
      sedeId: auth.sedeId ?? '',
      type: this.createForm.value.type!,
      priority: this.createForm.value.priority!,
      description: this.createForm.value.description!,
    }).subscribe({
      next: (c) => {
        this.complaints.update(list => [c, ...list]);
        this.showForm.set(false);
        this.saving.set(false);
        this.snack.open('Reclamo registrado', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Error al registrar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openResolve(id: string) {
    this.resolvingId.set(id);
    this.resolveForm.reset();
  }

  cancelResolve() {
    this.resolvingId.set(null);
  }

  submitResolve() {
    if (this.resolveForm.invalid) return;
    const id = this.resolvingId()!;
    this.svc.resolveComplaint(id, { resolution: this.resolveForm.value.resolution! }).subscribe({
      next: (updated) => {
        this.complaints.update(list => list.map(c => c.id === id ? updated : c));
        this.resolvingId.set(null);
        this.snack.open('Reclamo resuelto', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snack.open('Error al resolver', 'Cerrar', { duration: 3000 }),
    });
  }
}