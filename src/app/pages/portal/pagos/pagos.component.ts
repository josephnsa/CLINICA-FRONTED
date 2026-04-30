import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from 'src/app/core/services/portal.service';
import { PortalPayment } from 'src/app/core/models/portal.model';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './pagos.component.html',
})
export class PagosComponent implements OnInit {
  private svc    = inject(PortalService);
  private router = inject(Router);

  patient = this.svc.getPatient();
  loading = signal(false);
  payments = signal<PortalPayment[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.svc.getPayments().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700',
      PENDING: 'bg-amber-100 text-amber-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700';
  }

  logout() {
    this.svc.logout();
    this.router.navigate(['/portal/registro']);
  }
}