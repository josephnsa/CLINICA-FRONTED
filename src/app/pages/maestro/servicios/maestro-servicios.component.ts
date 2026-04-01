import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { ClinicalService, Specialty, ApiResponse } from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-maestro-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './maestro-servicios.component.html',
})
export class MaestroServiciosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns = [
    'code',
    'name',
    'specialtyName',
    'durationMin',
    'price',
    'isActive',
    'actions',
  ];

  services: ClinicalService[] = [];
  specialties: Specialty[] = [];
  isLoading = false;

  readonly filtersForm = this.fb.group({
    search: [''],
    specialtyId: [''],
    /** Marcado = solo activos; desmarcado = todos. */
    onlyActive: [true],
  });

  ngOnInit(): void {
    this.loadSpecialties();
    this.loadServices();
  }

  loadServices(page = 0): void {
    const { search, specialtyId, onlyActive } = this.filtersForm.value;
    const sid = (specialtyId ?? '').trim();
    this.isLoading = true;
    this.catalogService
      .getServices({
        specialtyId: sid || undefined,
        activeOnly: onlyActive !== false,
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<ClinicalService[]>) => {
          let items = resp.data ?? [];
          const q = (search ?? '').trim().toLowerCase();
          if (q) {
            items = items.filter(
              (s) =>
                s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
            );
          }
          this.services = items;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  loadSpecialties(): void {
    this.catalogService.getSpecialties().subscribe({
      next: (resp: ApiResponse<Specialty[]>) => {
        this.specialties = resp.data;
      },
      error: () => {},
    });
  }

  onSearch(): void {
    this.loadServices(0);
  }

  newService(): void {
    const dialogRef = this.dialog.open(ServiceEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        service: {
          id: '',
          code: '',
          name: '',
          specialtyId: null,
          specialtyName: null,
          durationMin: 0,
          price: 0,
          isActive: true,
        } as ClinicalService,
        specialties: this.specialties,
        isNew: true,
      },
    });

    dialogRef.afterClosed().subscribe((result?: ServiceEditResult) => {
      if (!result || !result.specialtyId) {
        if (result && !result.specialtyId) {
          this.snackBar.open('Debes seleccionar una especialidad', 'Cerrar', { duration: 4000 });
        }
        return;
      }
      this.catalogService
        .createService({
          code: result.code.trim(),
          name: result.name.trim(),
          specialtyId: result.specialtyId,
          durationMin: result.durationMin,
          price: result.price,
          active: result.isActive,
        })
        .subscribe({
          next: (resp: ApiResponse<ClinicalService>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo crear el servicio', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Servicio creado', 'Cerrar', { duration: 3000 });
            this.loadServices(0);
          },
          error: (err: HttpErrorResponse) => {
            const msg = this.apiErrorMessage(err, 'Error al crear el servicio');
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  editService(service: ClinicalService): void {
    const dialogRef = this.dialog.open(ServiceEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        service,
        specialties: this.specialties,
        isNew: false,
      },
    });

    dialogRef.afterClosed().subscribe((result?: ServiceEditResult) => {
      if (!result) {
        return;
      }
      this.catalogService
        .updateService(service.id, {
          code: result.code.trim(),
          name: result.name.trim(),
          specialtyId: result.specialtyId ?? null,
          durationMin: result.durationMin,
          price: result.price,
          isActive: result.isActive,
        })
        .subscribe({
          next: (resp: ApiResponse<ClinicalService>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo guardar', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Servicio actualizado', 'Cerrar', { duration: 3000 });
            this.loadServices(0);
          },
          error: (err: HttpErrorResponse) => {
            const msg = this.apiErrorMessage(err, 'Error al guardar el servicio');
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  toggleActive(service: ClinicalService): void {
    const dialogRef = this.dialog.open(ServiceToggleActiveDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { service },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      if (service.isActive) {
        this.catalogService.deactivateService(service.id).subscribe({
          next: (resp: ApiResponse<null>) => {
            if (!resp.success) {
              this.snackBar.open(resp.message ?? 'No se pudo desactivar', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Servicio desactivado', 'Cerrar', { duration: 3000 });
            this.loadServices(0);
          },
          error: (err: HttpErrorResponse) => {
            const msg = this.apiErrorMessage(err, 'Error al desactivar');
            this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          },
        });
      } else {
        this.catalogService
          .updateService(service.id, {
            code: service.code,
            name: service.name,
            specialtyId: service.specialtyId,
            durationMin: service.durationMin,
            price: Number(service.price),
            isActive: true,
          })
          .subscribe({
            next: (resp: ApiResponse<ClinicalService>) => {
              if (!resp.success) {
                this.snackBar.open(resp.message ?? 'No se pudo activar', 'Cerrar', {
                  duration: 5000,
                });
                return;
              }
              this.snackBar.open('Servicio activado', 'Cerrar', { duration: 3000 });
              this.loadServices(0);
            },
            error: (err: HttpErrorResponse) => {
              const msg = this.apiErrorMessage(err, 'Error al activar');
              this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
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

interface ServiceEditDialogData {
  service: ClinicalService;
  specialties: Specialty[];
  isNew: boolean;
}

interface ServiceEditResult {
  code: string;
  name: string;
  specialtyId: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
}

@Component({
  selector: 'app-service-edit-dialog',
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
          <mat-icon class="!h-6 !w-6 !text-[24px]">{{
            data.isNew ? 'post_add' : 'medical_services'
          }}</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            {{ data.isNew ? 'Nuevo servicio' : 'Editar servicio' }}
          </span>
          <p *ngIf="data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Registra un procedimiento o consulta del catálogo clínico con código único, especialidad y precio
            base.
          </p>
          <p *ngIf="!data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Actualiza nombre, especialidad, duración, precio o si el servicio sigue disponible en el catálogo.
          </p>
          <p
            *ngIf="!data.isNew"
            class="mt-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700"
          >
            {{ data.service.code }}
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
            <mat-label>Código interno</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">tag</mat-icon>
            <input matInput formControlName="code" autocomplete="off" />
            <mat-hint align="start">Único en el catálogo (ej. CONSULT_EXT)</mat-hint>
            <mat-error *ngIf="form.get('code')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre del servicio</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">description</mat-icon>
            <input matInput formControlName="name" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 shadow-sm"
      >
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-600 !h-[18px] !w-[18px] !text-[18px]">school</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Especialidad
          </span>
        </div>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Especialidad asociada</mat-label>
          <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">category</mat-icon>
          <mat-select formControlName="specialtyId">
            <mat-option *ngIf="!data.isNew" [value]="null">Sin especialidad</mat-option>
            <mat-option *ngFor="let sp of data.specialties" [value]="sp.id">
              {{ sp.name }}
            </mat-option>
          </mat-select>
          <mat-hint *ngIf="data.isNew">Obligatoria al crear un servicio nuevo</mat-hint>
          <mat-error *ngIf="form.get('specialtyId')?.hasError('required')">
            Selecciona una especialidad
          </mat-error>
        </mat-form-field>
      </div>

      <div class="rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-slate-600 !h-[18px] !w-[18px] !text-[18px]">schedule</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Tiempo y precio base
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Duración (minutos)</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">timer</mat-icon>
            <input matInput type="number" min="1" formControlName="durationMin" />
            <mat-error *ngIf="form.get('durationMin')?.hasError('required')">Obligatorio</mat-error>
            <mat-error *ngIf="form.get('durationMin')?.hasError('min')">Mínimo 1 minuto</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Precio base</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">payments</mat-icon>
            <input matInput type="number" min="0" step="0.01" formControlName="price" />
            <mat-hint align="start">Referencia para tarifas</mat-hint>
            <mat-error *ngIf="form.get('price')?.hasError('required')">Obligatorio</mat-error>
            <mat-error *ngIf="form.get('price')?.hasError('min')">No puede ser negativo</mat-error>
          </mat-form-field>
        </div>
      </div>

      <div
        class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <mat-checkbox formControlName="isActive" color="primary" class="!mr-0 shrink-0">
          Servicio activo en catálogo
        </mat-checkbox>
        <span class="text-xs leading-relaxed text-slate-500">
          Los inactivos pueden ocultarse en listados y no usarse en nuevas prestaciones según la configuración del
          sistema.
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
export class ServiceEditDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<ServiceEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceEditDialogData
  ) {
    const s = this.data.service;
    if (this.data.isNew) {
      this.form = this.fb.group({
        code: [s.code, Validators.required],
        name: [s.name, Validators.required],
        specialtyId: [s.specialtyId, Validators.required],
        durationMin: [s.durationMin || 30, [Validators.required, Validators.min(1)]],
        price: [s.price ?? 0, [Validators.required, Validators.min(0)]],
        isActive: [s.isActive],
      });
    } else {
      this.form = this.fb.group({
        code: [s.code, Validators.required],
        name: [s.name, Validators.required],
        specialtyId: [s.specialtyId],
        durationMin: [s.durationMin, [Validators.required, Validators.min(1)]],
        price: [s.price, [Validators.required, Validators.min(0)]],
        isActive: [s.isActive],
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.value as ServiceEditResult);
  }
}

@Component({
  selector: 'app-service-toggle-active-dialog',
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
            data.service.isActive ? 'visibility_off' : 'check_circle'
          }}</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            {{ data.service.isActive ? 'Desactivar servicio' : 'Activar servicio' }}
          </span>
          <p class="mt-1 text-sm text-slate-500">
            Esta acción afecta la disponibilidad del servicio en el catálogo.
          </p>
        </div>
      </div>
    </h2>
    <mat-dialog-content class="pt-4">
      <p class="text-sm leading-relaxed text-slate-700">
        ¿Confirmas que deseas
        <strong>{{ data.service.isActive ? 'desactivar' : 'activar' }}</strong>
        el servicio
        <span class="font-semibold text-slate-900">{{ data.service.code }}</span>
        —
        <span class="font-medium">{{ data.service.name }}</span>?
      </p>
    </mat-dialog-content>
    <mat-dialog-actions
      align="end"
      class="border-t border-slate-100 bg-slate-50/40 px-6 py-3 !justify-end gap-2"
    >
      <button type="button" mat-stroked-button mat-dialog-close class="!min-w-[100px]">Cancelar</button>
      <button type="button" mat-flat-button [color]="data.service.isActive ? 'warn' : 'primary'" (click)="confirm()">
        <span class="inline-flex items-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">done</mat-icon>
          Confirmar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class ServiceToggleActiveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ServiceToggleActiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: ClinicalService }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }
}

