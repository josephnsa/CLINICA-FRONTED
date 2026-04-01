import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { PurchaseOrder, CreatePurchaseOrderDto, Supplier, ApiResponse } from 'src/app/core/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './compras.component.html',
})
export class ComprasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);

  orders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  showForm = false;

  displayedColumns = ['supplierName', 'status', 'createdAt', 'actions'];

  orderForm = this.fb.group({
    supplierId: ['', Validators.required],
    notes:      [''],
  });

  ngOnInit(): void {
    this.loadOrders();
    this.loadSuppliers();
  }

  loadOrders(): void {
    this.inventoryService.getPurchaseOrders().subscribe({
      next: (resp: ApiResponse<PurchaseOrder[]>) => { this.orders = resp.data; },
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
    this.orderForm.reset();
    this.showForm = true;
  }

  save(): void {
    if (this.orderForm.invalid) return;
    const body = this.orderForm.value as CreatePurchaseOrderDto;
    this.inventoryService.createPurchaseOrder(body).subscribe({
      next: () => { this.showForm = false; this.loadOrders(); },
      error: () => {},
    });
  }

  approve(order: PurchaseOrder): void {
    this.inventoryService.approvePurchaseOrder(order.id).subscribe({
      next: () => { this.loadOrders(); },
      error: () => {},
    });
  }

  receive(order: PurchaseOrder): void {
    this.inventoryService.receivePurchaseOrder(order.id).subscribe({
      next: () => { this.loadOrders(); },
      error: () => {},
    });
  }

  cancel(order: PurchaseOrder): void {
    this.inventoryService.cancelPurchaseOrder(order.id).subscribe({
      next: () => { this.loadOrders(); },
      error: () => {},
    });
  }

  cancelForm(): void { this.showForm = false; }
}