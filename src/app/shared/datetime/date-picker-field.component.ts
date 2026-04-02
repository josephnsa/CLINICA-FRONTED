import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

/**
 * Calendario Material + entrada por teclado (locale es-ES vía MAT_DATE_LOCALE).
 */
@Component({
  selector: 'app-date-picker-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="app-date-picker-field w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="control"
        [min]="min ?? null"
        [max]="max ?? null"
        [placeholder]="placeholder || 'dd/mm/aaaa'"
        autocomplete="off"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker />
      @if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class DatePickerFieldComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) control!: FormControl<Date | null>;
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;
  @Input() hint = '';
  @Input() placeholder = '';
}
