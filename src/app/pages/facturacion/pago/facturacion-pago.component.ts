import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import {
  ApiResponse,
  InvoiceResponse,
  PaymentMethod,
  PaymentRequest,
} from 'src/app/core/models';
import { BillingService } from 'src/app/core/services/billing.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './facturacion-pago.component.html',
})
export class FacturacionPagoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly billingService = inject(BillingService);
  private readonly toastr = inject(ToastrService);

  invoice: InvoiceResponse | null = null;
  isLoadingInvoice = false;
  isSaving = false;

  form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['EFECTIVO' as PaymentMethod, Validators.required],
    reference: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    }
  }

  loadInvoice(id: string): void {
    this.isLoadingInvoice = true;
    this.billingService.getInvoice(id).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        this.isLoadingInvoice = false;
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo cargar el comprobante');
          return;
        }
        this.invoice = resp.data;
        const defaultAmount =
          resp.data.balance && resp.data.balance > 0
            ? resp.data.balance
            : resp.data.total;
        this.form.patchValue({ amount: defaultAmount });
      },
      error: () => {
        this.isLoadingInvoice = false;
      },
    });
  }

  registerPayment(): void {
    if (!this.invoice || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload: PaymentRequest = {
      invoiceId: this.invoice.id,
      amount: Number(raw.amount),
      method: raw.method!,
      reference: raw.reference || undefined,
    };

    this.isSaving = true;
    this.billingService.createPayment(payload).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        this.isSaving = false;
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo registrar el pago');
          return;
        }
        this.invoice = resp.data;
        this.toastr.success('Pago registrado correctamente', 'Facturación');
        this.router.navigate(['/facturacion/comprobantes']);
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }
}

