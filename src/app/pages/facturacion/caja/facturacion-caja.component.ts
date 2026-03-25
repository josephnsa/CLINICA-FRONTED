import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { BillingService } from 'src/app/core/services/billing.service';
import { SecurityService } from 'src/app/core/services/security.service';
import { ApiResponse, CashRegisterSummary, Sede } from 'src/app/core/models';

@Component({
  selector: 'app-facturacion-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './facturacion-caja.component.html',
})
export class FacturacionCajaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingService);
  private readonly securityService = inject(SecurityService);

  filtersForm = this.fb.group({
    sedeId: [''],
    date: [new Date()],
  });

  sedes: Sede[] = [];
  summary: CashRegisterSummary | null = null;
  isLoading = false;

  displayedColumns = ['method', 'amount', 'count'];

  get selectedSedeName(): string {
    const id = this.filtersForm.get('sedeId')?.value;
    const s = this.sedes.find((x) => x.id === id);
    return s ? s.name : this.summary?.sedeName ?? '';
  }

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

  search(): void {
    const { sedeId, date } = this.filtersForm.value;
    if (!sedeId || !date) {
      return;
    }

    const d = date as Date;
    const iso = d.toISOString().slice(0, 10);

    this.isLoading = true;
    this.billingService
      .getCashRegisterSummary({ sedeId, date: iso })
      .subscribe({
        next: (resp: ApiResponse<CashRegisterSummary>) => {
          this.summary = resp.data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}

