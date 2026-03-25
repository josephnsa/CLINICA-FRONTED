import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { SecurityService } from 'src/app/core/services/security.service';
import {
  ApiResponse,
  PageResponse,
  Sede,
  Tariff,
} from 'src/app/core/models';

@Component({
  selector: 'app-maestro-tarifarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './maestro-tarifarios.component.html',
})
export class MaestroTarifariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly securityService = inject(SecurityService);

  filtersForm = this.fb.group({
    sedeId: [''],
    serviceName: [''],
    tariffName: [''],
  });

  sedes: Sede[] = [];
  tariffs: Tariff[] = [];
  displayedColumns = [
    'sedeName',
    'serviceName',
    'name',
    'price',
    'active',
    'actions',
  ];
  isLoading = false;

  ngOnInit(): void {
    this.loadSedes();
  }

  loadSedes(): void {
    this.securityService.getSedes().subscribe({
      next: (resp: ApiResponse<Sede[]>) => {
        this.sedes = resp.data;
      },
      error: () => {},
    });
  }

  loadTariffs(page = 0): void {
    const { sedeId } = this.filtersForm.value;
    if (!sedeId) {
      this.tariffs = [];
      return;
    }
    this.isLoading = true;
    this.catalogService
      .getTariffs({
        sedeId,
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<PageResponse<Tariff>>) => {
          this.tariffs = resp.data.content;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.loadTariffs(0);
  }

  toggleActiveLocal(row: Tariff): void {
    this.tariffs = this.tariffs.map((t) =>
      t.id === row.id ? { ...t, active: !t.active } : t
    );
  }
}

