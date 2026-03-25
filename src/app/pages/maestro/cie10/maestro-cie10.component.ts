import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import {
  ApiResponse,
  Cie10Diagnosis,
  PageResponse,
} from 'src/app/core/models';

@Component({
  selector: 'app-maestro-cie10',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './maestro-cie10.component.html',
})
export class MaestroCie10Component implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);

  filtersForm = this.fb.group({
    code: [''],
    q: [''],
  });

  diagnoses: Cie10Diagnosis[] = [];
  displayedColumns = ['code', 'description', 'category'];
  isLoading = false;

  ngOnInit(): void {
    this.loadDiagnoses();
  }

  loadDiagnoses(page = 0): void {
    const { code, q } = this.filtersForm.value;
    this.isLoading = true;
    this.catalogService
      .searchCie10({
        code: code ?? '',
        q: q ?? '',
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<PageResponse<Cie10Diagnosis>>) => {
          this.diagnoses = resp.data.content;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.loadDiagnoses(0);
  }
}

