import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReportsService } from 'src/app/core/services/reports.service';
import { ClinicalReportResponse } from 'src/app/core/models';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { formatDateToYmd } from 'src/app/shared/datetime/datetime.utils';
import { SedeAutocompleteFieldComponent } from 'src/app/shared/autocomplete/sede-autocomplete-field.component';

@Component({
  selector: 'app-clinicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, DatePickerFieldComponent, SedeAutocompleteFieldComponent],
  templateUrl: './clinicos.component.html',
})
export class ClinicosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportsService = inject(ReportsService);

  report: ClinicalReportResponse | null = null;
  isLoading = false;

  filterForm = this.fb.group({
    sedeId: this.fb.nonNullable.control('', Validators.required),
    startDate: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null, Validators.required),
  });

  // Tipado explícito para que el template reconozca FormControl<Date|null>
  get startDateCtrl(): FormControl<Date | null> {
    return this.filterForm.controls.startDate as FormControl<Date | null>;
  }

  get endDateCtrl(): FormControl<Date | null> {
    return this.filterForm.controls.endDate as FormControl<Date | null>;
  }

  generate(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    const v = this.filterForm.getRawValue();
    if (!v.startDate || !v.endDate) {
      return;
    }
    this.isLoading = true;
    this.reportsService
      .generateClinical({
        sedeId: v.sedeId!,
        startDate: formatDateToYmd(v.startDate),
        endDate: formatDateToYmd(v.endDate),
      })
      .subscribe({
      next: (resp) => { this.isLoading = false; this.report = resp.data; },
      error: () => { this.isLoading = false; },
    });
  }
}