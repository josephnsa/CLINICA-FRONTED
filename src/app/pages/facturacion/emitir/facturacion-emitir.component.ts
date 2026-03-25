import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import {
  ApiResponse,
  ClinicalService,
  CreateInvoiceRequest,
  InvoiceResponse,
  PaymentMethod,
  Sede,
} from 'src/app/core/models';
import { SecurityService } from 'src/app/core/services/security.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { BillingService } from 'src/app/core/services/billing.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion-emitir',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './facturacion-emitir.component.html',
})
export class FacturacionEmitirComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);
  private readonly catalogService = inject(CatalogService);
  private readonly billingService = inject(BillingService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  sedes: Sede[] = [];
  services: ClinicalService[] = [];
  isLoading = false;

  invoiceForm = this.fb.group({
    sedeId: ['', Validators.required],
    patientId: ['', Validators.required],
    patientName: [''],
    invoiceType: ['BOLETA' as 'BOLETA' | 'FACTURA', Validators.required],
    paymentMethod: ['EFECTIVO' as PaymentMethod],
    items: this.fb.array([]),
  });

  emittedInvoice: InvoiceResponse | null = null;

  ngOnInit(): void {
    this.loadSedes();
    this.loadServices();
    if (this.items.length === 0) {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get total(): number {
    return this.items.controls.reduce((acc, control) => {
      const quantity = Number(control.get('quantity')?.value) || 0;
      const unitPrice = Number(control.get('unitPrice')?.value) || 0;
      return acc + quantity * unitPrice;
    }, 0);
  }

  loadSedes(): void {
    this.securityService.getSedes().subscribe({
      next: (resp: ApiResponse<Sede[]>) => {
        this.sedes = resp.data.filter((s) => s.isActive);
      },
      error: () => {},
    });
  }

  loadServices(): void {
    this.catalogService
      .getServices({ search: '', specialtyId: '', active: true, page: 0, size: 100 })
      .subscribe({
        next: (resp: ApiResponse<ClinicalService[]>) => {
          this.services = resp.data;
        },
        error: () => {},
      });
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        serviceId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onServiceChange(index: number): void {
    const group = this.items.at(index);
    const serviceId = group.get('serviceId')?.value as string;
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      group.get('unitPrice')?.setValue(service.price);
    }
  }

  emitInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const raw = this.invoiceForm.value;

    const payload: CreateInvoiceRequest = {
      patientId: raw.patientId!,
      sedeId: raw.sedeId!,
      invoiceType: raw.invoiceType!,
      paymentMethod: raw.paymentMethod || undefined,
      items: this.items.controls.map((c) => ({
        serviceId: c.get('serviceId')?.value,
        quantity: Number(c.get('quantity')?.value),
        unitPrice: Number(c.get('unitPrice')?.value),
      })),
    };

    this.isLoading = true;
    this.billingService.createInvoice(payload).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        this.isLoading = false;
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo emitir el comprobante');
          return;
        }
        this.emittedInvoice = resp.data;
        this.toastr.success(
          `Comprobante ${resp.data.number} emitido correctamente`,
          'Facturación'
        );
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goToPayment(): void {
    if (!this.emittedInvoice) {
      return;
    }
    this.router.navigate(['/facturacion/pagos', this.emittedInvoice.id]);
  }
}

