# Módulo: Reportes y Analítica

## Propósito
Genera reportes agregados de los datos del sistema para la toma de decisiones operativas, financieras y clínicas. Todos los reportes son de solo lectura y se calculan mediante consultas SQL nativas sobre múltiples tablas.

---

## Tipos de Reportes

### 1. Reporte Operativo
**Endpoint:** `POST /api/reports/operational`

Muestra el desempeño de atención médica en un período y sede.

**Datos que devuelve:**
| Campo | Descripción |
|---|---|
| totalAppointments | Total de citas en el período |
| attendedAppointments | Citas completadas (ATTENDED) |
| cancelledAppointments | Citas canceladas |
| noShowAppointments | Inasistencias |
| attendanceRate | % de atención = atendidas / total |
| noShowRate | % de inasistencia |
| avgConsultationMinutes | Duración promedio de consulta |

**Filtros:** `sedeId`, `dateFrom`, `dateTo`

---

### 2. Reporte Financiero
**Endpoint:** `POST /api/reports/financial`

Muestra la situación de facturación y cobros en un período.

**Datos que devuelve:**
| Campo | Descripción |
|---|---|
| totalInvoices | Número de comprobantes emitidos |
| totalBilled | Monto total facturado |
| totalCollected | Monto efectivamente cobrado |
| totalPending | Monto pendiente de cobro |
| totalRefunded | Monto devuelto/anulado |
| paidInvoices | Facturas pagadas |
| pendingInvoices | Facturas pendientes |
| avgInvoiceAmount | Ticket promedio |
| cashAmount | Cobros en efectivo |
| cardAmount | Cobros con tarjeta |
| transferAmount | Cobros por transferencia |
| insuranceAmount | Cobros por seguro |

**Filtros:** `sedeId`, `dateFrom`, `dateTo`

---

### 3. Reporte de Inventario
**Endpoint:** `GET /api/reports/inventory?sedeId=`

Muestra el estado actual del stock en una sede.

**Datos que devuelve:**
| Campo | Descripción |
|---|---|
| totalItems | Total de ítems en el inventario |
| lowStockItems | Ítems en stock mínimo |
| outOfStockItems | Ítems sin stock |
| expiringIn30Days | Lotes por vencer en 30 días |
| expiredItems | Lotes ya vencidos |
| criticalItems | Lista de ítems críticos con tipo de alerta |

**Tipos de alerta en ítems críticos:**
- `OUT_OF_STOCK` — sin stock
- `LOW_STOCK` — bajo stock mínimo
- `EXPIRING_SOON` — vence en ≤ 30 días

---

### 4. Reporte Clínico
**Endpoint:** `POST /api/reports/clinical`

Muestra patrones clínicos del período: diagnósticos, servicios y medicamentos más frecuentes.

**Datos que devuelve:**
| Campo | Descripción |
|---|---|
| totalConsultations | Notas clínicas generadas |
| totalExamOrders | Órdenes de examen emitidas |
| totalPrescriptions | Recetas emitidas |
| topDiagnoses | Top 10 diagnósticos CIE-10 más frecuentes |
| topServices | Top 10 servicios más atendidos |
| topMedications | Top 10 medicamentos más prescritos |

**Filtros:** `sedeId`, `dateFrom`, `dateTo`

---

## DTO Común: ReportRequest
```json
{
  "sedeId": "UUID",
  "dateFrom": "YYYY-MM-DD",
  "dateTo": "YYYY-MM-DD"
}
```
**Validaciones:**
- `dateTo` no puede ser anterior a `dateFrom`
- El rango no puede superar 366 días

---

## Endpoints REST

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/reports/operational` | `REPORTES_READ` | Reporte operativo |
| POST | `/api/reports/financial` | `REPORTES_READ` | Reporte financiero |
| GET | `/api/reports/inventory` | `REPORTES_READ` | Reporte de inventario |
| POST | `/api/reports/clinical` | `REPORTES_READ` | Reporte clínico |

---

## Notas para el Frontend
- Todos los reportes son ideales para **gráficos de barras, líneas o dona**.
- El reporte operativo sirve para el **dashboard principal** (tasa de asistencia, no-shows).
- El reporte financiero sirve para el módulo de **caja y contabilidad**.
- El reporte de inventario sirve para la **vista de farmacia** con alertas visuales.
- El reporte clínico sirve para el **análisis epidemiológico** de la clínica.
