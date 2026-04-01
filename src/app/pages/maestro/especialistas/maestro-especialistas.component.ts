import { Component, OnInit, inject, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { SecurityService } from 'src/app/core/services/security.service';
import {
  ApiResponse,
  Doctor,
  Specialty,
  UserSummary,
  UserListResponse,
} from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

function normalizeSpecialty(raw: Specialty & { isActive?: boolean }): Specialty {
  return {
    ...raw,
    active: raw.active ?? raw.isActive ?? false,
  };
}

function normalizeDoctor(raw: Doctor & { isActive?: boolean } & Record<string, unknown>): Doctor {
  const r = raw as Record<string, unknown>;
  const pick = (camel: string, snake: string) =>
    r[camel] ?? r[camel.toLowerCase()] ?? r[snake] ?? r[snake.toLowerCase()];
  const fullName = String(pick('fullName', 'full_name') ?? '');
  const licenseNumber = String(pick('licenseNumber', 'license_number') ?? '');
  const specialtyId = String(pick('specialtyId', 'specialty_id') ?? '');
  const specialtyName = (pick('specialtyName', 'specialty_name') as string | null | undefined) ?? null;
  const id = String(pick('id', 'id') ?? '');
  const active = Boolean(
    raw.active ?? raw.isActive ?? r['isActive'] ?? r['isactive'] ?? r['active']
  );
  return {
    id,
    fullName,
    licenseNumber,
    specialtyId,
    specialtyName,
    active,
  };
}

@Component({
  selector: 'app-maestro-especialistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './maestro-especialistas.component.html',
})
export class MaestroEspecialistasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly securityService = inject(SecurityService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];

  specialtiesDisplayedColumns = ['code', 'name', 'active'];
  doctorsDisplayedColumns = ['fullName', 'licenseNumber', 'specialtyName', 'active'];

  specialtiesFiltersForm = this.fb.group({
    search: [''],
  });

  doctorsFiltersForm = this.fb.group({
    search: [''],
    specialtyId: [''],
  });

  ngOnInit(): void {
    this.loadSpecialties();
    this.loadDoctors();
    this.doctorsFiltersForm
      .get('search')
      ?.valueChanges.pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadDoctors());
  }

  loadSpecialties(): void {
    this.catalogService.getSpecialties().subscribe({
      next: (resp: ApiResponse<Specialty[]>) => {
        this.specialties = (resp.data ?? []).map((s) =>
          normalizeSpecialty(s as Specialty & { isActive?: boolean })
        );
        this.applySpecialtiesFilter();
      },
      error: () => {},
    });
  }

  applySpecialtiesFilter(): void {
    const term = (this.specialtiesFiltersForm.value.search ?? '').toLowerCase();
    if (!term) {
      this.filteredSpecialties = this.specialties;
      return;
    }
    this.filteredSpecialties = this.specialties.filter(
      (s) =>
        s.code.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
    );
  }

  loadDoctors(): void {
    const { search, specialtyId } = this.doctorsFiltersForm.value;
    this.catalogService
      .getDoctors({
        q: search ?? '',
        specialtyId: specialtyId ?? '',
      })
      .subscribe({
        next: (resp: ApiResponse<Doctor[]>) => {
          this.doctors = (resp.data ?? []).map((d) =>
            normalizeDoctor(d as Doctor & { isActive?: boolean } & Record<string, unknown>)
          );
          this.applyDoctorsFilter();
        },
        error: () => {},
      });
  }

  applyDoctorsFilter(): void {
    const term = (this.doctorsFiltersForm.value.search ?? '').toLowerCase();
    if (!term) {
      this.filteredDoctors = this.doctors;
      return;
    }
    this.filteredDoctors = this.doctors.filter((d) =>
      `${d.fullName} ${d.licenseNumber}`.toLowerCase().includes(term)
    );
  }

  onSearchSpecialties(): void {
    this.applySpecialtiesFilter();
  }

  onSearchDoctors(): void {
    this.loadDoctors();
  }

  newSpecialty(): void {
    const ref = this.dialog.open(NewSpecialtyDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((result?: { code: string; name: string }) => {
      if (!result?.code?.trim() || !result?.name?.trim()) {
        return;
      }
      this.catalogService
        .createSpecialty({
          code: result.code.trim(),
          name: result.name.trim(),
        })
        .subscribe({
          next: (resp: ApiResponse<Specialty>) => {
            if (!resp.success) {
              this.snackBar.open(resp.message ?? 'No se pudo crear la especialidad', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Especialidad creada', 'Cerrar', { duration: 3000 });
            this.loadSpecialties();
          },
          error: (err: HttpErrorResponse) => {
            this.snackBar.open(this.apiErrorMessage(err, 'Error al crear especialidad'), 'Cerrar', {
              duration: 5000,
            });
          },
        });
    });
  }

  newDoctor(): void {
    this.securityService.getUsers({ page: 0, size: 100 }).subscribe({
      next: (resp: ApiResponse<UserListResponse>) => {
        const users = resp.data?.items ?? [];
        const ref = this.dialog.open(NewDoctorDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          autoFocus: 'first-tabbable',
          data: {
            specialties: this.specialties,
            users,
          },
        });
        ref
          .afterClosed()
          .subscribe(
            (result?: { userId: string; licenseNumber: string; specialtyId: string | null }) => {
              if (!result?.userId || !result.licenseNumber?.trim()) {
                return;
              }
              this.catalogService
                .createDoctor({
                  userId: result.userId,
                  licenseNumber: result.licenseNumber.trim(),
                  specialtyId: result.specialtyId,
                })
                .subscribe({
                  next: (r: ApiResponse<unknown>) => {
                    if (!r.success) {
                      this.snackBar.open(r.message ?? 'No se pudo registrar el especialista', 'Cerrar', {
                        duration: 5000,
                      });
                      return;
                    }
                    this.snackBar.open('Especialista registrado', 'Cerrar', { duration: 3000 });
                    this.loadDoctors();
                  },
                  error: (err: HttpErrorResponse) => {
                    this.snackBar.open(
                      this.apiErrorMessage(err, 'Error al registrar especialista'),
                      'Cerrar',
                      { duration: 5000 }
                    );
                  },
                });
            }
          );
      },
      error: () => {
        this.snackBar.open('No se pudo cargar la lista de usuarios', 'Cerrar', { duration: 5000 });
      },
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

@Component({
  selector: 'app-new-specialty-dialog',
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
          <mat-icon class="!h-6 !w-6 !text-[24px]">medical_services</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            Nueva especialidad
          </span>
          <p class="mt-1 text-sm leading-snug text-slate-500">
            El código suele ser corto y en mayúsculas; el nombre es el que verán en listas y filtros.
          </p>
        </div>
      </div>
    </h2>

    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-5">
      <div class="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-600 !h-[18px] !w-[18px] !text-[18px]">category</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Datos del catálogo
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Código</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">tag</mat-icon>
            <input matInput formControlName="code" autocomplete="off" />
            <mat-hint align="start">Ej. CARDIO, PEDIA</mat-hint>
            <mat-error *ngIf="form.get('code')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">label</mat-icon>
            <input matInput formControlName="name" />
            <mat-error *ngIf="form.get('name')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
        </div>
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
        (click)="save()"
      >
        <span class="inline-flex items-center justify-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">check</mat-icon>
          Guardar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class NewSpecialtyDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<NewSpecialtyDialogComponent>
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}

export interface NewDoctorDialogData {
  specialties: Specialty[];
  users: UserSummary[];
}

@Component({
  selector: 'app-new-doctor-dialog',
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
          <mat-icon class="!h-6 !w-6 !text-[24px]">person_add</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            Nuevo especialista
          </span>
          <p class="mt-1 text-sm leading-snug text-slate-500">
            Vincula un usuario ya creado en Seguridad con su colegiatura y, si aplica, una especialidad del
            catálogo.
          </p>
        </div>
      </div>
    </h2>

    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-5">
      <div
        *ngIf="data.users.length === 0"
        class="flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3.5"
      >
        <mat-icon class="mt-0.5 shrink-0 text-amber-700 !h-5 !w-5 !text-[20px]">warning_amber</mat-icon>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-amber-900">No hay usuarios disponibles</p>
          <p class="mt-1 text-sm leading-snug text-amber-900/80">
            Crea primero un usuario en <strong>Seguridad</strong> y vuelve a abrir este formulario.
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-slate-600 !h-[18px] !w-[18px] !text-[18px]">link</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Usuario del sistema
          </span>
        </div>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Seleccionar usuario</mat-label>
          <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">person_outline</mat-icon>
          <mat-select formControlName="userId" [disabled]="data.users.length === 0">
            <mat-option *ngFor="let u of data.users" [value]="u.id">
              {{ u.fullName }} — {{ u.email }}
            </mat-option>
          </mat-select>
          <mat-hint align="start">Cada usuario solo puede registrarse como médico una vez.</mat-hint>
          <mat-error *ngIf="form.get('userId')?.hasError('required')">Selecciona un usuario</mat-error>
        </mat-form-field>
      </div>

      <div class="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-600 !h-[18px] !w-[18px] !text-[18px]">badge</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Datos profesionales
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nº colegiatura</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">numbers</mat-icon>
            <input matInput formControlName="licenseNumber" autocomplete="off" />
            <mat-error *ngIf="form.get('licenseNumber')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Especialidad</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">medical_information</mat-icon>
            <mat-select formControlName="specialtyId">
              <mat-option [value]="null">Sin asignar</mat-option>
              <mat-option *ngFor="let s of data.specialties" [value]="s.id">
                {{ s.name }}
              </mat-option>
            </mat-select>
            <mat-hint align="start">Opcional; puedes asignarla más adelante si lo prefieres.</mat-hint>
          </mat-form-field>
        </div>
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
        [disabled]="form.invalid || data.users.length === 0"
        (click)="save()"
      >
        <span class="inline-flex items-center justify-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">check</mat-icon>
          Guardar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class NewDoctorDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<NewDoctorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewDoctorDialogData
  ) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      specialtyId: [null as string | null],
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.value;
    this.dialogRef.close({
      userId: v.userId,
      licenseNumber: v.licenseNumber,
      specialtyId: v.specialtyId,
    });
  }
}
