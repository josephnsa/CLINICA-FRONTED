# Módulo: Inventario y Farmacia

## Propósito
Controla el stock de medicamentos e insumos por sede, gestiona lotes con fechas de vencimiento, proveedores y órdenes de compra, con alertas de stock mínimo y vencimientos próximos.

---

## Submodelos de Dominio

### InventoryItem (Ítem de Inventario)
**Tabla:** `inventory_items`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| medicationId | UUID | FK a medications |
| sedeId | UUID | Sede donde está el stock |
| stock | int | Stock actual |
| minStock | int | Stock mínimo antes de alerta |
| location | String | Ubicación física (estante, refrigerador) |

**Métodos de dominio:**
- `isLowStock()` — true si stock ≤ minStock
- `canDispense(qty)` — true si hay suficiente stock
- `addStock(qty)` — incrementa stock
- `dispense(qty)` — descuenta stock, lanza error si no alcanza
- `adjustStock(qty)` — ajuste manual (puede ser negativo)
- `updateMinStock(newMin)` — actualiza el umbral de alerta

---

### InventoryMovement (Movimiento)
**Tabla:** `inventory_movements`

Registro de cada entrada o salida de stock.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| itemId | UUID | FK a inventory_items |
| type | Enum | IN (entrada) / OUT (salida) / ADJUSTMENT |
| quantity | int | Cantidad movida |
| reason | String | Motivo del movimiento |
| expiryDate | LocalDate | Fecha de vencimiento del lote (en entradas) |
| createdBy | UUID | Usuario que registró |
| createdAt | LocalDateTime | Timestamp |

---

### InventoryBatch (Lote)
**Tabla:** `inventory_batches`

Lotes individuales con número de lote y fecha de vencimiento.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| itemId | UUID | FK a inventory_items |
| batchNumber | String | Número de lote del fabricante |
| quantity | int | Cantidad de este lote |
| expiryDate | LocalDate | Fecha de vencimiento |
| receivedAt | LocalDateTime | Fecha de recepción |
| notes | String | Observaciones |

---

### Supplier (Proveedor)
**Tabla:** `suppliers`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| name | String | Nombre del proveedor |
| ruc | String | RUC / NIT |
| contact | String | Nombre de contacto |
| phone | String | Teléfono |
| email | String | Email |
| address | String | Dirección |
| isActive | boolean | Proveedor activo |

---

### PurchaseOrder (Orden de Compra)
**Tabla:** `purchase_orders`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| supplierId | UUID | Proveedor |
| sedeId | UUID | Sede destinataria |
| status | Enum | PENDING / APPROVED / RECEIVED / CANCELLED |
| total | BigDecimal | Total calculado de los ítems |
| notes | String | Observaciones |
| createdBy | UUID | Usuario que creó |
| receivedAt | LocalDateTime | Fecha de recepción física |

**Flujo de la orden:**
```
PENDING → APPROVED → RECEIVED
        → CANCELLED
```

**Ítems de la orden (`purchase_order_items`):** medicationId, description, quantity, unitPrice, total.

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `RegisterInventoryMovementUseCase` | Registra entrada, salida o ajuste de stock |
| `GetLowStockAlertsUseCase` | Lista ítems por debajo del stock mínimo |

---

## Endpoints REST

### Stock — `/api/inventory`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/inventory/movements` | `INVENTARIO_WRITE` | Registrar movimiento |
| GET | `/api/inventory/alerts` | `INVENTARIO_READ` | Alertas de stock mínimo |

### Lotes — `/api/inventory/batches`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/inventory/batches` | `INVENTARIO_READ` | Listar lotes (filtro: `?itemId=`) |
| GET | `/api/inventory/batches/expiring` | `INVENTARIO_READ` | Vencimientos próximos (`?daysAhead=30`) |
| POST | `/api/inventory/batches` | `INVENTARIO_WRITE` | Registrar nuevo lote |

### Proveedores — `/api/inventory/suppliers`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/inventory/suppliers` | `INVENTARIO_READ` | Listar proveedores |
| GET | `/api/inventory/suppliers/{id}` | `INVENTARIO_READ` | Ver proveedor |
| POST | `/api/inventory/suppliers` | `INVENTARIO_WRITE` | Crear proveedor |
| PUT | `/api/inventory/suppliers/{id}` | `INVENTARIO_WRITE` | Actualizar |
| PATCH | `/api/inventory/suppliers/{id}/toggle` | `INVENTARIO_WRITE` | Activar/desactivar |

### Órdenes de Compra — `/api/inventory/purchase-orders`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/inventory/purchase-orders` | `INVENTARIO_READ` | Listar órdenes |
| GET | `/api/inventory/purchase-orders/{id}` | `INVENTARIO_READ` | Ver orden con ítems |
| POST | `/api/inventory/purchase-orders` | `INVENTARIO_WRITE` | Crear orden |
| PATCH | `/api/inventory/purchase-orders/{id}/approve` | `INVENTARIO_WRITE` | Aprobar |
| PATCH | `/api/inventory/purchase-orders/{id}/receive` | `INVENTARIO_WRITE` | Marcar recibida |
| PATCH | `/api/inventory/purchase-orders/{id}/cancel` | `INVENTARIO_WRITE` | Cancelar |

---

## Reglas de Negocio Clave
1. No se puede dispensar si `canDispense(qty)` retorna false — error de negocio.
2. El stock mínimo genera alertas visibles en el dashboard del farmacéutico.
3. Los lotes próximos a vencer (≤ 30 días) se muestran en el reporte de vencimientos.
4. Una orden de compra solo puede recibirse si está en estado APPROVED.
5. Al recibir una orden de compra, el stock debe incrementarse manualmente con un movimiento IN.
