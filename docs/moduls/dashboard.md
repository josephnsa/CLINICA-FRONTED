# Módulo: Dashboard

## Propósito
Provee endpoints analíticos para alimentar el dashboard AdminMart con datos reales de la base de datos. Todos los endpoints requieren `sedeId` para soportar multi-sede y están protegidos con `REPORTES_READ`.

---

## Endpoints

| Método | Ruta | Descripción | Widget AdminMart |
|--------|------|-------------|-----------------|
| GET | `/api/dashboard/summary` | KPIs del mes actual | Monthly Earnings + cifras Yearly Breakup |
| GET | `/api/dashboard/revenue` | Ingresos mes a mes (12 meses) | Revenue Updates (barras) |
| GET | `/api/dashboard/yearly-breakup` | Últimos 3 años con % crecimiento | Yearly Breakup (donut) |
| GET | `/api/dashboard/recent-transactions` | Últimos N pagos | Recent Transactions |
| GET | `/api/dashboard/performance` | Rendimiento médico/servicio con badge | Product Performance (tabla) |

---

## GET /api/dashboard/summary

### Query params
| Parámetro | Requerido | Default | Descripción |
|-----------|-----------|---------|-------------|
| `sedeId` | Sí | — | UUID de la sede |
| `year` | No | año actual | Año para el cálculo anual |

### Respuesta
```json
{
  "currentMonthRevenue": 6820.00,
  "monthOverMonthChange": 9.0,
  "currentYearRevenue": 36358.00,
  "yearOverYearChange": 9.0,
  "currentMonthAppointments": 142,
  "newPatientsThisMonth": 18
}
```

**Mapeo de campos:**
- `currentMonthRevenue` → "Monthly Earnings" número principal
- `monthOverMonthChange` → badge "+9% last month"
- `currentYearRevenue` → número central del donut "Yearly Breakup"
- `yearOverYearChange` → badge "+9% last year"
- `currentMonthAppointments` → KPI de citas del mes
- `newPatientsThisMonth` → KPI de pacientes nuevos

---

## GET /api/dashboard/revenue

### Query params
| Parámetro | Requerido | Default | Descripción |
|-----------|-----------|---------|-------------|
| `sedeId` | Sí | — | UUID de la sede |
| `year` | No | año actual | Año del gráfico (selector del widget) |

### Respuesta — array de 12 elementos
```json
[
  { "month": 1, "monthLabel": "Jan", "totalInvoiced": 2850.00, "appointmentCount": 42 },
  { "month": 2, "monthLabel": "Feb", "totalInvoiced": 3200.00, "appointmentCount": 51 },
  ...
  { "month": 12, "monthLabel": "Dec", "totalInvoiced": 0, "appointmentCount": 0 }
]
```

Los meses sin datos devuelven `totalInvoiced: 0`. Solo cuenta facturas con `status = 'PAID'`.

---

## GET /api/dashboard/yearly-breakup

### Query params
| Parámetro | Requerido | Descripción |
|-----------|-----------|-------------|
| `sedeId` | Sí | UUID de la sede |

### Respuesta
```json
{
  "years": [
    { "year": 2026, "totalRevenue": 36358.00, "growthPercent": 9.0 },
    { "year": 2025, "totalRevenue": 33357.00, "growthPercent": 12.5 },
    { "year": 2024, "totalRevenue": 29650.00, "growthPercent": null }
  ]
}
```

`growthPercent` es `null` para el año más antiguo (sin base de comparación). Los 3 segmentos del donut corresponden a `years[0..2].totalRevenue`.

---

## GET /api/dashboard/recent-transactions

### Query params
| Parámetro | Requerido | Default | Descripción |
|-----------|-----------|---------|-------------|
| `sedeId` | Sí | — | UUID de la sede |
| `limit` | No | 10 | Máximo registros (tope: 50) |

### Respuesta — array
```json
[
  {
    "invoiceId": "uuid",
    "paidAt": "2026-04-15T08:45:00",
    "patientFullName": "John Doe",
    "description": "Consulta Medicina General",
    "amount": 385.90,
    "status": "PAID",
    "paymentMethod": "CASH"
  }
]
```

**Mapeo "Recent Transactions":**
- `paidAt` (hora) → columna de hora ("08:45 am")
- `patientFullName` + `description` → texto de la fila
- `amount` → monto a la derecha
- `status` → badge (PAID=verde, PENDING=naranja)

---

## GET /api/dashboard/performance

### Query params
| Parámetro | Requerido | Default | Descripción |
|-----------|-----------|---------|-------------|
| `sedeId` | Sí | — | UUID de la sede |
| `month` | No | mes actual | Mes del período |
| `year` | No | año actual | Año del período |

### Respuesta — array ordenado por revenue desc
```json
[
  {
    "doctorId": "uuid",
    "doctorName": "Dr. Sunil Joshi",
    "serviceName": "Cardiología",
    "appointmentCount": 38,
    "revenueGenerated": 24500.00,
    "priority": "HIGH"
  }
]
```

**Lógica de badge `priority`:**
| Valor | Condición |
|-------|-----------|
| `CRITICAL` | `appointmentCount == 0` |
| `HIGH` | revenue > percentil 75 del período |
| `MEDIUM` | revenue > percentil 50 del período |
| `LOW` | resto |

**Mapeo "Product Performance":**
- `doctorId` → columna Id
- `doctorName` → columna Assigned
- `serviceName` → columna Name
- `priority` → badge de color (HIGH=rojo, MEDIUM=naranja, LOW=verde, CRITICAL=gris)
- `revenueGenerated` → columna Budget (en S/)

---

## Migración

**V18__dashboard_indexes.sql** — Índices de performance para queries analíticas:
- `idx_invoices_sede_status_created` — cubre Revenue Updates y Summary
- `idx_payments_paid_at_desc` — cubre Recent Transactions
- `idx_appointments_sede_start_status` — cubre Performance y Summary
- `idx_appointments_patient_sede_start` — cubre cálculo de pacientes nuevos

---

## Permisos
| Código | Roles que lo tienen |
|--------|---------------------|
| `REPORTES_READ` | ADMIN, MEDICO (según seed V12) |

---

## Notas de integración para el frontend

1. **Llamada inicial del dashboard:** hacer los 5 requests en paralelo al cargar la página.
2. **Selector de año en "Revenue Updates":** al cambiar el año, llamar solo a `/revenue?sedeId=...&year={año}`.
3. **Filtro de sede:** el `sedeId` debe venir del JWT del usuario logueado (`claims.sedeId`).
4. **Formato de moneda:** todos los montos están en **soles peruanos (PEN)**. Formatear como `S/ 6,820.00`.
5. **Colores de badge `priority`:** `HIGH` → `#e74c3c`, `MEDIUM` → `#f39c12`, `LOW` → `#2ecc71`, `CRITICAL` → `#7f8c8d`.
6. **`growthPercent` positivo** → mostrar en verde con `+`; negativo → rojo.

---

## Dependencias con otros módulos
- **Billing**: tablas `invoices`, `invoice_items`, `payments`
- **Agenda**: tabla `appointments`
- **Catalog**: tablas `doctors`, `users`, `services`
- **Patients**: tabla `patients` (para nombre y conteo de nuevos)
- **Sedes**: todas las queries filtran por `sede_id`
