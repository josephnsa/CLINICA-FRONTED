import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterLink],
  template: `
    <div class="hci-mod hc-page flex flex-col gap-5">
      <header class="hci-mod__hero">
        <div class="hci-mod__titles">
          <h1 class="hci-mod__title">Pagos</h1>
          <p class="hci-mod__subtitle">
            Registro de pagos sobre comprobantes emitidos.
          </p>
        </div>
      </header>

      <mat-card class="cardWithShadow hci-mod-table-card max-w-3xl">
        <mat-card-content class="mt-4 !pt-6" [formGroup]="form">
          <p class="text-sm text-slate-500 mb-4">
            Ingresa el ID del comprobante para ir directo al registro de pago,
            o emite un comprobante nuevo desde el módulo de comprobantes.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
            <mat-form-field appearance="outline">
              <mat-label>ID del comprobante</mat-label>
              <input matInput formControlName="invoiceId" />
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="button"
              class="md:mt-1"
              (click)="goToPayment()"
            >
              Continuar
            </button>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-stroked-button color="primary" routerLink="/facturacion/comprobantes">
            Ir a Comprobantes
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class FacturacionPagosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  form = this.fb.group({
    invoiceId: ['', Validators.required],
  });

  goToPayment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Ingresa el ID del comprobante', 'Pagos');
      return;
    }

    const invoiceId = this.form.controls.invoiceId.value?.trim();
    if (!invoiceId) {
      this.toastr.warning('Ingresa el ID del comprobante', 'Pagos');
      return;
    }

    this.router.navigate(['/facturacion/pagos', invoiceId]);
  }
}
