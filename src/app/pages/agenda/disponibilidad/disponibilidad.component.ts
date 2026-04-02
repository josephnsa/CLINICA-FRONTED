import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AvailabilityRule, AvailabilityBlock } from 'src/app/core/models';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { TimePickerFieldComponent } from 'src/app/shared/datetime/time-picker-field.component';
import { combineDateAndTimeToLocalIso } from 'src/app/shared/datetime/datetime.utils';
import { DoctorAutocompleteFieldComponent } from 'src/app/shared/autocomplete/doctor-autocomplete-field.component';
import { SedeAutocompleteFieldComponent } from 'src/app/shared/autocomplete/sede-autocomplete-field.component';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    DatePickerFieldComponent,
    TimePickerFieldComponent,
    DoctorAutocompleteFieldComponent,
    SedeAutocompleteFieldComponent,
  ],
  templateUrl: './disponibilidad.component.html',
})
export class DisponibilidadComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  rules: AvailabilityRule[] = [];
  blocks: AvailabilityBlock[] = [];
  showRuleForm = false;
  showBlockForm = false;

  ruleColumns = ['doctorId', 'dayOfWeek', 'startTime', 'endTime', 'actions'];
  blockColumns = ['doctorId', 'startDt', 'endDt', 'reason', 'actions'];

  ruleForm = this.fb.group({
    doctorId: ['', Validators.required],
    sedeId: ['', Validators.required],
    dayOfWeek: [1, Validators.required],
    startTime: ['08:00', Validators.required],
    endTime: ['17:00', Validators.required],
  });

  blockForm = this.fb.group({
    doctorId: ['', Validators.required],
    sedeId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    startTime: ['09:00', Validators.required],
    endDate: [null as Date | null, Validators.required],
    endTime: ['18:00', Validators.required],
    reason: ['', Validators.required],
  });

  ngOnInit(): void {}

  searchForm = this.fb.group({
  doctorId: ['', Validators.required],
});

onSearch(): void {
  const doctorId = this.searchForm.get('doctorId')?.value || '';
  if (!doctorId) return;
  this.loadRules(doctorId);
  this.loadBlocks(doctorId);
}

loadRules(doctorId: string): void {
  this.agendaService.getRules(doctorId).subscribe({
    next: (resp) => { this.rules = resp.data; },
    error: () => {},
  });
}

loadBlocks(doctorId: string): void {
  this.agendaService.getBlocks(doctorId).subscribe({
    next: (resp) => { this.blocks = resp.data; },
    error: () => {},
  });
}
  saveRule(): void {
    if (this.ruleForm.invalid) { this.ruleForm.markAllAsTouched(); return; }
    this.agendaService.createRule(this.ruleForm.getRawValue() as any).subscribe({
      next: (resp) => {
        this.rules = [resp.data, ...this.rules];
        this.showRuleForm = false;
      },
      error: () => {},
    });
  }

  deleteRule(id: string): void {
    this.agendaService.deleteRule(id).subscribe({
      next: () => { this.rules = this.rules.filter(r => r.id !== id); },
      error: () => {},
    });
  }

  saveBlock(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    const v = this.blockForm.getRawValue();
    if (!v.startDate || !v.endDate) {
      return;
    }
    this.agendaService
      .createBlock({
        doctorId: v.doctorId!,
        sedeId: v.sedeId!,
        startDt: combineDateAndTimeToLocalIso(v.startDate, v.startTime ?? '00:00'),
        endDt: combineDateAndTimeToLocalIso(v.endDate, v.endTime ?? '00:00'),
        reason: v.reason!,
      })
      .subscribe({
      next: (resp) => {
        this.blocks = [resp.data, ...this.blocks];
        this.showBlockForm = false;
      },
      error: () => {},
    });
  }

  deleteBlock(id: string): void {
    this.agendaService.deleteBlock(id).subscribe({
      next: () => { this.blocks = this.blocks.filter(b => b.id !== id); },
      error: () => {},
    });
  }
}