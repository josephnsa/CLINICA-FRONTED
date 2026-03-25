import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-facturacion-pagos',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-title>Pagos</mat-card-title>
      <mat-card-content class="mt-4">
        <p class="text-sm text-slate-500 mb-4">
          Para registrar un pago, emita primero un comprobante en
          <strong>Comprobantes (boletas / facturas)</strong> y use el botón
          «Registrar pago» en el resumen, o acceda por URL con el ID del
          comprobante:
          <code>/facturacion/pagos/&#123;id&#125;</code>
        </p>
        <a mat-flat-button color="primary" routerLink="/facturacion/comprobantes">
          Ir a Comprobantes
        </a>
      </mat-card-content>
    </mat-card>
  `,
})
export class FacturacionPagosComponent {}
