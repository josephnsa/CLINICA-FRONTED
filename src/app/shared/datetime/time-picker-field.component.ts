import { Component, Input, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { buildQuarterHourSlots } from './datetime.utils';

/**
 * Hora nativa (teclado + icono de reloj del SO) + menú de franjas rápidas (estilo cuadrícula).
 */
@Component({
  selector: 'app-time-picker-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="app-time-picker-field w-full">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        type="time"
        [formControl]="control"
        [step]="step"
        [placeholder]="placeholder || 'HH:mm'"
        autocomplete="off"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        class="!mr-1 shrink-0"
        [matMenuTriggerFor]="menu"
        [attr.aria-label]="'Elegir hora rápida'"
      >
        <mat-icon class="text-[#5d87ff]">schedule</mat-icon>
      </button>
      <mat-menu #menu="matMenu" class="app-time-quick-menu max-h-80">
        <div class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Franjas comunes
        </div>
        <div
          class="grid max-h-64 grid-cols-4 gap-1 overflow-y-auto px-3 pb-3"
          (click)="$event.stopPropagation()"
        >
          @for (slot of quickSlots; track slot) {
            <button
              type="button"
              mat-stroked-button
              class="!min-w-0 !px-1 !text-xs"
              (click)="pick(slot)"
            >
              {{ slot }}
            </button>
          }
        </div>
      </mat-menu>
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
export class TimePickerFieldComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) control!: FormControl<string | null>;
  /** Segundos entre pasos (60 = minuto entero). */
  @Input() step = '300';
  @Input() hint = '';
  @Input() placeholder = '';

  readonly quickSlots = buildQuarterHourSlots(6, 22);

  private readonly menuTrigger = viewChild(MatMenuTrigger);

  pick(slot: string): void {
    this.control.setValue(slot);
    this.control.markAsDirty();
    queueMicrotask(() => this.menuTrigger()?.closeMenu());
  }
}
