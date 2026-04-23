import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HrmService } from 'src/app/core/services/hrm.service';
import { AttendanceRecord } from 'src/app/core/models';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './asistencia.component.html',
})
export class AsistenciaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmService = inject(HrmService);

  attendance: AttendanceRecord[] = [];
  isLoading = false;
  displayedColumns = ['date', 'checkIn', 'checkOut', 'minutesWorked', 'status'];

  checkInForm = this.fb.group({
    employeeId: ['', Validators.required],
    sedeId:     ['', Validators.required],
  });

  filterForm = this.fb.group({
    employeeId: ['', Validators.required],
    from:       ['', Validators.required],
    to:         ['', Validators.required],
  });

  doCheckIn(): void {
    if (this.checkInForm.invalid) { this.checkInForm.markAllAsTouched(); return; }
    this.hrmService.checkIn(this.checkInForm.getRawValue() as any).subscribe({
      next: () => { this.checkInForm.reset(); },
      error: () => {},
    });
  }

  doCheckOut(): void {
    const employeeId = this.checkInForm.get('employeeId')?.value || '';
    if (!employeeId) return;
    this.hrmService.checkOut({ employeeId }).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  loadAttendance(): void {
    if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.hrmService.getAttendance(this.filterForm.getRawValue() as any).subscribe({
      next: (resp) => { this.isLoading = false; this.attendance = resp.data; },
      error: () => { this.isLoading = false; },
    });
  }
}