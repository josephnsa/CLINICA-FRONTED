import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { HrmService } from '../../../core/services/hrm.service';
import { TimePickerFieldComponent } from 'src/app/shared/datetime/time-picker-field.component';
import { EmployeeSchedule, DAY_NAMES } from '../../../core/models/hrm.model';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    TimePickerFieldComponent,
  ],
  templateUrl: './horarios.component.html',
})
export class HorariosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private hrmService = inject(HrmService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  employeeId = signal('');
  schedules = signal<EmployeeSchedule[]>([]);
  loading = signal(false);
  addingDay = signal<number | null>(null);
  saving = signal(false);

  days = [1, 2, 3, 4, 5, 6, 7];
  dayNames = DAY_NAMES;

  form = this.fb.group({
    startTime: ['08:00', Validators.required],
    endTime: ['17:00', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.employeeId.set(id);
    if (id) this.loadSchedules();
  }

  loadSchedules() {
    this.loading.set(true);
    this.hrmService.getSchedules(this.employeeId()).subscribe({
      next: (data) => { this.schedules.set(data); this.loading.set(false); },
      error: () => { this.snack.open('Error al cargar horarios', 'Cerrar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  getScheduleForDay(day: number): EmployeeSchedule | undefined {
    return this.schedules().find((s) => s.dayOfWeek === day && s.active);
  }

  openAdd(day: number) {
    this.addingDay.set(day);
    this.form.reset({ startTime: '08:00', endTime: '17:00' });
  }

  cancelAdd() {
    this.addingDay.set(null);
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.hrmService.createSchedule({
      employeeId: this.employeeId(),
      sedeId: '',
      dayOfWeek: this.addingDay()!,
      startTime: `${this.form.value.startTime}:00`,
      endTime: `${this.form.value.endTime}:00`,
    }).subscribe({
      next: () => {
        this.snack.open('Turno agregado', 'Cerrar', { duration: 3000 });
        this.addingDay.set(null);
        this.saving.set(false);
        this.loadSchedules();
      },
      error: () => { this.saving.set(false); },
    });
  }

  deleteTurno(schedule: EmployeeSchedule) {
    if (!confirm(`¿Eliminar turno del ${schedule.dayName}?`)) return;
    this.hrmService.deleteSchedule(schedule.id).subscribe({
      next: () => { this.snack.open('Turno eliminado', 'Cerrar', { duration: 3000 }); this.loadSchedules(); },
      error: () => this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}