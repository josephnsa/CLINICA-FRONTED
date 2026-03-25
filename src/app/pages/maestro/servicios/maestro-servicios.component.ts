import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { ClinicalService, Specialty, ApiResponse } from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Inject } from '@angular/core';

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
    active: [true],
  });

  ngOnInit(): void {
    this.loadSpecialties();
    this.loadServices();
  }

  loadServices(page = 0): void {
    const { search, specialtyId, active } = this.filtersForm.value;
    this.isLoading = true;
    this.catalogService
      .getServices({
        search: search ?? '',
        specialtyId: specialtyId ?? '',
        active: active ?? true,
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<ClinicalService[]>) => {
          this.services = resp.data;
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
      width: '520px',
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
      if (!result) {
        return;
      }
      const specialty = this.specialties.find((s) => s.id === result.specialtyId) || null;
      const newService: ClinicalService = {
        id: `tmp-${Date.now()}`,
        code: result.code,
        name: result.name,
        specialtyId: result.specialtyId ?? null,
        specialtyName: specialty ? specialty.name : null,
        durationMin: result.durationMin,
        price: result.price,
        isActive: result.isActive,
      };
      this.services = [newService, ...this.services];
    });
  }

  editService(service: ClinicalService): void {
    const dialogRef = this.dialog.open(ServiceEditDialogComponent, {
      width: '520px',
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
      const specialty = this.specialties.find((s) => s.id === result.specialtyId) || null;
      this.services = this.services.map((s) =>
        s.id === service.id
          ? {
              ...s,
              code: result.code,
              name: result.name,
              specialtyId: result.specialtyId ?? null,
              specialtyName: specialty ? specialty.name : null,
              durationMin: result.durationMin,
              price: result.price,
              isActive: result.isActive,
            }
          : s
      );
    });
  }

  toggleActive(service: ClinicalService): void {
    const dialogRef = this.dialog.open(ServiceToggleActiveDialogComponent, {
      width: '420px',
      data: { service },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.services = this.services.map((s) =>
        s.id === service.id ? { ...s, isActive: !s.isActive } : s
      );
    });
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
  template: `
    <h2 mat-dialog-title>Editar servicio</h2>
    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-4 mt-2">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Código</mat-label>
        <input matInput formControlName="code" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Especialidad</mat-label>
        <mat-select formControlName="specialtyId">
          <mat-option [value]="null">Ninguna</mat-option>
          <mat-option *ngFor="let sp of data.specialties" [value]="sp.id">
            {{ sp.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div class="grid grid-cols-2 gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Duración (min)</mat-label>
          <input matInput type="number" formControlName="durationMin" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio base</mat-label>
          <input matInput type="number" formControlName="price" />
        </mat-form-field>
      </div>

      <mat-checkbox formControlName="isActive">Activo</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mt-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class ServiceEditDialogComponent {
  form = this.fb.group({
    code: [this.data.service.code],
    name: [this.data.service.name],
    specialtyId: [this.data.service.specialtyId],
    durationMin: [this.data.service.durationMin],
    price: [this.data.service.price],
    isActive: [this.data.service.isActive],
  });

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<ServiceEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceEditDialogData
  ) {}

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
  template: `
    <h2 mat-dialog-title>{{ data.service.isActive ? 'Desactivar' : 'Activar' }} servicio</h2>
    <mat-dialog-content class="mt-2">
      <p>
        ¿Seguro que deseas
        {{ data.service.isActive ? 'desactivar' : 'activar' }}
        el servicio
        <strong>{{ data.service.code }} - {{ data.service.name }}</strong>?
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mt-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" (click)="confirm()">
        Sí, confirmar
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

