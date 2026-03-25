import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-facturacion-proformas',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-title>Proformas / presupuestos</mat-card-title>
      <mat-card-content class="mt-4">
        <p class="text-sm text-slate-500">
          Módulo en desarrollo. Aquí se gestionarán proformas y presupuestos.
        </p>
      </mat-card-content>
    </mat-card>
  `,
})
export class FacturacionProformasComponent {}
