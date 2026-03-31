import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { AvailabilityRule, AvailabilityBlock } from 'src/app/core/models';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
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
    doctorId:   ['', Validators.required],
    sedeId:     ['', Validators.required],
    dayOfWeek:  [1, Validators.required],
    startTime:  ['', Validators.required],
    endTime:    ['', Validators.required],
  });

  blockForm = this.fb.group({
    doctorId: ['', Validators.required],
    sedeId:   ['', Validators.required],
    startDt:  ['', Validators.required],
    endDt:    ['', Validators.required],
    reason:   ['', Validators.required],
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
    if (this.blockForm.invalid) { this.blockForm.markAllAsTouched(); return; }
    this.agendaService.createBlock(this.blockForm.getRawValue() as any).subscribe({
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