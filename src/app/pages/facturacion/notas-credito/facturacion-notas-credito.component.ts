import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { BillingService } from 'src/app/core/services/billing.service';
import { ApiResponse, InvoiceResponse } from 'src/app/core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion-notas-credito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <div class="hci-mod hc-page flex flex-col gap-5">
      <header class="hci-mod__hero">
        <div class="hci-mod__titles">
          <h1 class="hci-mod__title">Notas de crédito / devoluciones</h1>
          <p class="hci-mod__subtitle">
            Busca un comprobante pagado y ejecútale devolución.
          </p>
        </div>
      </header>

      <mat-card class="cardWithShadow hci-mod-table-card max-w-3xl">
        <mat-card-content class="mt-4 !pt-6" [formGroup]="form">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
            <mat-form-field appearance="outline">
              <mat-label>ID del comprobante</mat-label>
              <input matInput formControlName="invoiceId" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="button" class="md:mt-1" (click)="loadInvoice()">
              Consultar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="invoice" class="cardWithShadow hci-mod-table-card max-w-3xl">
        <mat-card-content class="mt-4 !pt-6 text-sm space-y-1">
          <div><strong>Número:</strong> {{ invoice.number }}</div>
          <div><strong>Paciente:</strong> {{ invoice.patient.fullName }}</div>
          <div><strong>Estado:</strong> {{ invoice.status }}</div>
          <div><strong>Total:</strong> {{ invoice.total | currency:'USD':'symbol':'1.2-2' }}</div>
          <div><strong>Saldo:</strong> {{ invoice.balance | currency:'USD':'symbol':'1.2-2' }}</div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button
            mat-flat-button
            color="warn"
            type="button"
            [disabled]="invoice.status !== 'PAGADO' && invoice.status !== 'PAID'"
            (click)="refundInvoice()"
          >
            Generar nota de crédito
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class FacturacionNotasCreditoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingService);
  private readonly toastr = inject(ToastrService);

  invoice: InvoiceResponse | null = null;

  form = this.fb.group({
    invoiceId: ['', Validators.required],
  });

  loadInvoice(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const invoiceId = this.form.controls.invoiceId.value?.trim();
    if (!invoiceId) return;

    this.billingService.getInvoice(invoiceId).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo consultar el comprobante');
          return;
        }
        this.invoice = resp.data;
      },
      error: () => this.toastr.error('No se pudo consultar el comprobante'),
    });
  }

  refundInvoice(): void {
    if (!this.invoice) return;
    this.billingService.refundInvoice(this.invoice.id).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo generar la devolución');
          return;
        }
        this.invoice = resp.data;
        this.toastr.success('Nota de crédito/devolución aplicada', 'Facturación');
      },
      error: () => this.toastr.error('No se pudo generar la devolución'),
    });
  }
}
