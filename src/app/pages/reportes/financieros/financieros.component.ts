import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReportsService } from 'src/app/core/services/reports.service';
import { FinancialReportResponse } from 'src/app/core/models';

@Component({
  selector: 'app-financieros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './financieros.component.html',
})
export class FinancierosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportsService = inject(ReportsService);

  report: FinancialReportResponse | null = null;
  isLoading = false;

  filterForm = this.fb.group({
    sedeId:    ['', Validators.required],
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
  });

  generate(): void {
    if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.reportsService.generateFinancial(this.filterForm.getRawValue() as any).subscribe({
      next: (resp) => { this.isLoading = false; this.report = resp.data; },
      error: () => { this.isLoading = false; },
    });
  }
}