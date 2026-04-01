import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  InventoryMovement,
  CreateMovementDto,
  InventoryBatch,
  CreateBatchDto,
  LowStockAlert,
  Supplier,
  PurchaseOrder,
  CreatePurchaseOrderDto,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── Movimientos ────────────────────────────────────
  createMovement(body: CreateMovementDto) {
    return this.http.post<ApiResponse<InventoryMovement>>(
      `${this.baseUrl}/inventory/movements`, body
    );
  }
  

  // ── Alertas ────────────────────────────────────────
  getLowStockAlerts(sedeId: string) {
  const httpParams = new HttpParams().set('sedeId', sedeId);
  return this.http.get<ApiResponse<LowStockAlert[]>>(
    `${this.baseUrl}/inventory/alerts/low-stock`,
    { params: httpParams }
  );
}

  // ── Lotes ──────────────────────────────────────────
  getBatches() {
    return this.http.get<ApiResponse<InventoryBatch[]>>(
      `${this.baseUrl}/inventory/batches`
    );
  }

  getExpiringBatches() {
    return this.http.get<ApiResponse<InventoryBatch[]>>(
      `${this.baseUrl}/inventory/batches/expiring`
    );
  }

  createBatch(body: CreateBatchDto) {
    return this.http.post<ApiResponse<InventoryBatch>>(
      `${this.baseUrl}/inventory/batches`, body
    );
  }

  // ── Proveedores ────────────────────────────────────
  getSuppliers() {
    return this.http.get<ApiResponse<Supplier[]>>(
      `${this.baseUrl}/inventory/suppliers`
    );
  }

  // ── Órdenes de compra ──────────────────────────────
  getPurchaseOrders() {
    return this.http.get<ApiResponse<PurchaseOrder[]>>(
      `${this.baseUrl}/inventory/purchase-orders`
    );
  }

  createPurchaseOrder(body: CreatePurchaseOrderDto) {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}/inventory/purchase-orders`, body
    );
  }

  approvePurchaseOrder(id: string) {
    return this.http.patch<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}/inventory/purchase-orders/${id}/approve`, {}
    );
  }

  receivePurchaseOrder(id: string) {
    return this.http.patch<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}/inventory/purchase-orders/${id}/receive`, {}
    );
  }

  cancelPurchaseOrder(id: string) {
    return this.http.patch<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}/inventory/purchase-orders/${id}/cancel`, {}
    );
  }
}