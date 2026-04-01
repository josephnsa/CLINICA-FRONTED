export interface InventoryMovement {
  id: string;
  medicationId: string;
  medicationName?: string;
  type: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  quantity: number;
  notes?: string;
  createdAt?: string;
}

export interface CreateMovementDto {
  medicationId: string;
  type: string;
  quantity: number;
  notes?: string;
}

export interface InventoryBatch {
  id: string;
  medicationId: string;
  medicationName?: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  supplier?: string;
}

export interface CreateBatchDto {
  medicationId: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  supplierId?: string;
}

export interface LowStockAlert {
  medicationId: string;
  medicationName: string;
  currentStock: number;
  minStock: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName?: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  notes?: string;
}