import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SecurityService } from 'src/app/core/services/security.service';
import { ApiResponse, Sede } from 'src/app/core/models';

@Component({
  selector: 'app-seguridad-parametros-sede',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './seguridad-parametros-sede.component.html',
})
export class SeguridadParametrosSedeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);

  sedes: Sede[] = [];

  ngOnInit(): void {
    this.loadSedes();
  }

  loadSedes(): void {
    this.securityService.getSedes().subscribe({
      next: (resp: ApiResponse<Sede[]>) => {
        this.sedes = resp.data;
      },
      error: () => {},
    });
  }
}

