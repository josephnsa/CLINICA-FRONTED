import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReportsService } from 'src/app/core/services/reports.service';
import { InventoryReportResponse } from 'src/app/core/models';
import { SedeAutocompleteFieldComponent } from 'src/app/shared/autocomplete/sede-autocomplete-field.component';

@Component({
  selector: 'app-inventario-reporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, SedeAutocompleteFieldComponent],
  templateUrl: './inventario.component.html',
})
export class InventarioReporteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportsService = inject(ReportsService);

  report: InventoryReportResponse | null = null;
  isLoading = false;

  filterForm = this.fb.group({
    sedeId: ['', Validators.required],
  });

  load(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    const sedeId = this.filterForm.get('sedeId')?.value || '';
    this.isLoading = true;
    this.reportsService.generateInventory(sedeId).subscribe({
      next: (resp) => { this.isLoading = false; this.report = resp.data; },
      error: () => { this.isLoading = false; },
    });
  }
}