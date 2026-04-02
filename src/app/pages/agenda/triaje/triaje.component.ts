import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AgendaService } from 'src/app/core/services/agenda.service';
import { TriageResponse } from 'src/app/core/models';
import { PatientAutocompleteFieldComponent } from 'src/app/shared/autocomplete/patient-autocomplete-field.component';
import { AppointmentAutocompleteFieldComponent } from 'src/app/shared/autocomplete/appointment-autocomplete-field.component';

@Component({
  selector: 'app-triaje',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    PatientAutocompleteFieldComponent,
    AppointmentAutocompleteFieldComponent,
  ],
  templateUrl: './triaje.component.html',
})
export class TriajeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  triageResult: TriageResponse | null = null;
  isSaving = false;

  triageForm = this.fb.group({
    appointmentId:    ['', Validators.required],
    patientId:        ['', Validators.required],
    bloodPressure:    ['', Validators.required],
    heartRate:        [72, Validators.required],
    respiratoryRate:  [16, Validators.required],
    temperature:      [36.5, Validators.required],
    oxygenSaturation: [98, Validators.required],
    weight:           [70, Validators.required],
    height:           [170, Validators.required],
    triageLevel:      ['NORMAL', Validators.required],
    notes:            [''],
  });

  save(): void {
    if (this.triageForm.invalid) {
      this.triageForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.agendaService.registerTriage(this.triageForm.getRawValue() as any).subscribe({
      next: (resp) => {
        this.isSaving = false;
        this.triageResult = resp.data;
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }
}