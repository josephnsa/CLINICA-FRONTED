import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PortalService } from 'src/app/core/services/portal.service';
import { PortalPayment } from 'src/app/core/models/portal.model';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './pagos.component.html',
})
export class PagosComponent {
  private svc    = inject(PortalService);
  private router = inject(Router);

  patient = this.svc.getPatient();

  logout() {
    this.svc.logout();
    this.router.navigate(['/portal/registro']);
  }
}