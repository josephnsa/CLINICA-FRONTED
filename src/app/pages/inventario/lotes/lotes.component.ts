import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { InventoryBatch, CreateBatchDto, ApiResponse, Medication, Supplier } from 'src/app/core/models';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './lotes.component.html',
})
export class LotesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly catalogService = inject(CatalogService);

  batches: InventoryBatch[] = [];
  expiringBatches: InventoryBatch[] = [];
  medications: Medication[] = [];
  suppliers: Supplier[] = [];
  showForm = false;

  displayedColumns = ['medicationName', 'batchNumber', 'quantity', 'expirationDate'];

  batchForm = this.fb.group({
    medicationId:   ['', Validators.required],
    batchNumber:    ['', Validators.required],
    expirationDate: ['', Validators.required],
    quantity:       [1, [Validators.required, Validators.min(1)]],
    supplierId:     [''],
  });

  ngOnInit(): void {
    this.loadBatches();
    this.loadExpiringBatches();
    this.loadMedications();
    this.loadSuppliers();
  }

  loadBatches(): void {
    this.inventoryService.getBatches().subscribe({
      next: (resp: ApiResponse<InventoryBatch[]>) => { this.batches = resp.data; },
      error: () => {},
    });
  }

  loadExpiringBatches(): void {
    this.inventoryService.getExpiringBatches().subscribe({
      next: (resp: ApiResponse<InventoryBatch[]>) => { this.expiringBatches = resp.data; },
      error: () => {},
    });
  }

  loadMedications(): void {
    this.catalogService.getMedications({}).subscribe({
      next: (resp) => { this.medications = resp.data.content; },
      error: () => {},
    });
  }

  loadSuppliers(): void {
    this.inventoryService.getSuppliers().subscribe({
      next: (resp: ApiResponse<Supplier[]>) => { this.suppliers = resp.data; },
      error: () => {},
    });
  }

  openForm(): void {
    this.batchForm.reset({ quantity: 1 });
    this.showForm = true;
  }

  save(): void {
    if (this.batchForm.invalid) return;
    const body = this.batchForm.value as CreateBatchDto;
    this.inventoryService.createBatch(body).subscribe({
      next: () => { this.showForm = false; this.loadBatches(); },
      error: () => {},
    });
  }

  cancel(): void { this.showForm = false; }
}