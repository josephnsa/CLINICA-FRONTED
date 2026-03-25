import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-facturacion-notas-credito',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-title>Notas de crédito / devoluciones</mat-card-title>
      <mat-card-content class="mt-4">
        <p class="text-sm text-slate-500">
          Módulo en desarrollo. Aquí se gestionarán notas de crédito y devoluciones.
        </p>
      </mat-card-content>
    </mat-card>
  `,
})
export class FacturacionNotasCreditoComponent {}
