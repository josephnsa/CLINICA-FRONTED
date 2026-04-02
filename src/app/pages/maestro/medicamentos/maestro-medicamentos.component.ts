import { Component, OnInit, inject, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { ApiResponse, Medication, PageResponse } from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';

function normalizeMedication(raw: Medication & Record<string, unknown>): Medication {
  const r = raw as Record<string, unknown>;
  return {
    id: String(raw.id),
    code: String(raw.code ?? ''),
    genericName: String(raw.genericName ?? ''),
    tradeName: String(raw.tradeName ?? r['commercialName'] ?? ''),
    presentation: String(raw.presentation ?? ''),
    unit: String(raw.unit ?? ''),
    active: Boolean(raw.active ?? r['isActive']),
  };
}

@Component({
  selector: 'app-maestro-medicamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './maestro-medicamentos.component.html',
})
export class MaestroMedicamentosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  filtersForm = this.fb.group({
    search: [''],
    onlyActive: [true],
  });

  medications: Medication[] = [];
  displayedColumns = [
    'code',
    'genericName',
    'tradeName',
    'presentation',
    'unit',
    'active',
    'actions',
  ];
  isLoading = false;

  ngOnInit(): void {
    this.loadMedications();
    this.filtersForm.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMedications(0));
  }

  loadMedications(page = 0): void {
    const { search, onlyActive } = this.filtersForm.value;
    this.isLoading = true;
    this.catalogService
      .getMedications({
        q: search ?? '',
        activeOnly: onlyActive !== false,
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<PageResponse<Medication>>) => {
          const rows = resp.data?.content ?? [];
          this.medications = rows.map((m) =>
            normalizeMedication(m as Medication & Record<string, unknown>)
          );
          this.isLoading = false;
        },
        error: () => {
          this.medications = [];
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.loadMedications(0);
  }

  newMedication(): void {
    const ref = this.dialog.open(MedicationEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        isNew: true,
        medication: {
          id: '',
          code: '',
          genericName: '',
          tradeName: '',
          presentation: '',
          unit: '',
          active: true,
        } as Medication,
      },
    });
    ref.afterClosed().subscribe((result?: MedicationEditResult) => {
      if (!result?.code?.trim() || !result.genericName?.trim()) {
        return;
      }
      this.catalogService
        .createMedication({
          code: result.code.trim(),
          genericName: result.genericName.trim(),
          commercialName: result.tradeName?.trim() ?? '',
          presentation: result.presentation?.trim() ?? '',
          unit: result.unit?.trim() ?? '',
          active: result.active,
        })
        .subscribe({
          next: (resp: ApiResponse<Medication>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo crear el medicamento', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Medicamento creado', 'Cerrar', { duration: 3000 });
            this.loadMedications(0);
          },
          error: (err: HttpErrorResponse) => {
            this.snackBar.open(this.apiErrorMessage(err, 'Error al crear medicamento'), 'Cerrar', {
              duration: 5000,
            });
          },
        });
    });
  }

  editMedication(medication: Medication): void {
    const ref = this.dialog.open(MedicationEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        isNew: false,
        medication: { ...medication },
      },
    });
    ref.afterClosed().subscribe((result?: MedicationEditResult) => {
      if (!result) {
        return;
      }
      this.catalogService
        .updateMedication(medication.id, {
          code: result.code.trim(),
          genericName: result.genericName.trim(),
          commercialName: result.tradeName?.trim() ?? '',
          presentation: result.presentation?.trim() ?? '',
          unit: result.unit?.trim() ?? '',
          active: result.active,
        })
        .subscribe({
          next: (resp: ApiResponse<Medication>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo guardar', 'Cerrar', { duration: 5000 });
              return;
            }
            this.snackBar.open('Medicamento actualizado', 'Cerrar', { duration: 3000 });
            this.loadMedications(0);
          },
          error: (err: HttpErrorResponse) => {
            this.snackBar.open(this.apiErrorMessage(err, 'Error al guardar'), 'Cerrar', {
              duration: 5000,
            });
          },
        });
    });
  }

  confirmToggleActive(medication: Medication): void {
    const ref = this.dialog.open(MedicationToggleActiveDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { medication },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      if (medication.active) {
        this.catalogService.deactivateMedication(medication.id).subscribe({
          next: (resp: ApiResponse<null>) => {
            if (!resp.success) {
              this.snackBar.open(resp.message ?? 'No se pudo desactivar', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Medicamento desactivado', 'Cerrar', { duration: 3000 });
            this.loadMedications(0);
          },
          error: (err: HttpErrorResponse) => {
            this.snackBar.open(this.apiErrorMessage(err, 'Error al desactivar'), 'Cerrar', {
              duration: 5000,
            });
          },
        });
      } else {
        this.catalogService
          .updateMedication(medication.id, {
            code: medication.code,
            genericName: medication.genericName,
            commercialName: medication.tradeName ?? '',
            presentation: medication.presentation ?? '',
            unit: medication.unit ?? '',
            active: true,
          })
          .subscribe({
            next: (resp: ApiResponse<Medication>) => {
              if (!resp.success) {
                this.snackBar.open(resp.message ?? 'No se pudo activar', 'Cerrar', {
                  duration: 5000,
                });
                return;
              }
              this.snackBar.open('Medicamento activado', 'Cerrar', { duration: 3000 });
              this.loadMedications(0);
            },
            error: (err: HttpErrorResponse) => {
              this.snackBar.open(this.apiErrorMessage(err, 'Error al activar'), 'Cerrar', {
                duration: 5000,
              });
            },
          });
      }
    });
  }

  private apiErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body && body.message) {
      return String(body.message);
    }
    return fallback;
  }
}

interface MedicationEditDialogData {
  medication: Medication;
  isNew: boolean;
}

interface MedicationEditResult {
  code: string;
  genericName: string;
  tradeName: string;
  presentation: string;
  unit: string;
  active: boolean;
}

@Component({
  selector: 'app-medication-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  styles: [
    `
      h2[mat-dialog-title] {
        margin: 0;
        padding-bottom: 0;
      }
      mat-dialog-content {
        padding-top: 1rem !important;
      }
    `,
  ],
  template: `
    <h2 mat-dialog-title class="border-b border-slate-200/90 pb-4">
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
        >
          <mat-icon class="!h-6 !w-6 !text-[24px]">{{ data.isNew ? 'post_add' : 'medication' }}</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            {{ data.isNew ? 'Nuevo medicamento' : 'Editar medicamento' }}
          </span>
          <p *ngIf="data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Registra el código único, el nombre genérico y datos de presentación.
          </p>
          <p *ngIf="!data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Actualiza los datos del fármaco o su disponibilidad en el catálogo.
          </p>
          <p
            *ngIf="!data.isNew"
            class="mt-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700"
          >
            ID: {{ data.medication.id }}
          </p>
        </div>
      </div>
    </h2>

    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-5">
      <div class="rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-slate-600 !h-[18px] !w-[18px] !text-[18px]">badge</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Identificación
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Código</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">tag</mat-icon>
            <input matInput formControlName="code" autocomplete="off" />
            <mat-hint align="start">Único en el catálogo</mat-hint>
            <mat-error *ngIf="form.get('code')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre genérico</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">science</mat-icon>
            <input matInput formControlName="genericName" />
            <mat-error *ngIf="form.get('genericName')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre comercial</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">storefront</mat-icon>
            <input matInput formControlName="tradeName" />
            <mat-hint align="start">Opcional</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 shadow-sm"
      >
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-600 !h-[18px] !w-[18px] !text-[18px]">inventory_2</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Presentación
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Presentación</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">widgets</mat-icon>
            <input matInput formControlName="presentation" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Unidad</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">straighten</mat-icon>
            <input matInput formControlName="unit" />
          </mat-form-field>
        </div>
      </div>

      <div
        class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <mat-checkbox formControlName="active" color="primary" class="!mr-0 shrink-0">
          Medicamento activo
        </mat-checkbox>
        <span class="text-xs leading-relaxed text-slate-500">
          Los inactivos pueden ocultarse si el listado está filtrado a solo activos.
        </span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="mt-0 border-t border-slate-100 bg-slate-50/40 px-6 py-3 !justify-end gap-2"
    >
      <button type="button" mat-stroked-button mat-dialog-close class="!min-w-[100px]">Cancelar</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        class="!min-w-[120px]"
        [disabled]="form.invalid"
        (click)="onSave()"
      >
        <span class="inline-flex items-center justify-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">check</mat-icon>
          Guardar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class MedicationEditDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<MedicationEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicationEditDialogData
  ) {
    const m = this.data.medication;
    this.form = this.fb.group({
      code: [m.code, Validators.required],
      genericName: [m.genericName, Validators.required],
      tradeName: [m.tradeName ?? ''],
      presentation: [m.presentation ?? ''],
      unit: [m.unit ?? ''],
      active: [m.active],
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.value as MedicationEditResult);
  }
}

@Component({
  selector: 'app-medication-toggle-active-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  styles: [
    `
      h2[mat-dialog-title] {
        margin: 0;
      }
    `,
  ],
  template: `
    <h2 mat-dialog-title class="border-b border-slate-200/90 pb-4">
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-100"
        >
          <mat-icon class="!h-6 !w-6 !text-[24px]">{{
            data.medication.active ? 'visibility_off' : 'check_circle'
          }}</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            {{ data.medication.active ? 'Desactivar medicamento' : 'Activar medicamento' }}
          </span>
          <p class="mt-1 text-sm text-slate-500">
            Esta acción afecta la disponibilidad en el catálogo.
          </p>
        </div>
      </div>
    </h2>
    <mat-dialog-content class="pt-4">
      <p class="text-sm leading-relaxed text-slate-700">
        ¿Confirmas que deseas
        <strong>{{ data.medication.active ? 'desactivar' : 'activar' }}</strong>
        el medicamento
        <span class="font-semibold text-slate-900">{{ data.medication.code }}</span>
        —
        <span class="font-medium">{{ data.medication.genericName }}</span>?
      </p>
    </mat-dialog-content>
    <mat-dialog-actions
      align="end"
      class="border-t border-slate-100 bg-slate-50/40 px-6 py-3 !justify-end gap-2"
    >
      <button type="button" mat-stroked-button mat-dialog-close class="!min-w-[100px]">Cancelar</button>
      <button
        type="button"
        mat-flat-button
        [color]="data.medication.active ? 'warn' : 'primary'"
        (click)="confirm()"
      >
        <span class="inline-flex items-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">done</mat-icon>
          Confirmar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class MedicationToggleActiveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MedicationToggleActiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { medication: Medication }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }
}

