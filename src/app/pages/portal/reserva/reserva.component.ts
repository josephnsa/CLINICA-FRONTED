import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PortalService } from 'src/app/core/services/portal.service';
import { PortalSlot } from 'src/app/core/models/portal.model';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCardModule,
    MatSnackBarModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './reserva.component.html',
})
export class ReservaComponent implements OnInit {
  private svc   = inject(PortalService);
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading  = signal(false);
  saving   = signal(false);
  slots    = signal<PortalSlot[]>([]);
  patient  = this.svc.getPatient();
  today = new Date();

  doctorId  = signal<string | null>(null);
  specialty = signal<string | null>(null);

  form = this.fb.group({
    date:   ['', Validators.required],
    slotId: ['', Validators.required],
    notes:  [''],
  });

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.doctorId.set(p['doctorId'] ?? null);
      this.specialty.set(p['specialty'] ?? null);
    });

    this.form.controls.date.valueChanges.subscribe(date => {
  if (date && this.doctorId()) this.loadSlots(date);
});
  }

loadSlots(date: any) {
  const formatted = date instanceof Date
    ? date.toISOString().split('T')[0]
    : new Date(date).toISOString().split('T')[0];
  
  this.loading.set(true);
  this.slots.set([]);
  this.svc.getAvailability(this.doctorId()!, formatted).subscribe({
    next: (list) => { this.slots.set(list); this.loading.set(false); },
    error: () => this.loading.set(false),
  });
}

  submit() {
    if (this.form.invalid || !this.patient) return;
    this.saving.set(true);
    this.svc.bookAppointment({
      patientId:  this.patient.patientId,
      doctorId:   this.doctorId()!,
      slotId:     this.form.value.slotId!,
      notes:      this.form.value.notes ?? undefined,
    }).subscribe({
      next: () => {
        this.snack.open('Cita reservada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/portal/confirmaciones']);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Error al reservar, intenta nuevamente', 'Cerrar', { duration: 3000 });
      },
    });
  }

  goBack() {
    this.router.navigate(['/portal/busqueda']);
  }
}