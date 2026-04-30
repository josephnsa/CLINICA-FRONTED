import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from 'src/app/core/services/security.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { BillingService } from 'src/app/core/services/billing.service';
import {
  ApiResponse,
  ClinicalService,
  CreateInvoiceRequest,
  InvoiceResponse,
  Sede,
} from 'src/app/core/models';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';

@Component({
  selector: 'app-facturacion-proformas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, PatientAutocompleteFieldComponent],
  template: `
    <div class="hci-mod hc-page flex flex-col gap-5">
      <header class="hci-mod__hero">
        <div class="hci-mod__titles">
          <h1 class="hci-mod__title">Proformas / presupuestos</h1>
          <p class="hci-mod__subtitle">
            Crea una proforma en estado borrador para revisión previa al cobro.
          </p>
        </div>
      </header>

      <mat-card class="cardWithShadow hci-mod-table-card">
        <mat-card-content class="mt-4 !pt-6" [formGroup]="form">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Sede</mat-label>
              <mat-select formControlName="sedeId">
                <mat-option *ngFor="let s of sedes" [value]="s.id">
                  {{ s.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <app-patient-autocomplete-field
              label="Paciente"
              [idControl]="$any(form.controls.patientId)"
            />
          </div>

          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-base font-semibold">Ítems</h3>
              <button mat-stroked-button color="primary" type="button" (click)="addItem()">
                Agregar ítem
              </button>
            </div>

            <div class="hci-mod-table-wrap module-table-wrap">
              <table mat-table [dataSource]="items.controls" class="w-full">
                <ng-container matColumnDef="service">
                  <th mat-header-cell *matHeaderCellDef>Servicio</th>
                  <td mat-cell *matCellDef="let row; let i = index">
                    <mat-form-field appearance="outline" class="w-full" [formGroupName]="i">
                      <mat-select formControlName="serviceId" (selectionChange)="onServiceChange(i)">
                        <mat-option *ngFor="let s of services" [value]="s.id">
                          {{ s.code }} - {{ s.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Cant.</th>
                  <td mat-cell *matCellDef="let row; let i = index">
                    <mat-form-field appearance="outline" class="w-24" [formGroupName]="i">
                      <input matInput type="number" formControlName="quantity" />
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Precio</th>
                  <td mat-cell *matCellDef="let row; let i = index">
                    <mat-form-field appearance="outline" class="w-28" [formGroupName]="i">
                      <input matInput type="number" formControlName="unitPrice" />
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                  <td mat-cell *matCellDef="let row">
                    {{
                      (row.get('quantity')?.value || 0) * (row.get('unitPrice')?.value || 0)
                        | currency:'USD':'symbol':'1.2-2'
                    }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let row; let i = index">
                    <button mat-icon-button type="button" (click)="removeItem(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full mt-4">
            <mat-label>Notas</mat-label>
            <textarea matInput rows="2" formControlName="notes"></textarea>
          </mat-form-field>

          <div class="flex items-center justify-between mt-4">
            <div class="text-base font-semibold">
              Total: {{ total | currency:'USD':'symbol':'1.2-2' }}
            </div>
            <button mat-flat-button color="primary" type="button" (click)="createProforma()">
              Guardar proforma
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="createdProforma" class="cardWithShadow hci-mod-table-card">
        <mat-card-content class="mt-2 text-sm">
          <div><strong>ID:</strong> {{ createdProforma.id }}</div>
          <div><strong>Número:</strong> {{ createdProforma.number }}</div>
          <div><strong>Estado:</strong> {{ createdProforma.status }}</div>
          <div><strong>Total:</strong> {{ createdProforma.total | currency:'USD':'symbol':'1.2-2' }}</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class FacturacionProformasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);
  private readonly catalogService = inject(CatalogService);
  private readonly billingService = inject(BillingService);
  private readonly toastr = inject(ToastrService);

  sedes: Sede[] = [];
  services: ClinicalService[] = [];
  createdProforma: InvoiceResponse | null = null;
  displayedColumns = ['service', 'quantity', 'unitPrice', 'subtotal', 'actions'];

  form = this.fb.group({
    sedeId: ['', Validators.required],
    patientId: ['', Validators.required],
    notes: [''],
    items: this.fb.array([]),
  });

  ngOnInit(): void {
    this.addItem();
    this.securityService.getSedes().subscribe({
      next: (resp: ApiResponse<Sede[]>) => (this.sedes = resp.data.filter(s => s.isActive)),
    });
    this.catalogService.getServices({ activeOnly: true, page: 0, size: 100 }).subscribe({
      next: (resp: ApiResponse<ClinicalService[]>) => (this.services = resp.data),
    });
  }

  get items(): FormArray {
    return this.form.controls.items as FormArray;
  }

  get total(): number {
    return this.items.controls.reduce((acc, control) => {
      const quantity = Number(control.get('quantity')?.value) || 0;
      const unitPrice = Number(control.get('unitPrice')?.value) || 0;
      return acc + quantity * unitPrice;
    }, 0);
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
    if (this.items.length > 1) this.items.removeAt(index);
  }

  onServiceChange(index: number): void {
    const group = this.items.at(index);
    const serviceId = group.get('serviceId')?.value as string;
    const service = this.services.find((s) => s.id === serviceId);
    if (service) group.get('unitPrice')?.setValue(service.price);
  }

  createProforma(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload: CreateInvoiceRequest = {
      patientId: raw.patientId!,
      sedeId: raw.sedeId!,
      invoiceType: 'BOLETA',
      notes: raw.notes ?? undefined,
      isProforma: true,
      items: this.items.controls.map((c) => ({
        serviceId: c.get('serviceId')?.value,
        quantity: Number(c.get('quantity')?.value),
        unitPrice: Number(c.get('unitPrice')?.value),
      })),
    };

    this.billingService.createInvoice(payload).subscribe({
      next: (resp: ApiResponse<InvoiceResponse>) => {
        if (!resp.success) {
          this.toastr.error(resp.message || 'No se pudo crear la proforma');
          return;
        }
        this.createdProforma = resp.data;
        this.toastr.success('Proforma creada correctamente', 'Facturación');
      },
      error: () => this.toastr.error('Error al crear proforma', 'Facturación'),
    });
  }
}
