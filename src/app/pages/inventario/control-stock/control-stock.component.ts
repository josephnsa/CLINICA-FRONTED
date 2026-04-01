import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { InventoryMovement, CreateMovementDto, ApiResponse, Medication } from 'src/app/core/models';

@Component({
  selector: 'app-control-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './control-stock.component.html',
})
export class ControlStockComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly catalogService = inject(CatalogService);

  medications: Medication[] = [];
  showForm = false;

  movementForm = this.fb.group({
    medicationId: ['', Validators.required],
    type:         ['ENTRADA', Validators.required],
    quantity:     [1, [Validators.required, Validators.min(1)]],
    notes:        [''],
  });

  types = ['ENTRADA', 'SALIDA', 'AJUSTE'];

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.catalogService.getMedications({}).subscribe({
      next: (resp) => { this.medications = resp.data.content; },
      error: () => {},
    });
  }

  openForm(): void {
    this.movementForm.reset({ type: 'ENTRADA', quantity: 1 });
    this.showForm = true;
  }

  save(): void {
    if (this.movementForm.invalid) return;
    const body = this.movementForm.value as CreateMovementDto;
    this.inventoryService.createMovement(body).subscribe({
      next: () => { this.showForm = false; },
      error: () => {},
    });
  }

  cancel(): void { this.showForm = false; }
}