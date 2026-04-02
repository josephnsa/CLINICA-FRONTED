import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';

@Component({
  selector: 'app-maestro-dashboard-clinico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, DatePickerFieldComponent],
  templateUrl: './maestro-dashboard-clinico.component.html',
})
export class MaestroDashboardClinicoComponent {
  /** Fecha de referencia para métricas del tablero (solo UI por ahora). */
  readonly dashboardDate = new FormControl<Date | null>(new Date());
}

