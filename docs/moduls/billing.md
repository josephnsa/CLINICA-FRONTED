# Módulo: Facturación y Caja

## Propósito
Gestiona la emisión de comprobantes (boletas, facturas, proformas), registro de pagos por múltiples medios, devoluciones y cierre de caja por sede/día.

---

## Submodelos de Dominio

### Invoice (Factura/Boleta)
**Tabla:** `invoices`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente |
| sedeId | UUID | Sede |
| serie | String | Serie del comprobante (ej. B001) |
| number | int | Número correlativo |
| status | Enum | Estado actual |
| subtotal | BigDecimal | Subtotal sin impuestos |
| tax | BigDecimal | IGV u otros impuestos |
| total | BigDecimal | Total a pagar |
| notes | String | Notas |
| createdBy | UUID | Cajero que emitió |
| createdAt | LocalDateTime | Fecha de emisión |

**Estados posibles (`InvoiceStatus`):**
```
DRAFT → PENDING → PAID
              → CANCELLED
              → REFUNDED
```

**Métodos de dominio:**
- `recalculateTotals()` — suma items y recalcula subtotal/tax/total
- `addPayment(Payment)` — registra un pago parcial o total
- `getPaidAmount()` — suma de todos los pagos registrados
- `getRemainingBalance()` — total - pagado
- `isFullyPaid()` — true si balance = 0
- `cancel()` — PENDING → CANCELLED (solo si no tiene pagos)
- `refund()` — PAID → REFUNDED
- `confirmProforma()` — DRAFT → PENDING (convierte proforma en comprobante real)
- `isProforma()` — true si status es DRAFT

---

### InvoiceItem (Ítem de Factura)
**Tabla:** `invoice_items`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| invoiceId | UUID | FK a invoices |
| serviceId | UUID | Servicio facturado |
| description | String | Descripción |
| quantity | int | Cantidad |
| unitPrice | BigDecimal | Precio unitario |
| total | BigDecimal | quantity × unitPrice |

---

### Payment (Pago)
**Tabla:** `payments`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| invoiceId | UUID | FK a invoices |
| amount | BigDecimal | Monto del pago |
| method | Enum | CASH / CARD / TRANSFER / INSURANCE |
| reference | String | Número de operación (para tarjeta/transferencia) |
| paidAt | LocalDateTime | Fecha del pago |
| createdBy | UUID | Cajero |

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateInvoiceUseCase` | Crea factura/boleta o proforma con sus ítems |
| `GetInvoiceUseCase` | Obtiene factura por ID con items y pagos |
| `RegisterPaymentUseCase` | Registra un pago y actualiza el estado de la factura |
| `RefundInvoiceUseCase` | Marca una factura como devuelta (PAID → REFUNDED) |
| `GetCashRegisterSummaryUseCase` | Resumen de caja del día por sede |

---

## Endpoints REST

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/invoices` | `FACTURACION_CREATE` | Crear factura/proforma |
| GET | `/api/invoices/{id}` | `FACTURACION_READ` | Ver factura |
| PATCH | `/api/invoices/{id}/refund` | `FACTURACION_REFUND` | Devolver/anular |
| POST | `/api/payments` | `FACTURACION_CREATE` | Registrar pago |
| GET | `/api/invoices/cash-register-summary` | `FACTURACION_READ` | Cierre de caja |

**Parámetros del cierre de caja:** `?sedeId=UUID&date=YYYY-MM-DD`

---

## Reglas de Negocio Clave
1. Una factura PAID no se puede cancelar directamente — debe pasar por REFUNDED.
2. Una factura CANCELLED no puede recibir pagos.
3. Los pagos parciales son permitidos — la factura pasa a PAID automáticamente cuando `isFullyPaid()`.
4. El número de comprobante es correlativo por serie y sede — generado automáticamente.
5. Una proforma (DRAFT) no genera número correlativo hasta `confirmProforma()`.
6. El cierre de caja agrupa por método de pago (efectivo, tarjeta, transferencia, seguro).
