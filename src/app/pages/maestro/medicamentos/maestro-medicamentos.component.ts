import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import {
  ApiResponse,
  Medication,
  PageResponse,
} from 'src/app/core/models';

@Component({
  selector: 'app-maestro-medicamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './maestro-medicamentos.component.html',
})
export class MaestroMedicamentosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);

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
  }

  loadMedications(page = 0): void {
    const { search, onlyActive } = this.filtersForm.value;
    this.isLoading = true;
    this.catalogService
      .getMedications({
        code: '',
        q: search ?? '',
        active: onlyActive ?? true,
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<PageResponse<Medication>>) => {
          this.medications = resp.data.content;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.loadMedications(0);
  }

  toggleActiveLocal(row: Medication): void {
    this.medications = this.medications.map((m) =>
      m.id === row.id ? { ...m, active: !m.active } : m
    );
  }
}

