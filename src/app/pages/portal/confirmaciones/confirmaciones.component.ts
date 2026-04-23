import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PortalService } from 'src/app/core/services/portal.service';
import { PortalAppointment } from 'src/app/core/models/portal.model';

@Component({
  selector: 'app-confirmaciones',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule,
  ],
  templateUrl: './confirmaciones.component.html',
})
export class ConfirmacionesComponent implements OnInit {
  private svc    = inject(PortalService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  appointments = signal<PortalAppointment[]>([]);
  loading      = signal(false);
  patient      = this.svc.getPatient();

  statusLabels: Record<string, string> = {
    SCHEDULED:   'Programada',
    CONFIRMED:   'Confirmada',
    ATTENDED:    'Atendida',
    CANCELLED:   'Cancelada',
    NO_SHOW:     'No asistió',
    RESCHEDULED: 'Reprogramada',
  };

  ngOnInit() {
    this.loading.set(true);
    this.svc.getAppointments().subscribe({
      next: (list) => { this.appointments.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar tus citas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED:   'bg-blue-100 text-blue-700',
      CONFIRMED:   'bg-green-100 text-green-700',
      ATTENDED:    'bg-gray-100 text-gray-600',
      CANCELLED:   'bg-red-100 text-red-600',
      NO_SHOW:     'bg-orange-100 text-orange-600',
      RESCHEDULED: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  nueva() {
    this.router.navigate(['/portal/busqueda']);
  }

  logout() {
    this.svc.logout();
    this.router.navigate(['/portal/registro']);
  }
}