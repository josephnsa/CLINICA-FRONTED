import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HrmService } from 'src/app/core/services/hrm.service';
import { ProductivityReport } from 'src/app/core/models';

@Component({
  selector: 'app-productividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './productividad.component.html',
})
export class ProductividadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmService = inject(HrmService);

  report: ProductivityReport | null = null;
  isLoading = false;

  filterForm = this.fb.group({
    employeeId: ['', Validators.required],
    from:       ['', Validators.required],
    to:         ['', Validators.required],
  });

  generate(): void {
    if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
    const { employeeId, from, to } = this.filterForm.getRawValue();
    this.isLoading = true;
    this.hrmService.getProductivity(employeeId!, { from: from!, to: to! }).subscribe({
      next: (resp) => { this.isLoading = false; this.report = resp.data; },
      error: () => { this.isLoading = false; },
    });
  }
}