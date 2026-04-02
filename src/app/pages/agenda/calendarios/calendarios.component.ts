import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AvailabilitySlot } from 'src/app/core/models';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { formatDateToYmd } from 'src/app/shared/datetime/datetime.utils';

@Component({
  selector: 'app-calendarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, DatePickerFieldComponent],
  templateUrl: './calendarios.component.html',
})
export class CalendariosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  slots: AvailabilitySlot[] = [];
  isLoading = false;

  get availableCount(): number {
    return this.slots?.filter(s => s.available).length ?? 0;
  }

  searchForm = this.fb.group({
    doctorId: ['', Validators.required],
    sedeId: ['', Validators.required],
    date: [null as Date | null, Validators.required],
  });

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const raw = this.searchForm.getRawValue();
    if (!raw.date) {
      return;
    }
    this.isLoading = true;
    this.agendaService
      .getAvailability({
        doctorId: raw.doctorId!,
        sedeId: raw.sedeId!,
        date: formatDateToYmd(raw.date),
      })
      .subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.slots = resp.data;
      },
      error: () => { this.isLoading = false; },
    });
  }
}