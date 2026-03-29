# Estado del Proyecto — Clínica Yoselin Backend

> Última actualización: 2026-03-28
> Referencia: PDF "Módulos App Clínica" — 13 módulos requeridos

---

## Resumen Ejecutivo

| Estado | Módulos |
|---|---|
| ✅ Culminado | 9 de 13 |
| ⚠️ Parcial (falta funcionalidad menor) | 2 de 13 |
| ❌ Pendiente / Requiere análisis | 2 de 13 |

---

## Módulos Culminados ✅

### 1. Seguridad y Accesos — `auth` + `security`
**Endpoints activos:** `/api/auth/login`, `/api/auth/me`, `/api/users`, `/api/roles`, `/api/audit`

| Feature del PDF | Estado |
|---|---|
| Usuarios / Roles / Permisos | ✅ CRUD completo |
| Autenticación personal interno (JWT) | ✅ Stateless, claims: role, permissions, sedeId |
| Auditoría de acciones | ✅ AuditLogController |
| Gestión de sedes (multisede) | ✅ SedeController con toggle activo/inactivo |

---

### 2. Maestro Clínico — `catalog`
**Endpoints activos:** `/api/catalog/specialties`, `/api/catalog/services`, `/api/catalog/doctors`, `/api/catalog/medications`, `/api/catalog/tariffs`, `/api/catalog/sedes`, `/api/catalog/cie10`

| Feature del PDF | Estado |
|---|---|
| Catálogo de especialidades | ✅ CRUD completo |
| Catálogo de servicios | ✅ CRUD completo |
| Catálogo de médicos/especialistas | ✅ CRUD + toggle activo |
| Catálogo de medicamentos | ✅ CRUD + búsqueda |
| Catálogo CIE-10 | ✅ Búsqueda por código/descripción |
| Tarifarios por sede | ✅ CRUD + toggle activo |

---

### 3. Pacientes e Historia Clínica — `patients` + `clinical`
**Endpoints activos:** `/api/patients`, `/api/patients/{id}/consents`, `/api/clinical-notes`

| Feature del PDF | Estado |
|---|---|
| Registro de paciente (datos, contactos) | ✅ Crear, actualizar, buscar, obtener |
| Contacto de emergencia | ✅ Campos en entidad + validación de negocio |
| Consentimientos y documentos | ✅ ConsentController (crear, listar, eliminar) |
| Ficha clínica (alergias, antecedentes) | ✅ ClinicalProfile con lógica de negocio |
| Evoluciones / notas clínicas | ✅ ClinicalNoteController + historial |

---

### 4. Agenda, Disponibilidad y Atención — `agenda`
**Endpoints activos:** `/api/appointments`, `/api/availability/rules`, `/api/availability/blocks`, `/api/triage`

| Feature del PDF | Estado |
|---|---|
| Crear / cancelar cita | ✅ |
| Reprogramar cita | ✅ `PATCH /{id}/reschedule` |
| Admisión / Check-in | ✅ `PATCH /{id}/checkin` |
| Iniciar consulta | ✅ `PATCH /{id}/start-consultation` |
| Completar consulta | ✅ `PATCH /{id}/complete` |
| No show | ✅ `PATCH /{id}/no-show` |
| Reglas de disponibilidad semanal | ✅ por doctor + sede + día de semana |
| Bloqueos (vacaciones, feriados) | ✅ rango de fechas con motivo |
| Triaje | ✅ signos vitales, nivel (EMERGENCY/URGENT/NORMAL/LOW), IMC automático |

---

### 7. Exámenes y Resultados — `exam`
**Endpoints activos:** `/api/exams/orders`

| Feature del PDF | Estado |
|---|---|
| Órdenes de examen | ✅ Crear, listar por paciente |
| Seguimiento de estado | ✅ PENDIENTE → EN_PROCESO → LISTO → ENTREGADO |
| Registro de resultados | ✅ `POST /{id}/result` |
| Validación y firma profesional | ✅ `PATCH /{id}/sign` con permiso `EXAMENES_SIGN` |

---

### 8. Facturación y Caja — `billing`
**Endpoints activos:** `/api/invoices`, `/api/payments`

| Feature del PDF | Estado |
|---|---|
| Proformas / presupuestos | ✅ Status `DRAFT` + confirmar proforma |
| Boletas / facturas | ✅ Crear con ítems y cálculo automático |
| Registro de pagos | ✅ CASH / CARD / TRANSFER / INSURANCE |
| Notas de crédito / devoluciones | ✅ `PATCH /{id}/refund` con permiso `FACTURACION_REFUND` |
| Cierre de caja / arqueo | ✅ `GET /cash-register-summary?sedeId&date` |

---

### 9. Inventario y Farmacia — `inventory`
**Endpoints activos:** `/api/inventory/movements`, `/api/inventory/alerts`, `/api/inventory/batches`, `/api/inventory/suppliers`, `/api/inventory/purchase-orders`

| Feature del PDF | Estado |
|---|---|
| Control de stock (entradas, salidas, ajustes) | ✅ RegisterInventoryMovementUseCase |
| Alertas de stock mínimo | ✅ GetLowStockAlertsUseCase |
| Gestión de lotes y fechas de vencimiento | ✅ InventoryBatchController + alertas de vencimiento |
| Proveedores | ✅ CRUD completo + toggle activo |
| Órdenes de compra | ✅ PENDING → APPROVED → RECEIVED + cancelar |

---

### 11. Atención al Cliente — `customerservice`
**Endpoints activos:** `/api/customer-service/complaints`, `/api/customer-service/surveys`

| Feature del PDF | Estado |
|---|---|
| Registro de reclamos | ✅ Con tipo, prioridad y descripción |
| Seguimiento de reclamos | ✅ Asignar, resolver, cerrar, escalar prioridad |
| Encuestas de satisfacción | ✅ Puntaje 1–5 + promedio por sede |

---

### 12. Reportes y Analítica — `reports`
**Endpoints activos:** `/api/reports/operational`, `/api/reports/financial`, `/api/reports/clinical`, `/api/reports/inventory`

| Feature del PDF | Estado |
|---|---|
| Reporte operativo (citas, tiempos, no-shows) | ✅ Tasa de asistencia, duración promedio |
| Reporte financiero (ventas, caja) | ✅ Por método de pago, total cobrado vs pendiente |
| Reporte clínico (diagnósticos, tratamientos) | ✅ Top diagnósticos, servicios, medicamentos |
| Reporte de inventario (stock, vencimientos) | ✅ Stock crítico, ítems por vencer en 30 días |

---

## Módulos Parciales ⚠️

### 6. Prescripción y Medicación — `prescription`
**Endpoints activos:** `/api/prescriptions`

| Feature del PDF | Estado |
|---|---|
| Recetas con dosis, frecuencia, duración | ✅ Crear con ítems |
| Control de dispensación | ✅ `POST /{id}/dispense` |
| **Kardex de medicación por paciente** | ❌ **PENDIENTE** |

**Qué falta:**
- `GetMedicationKardexUseCase` — lectura de tabla `medication_kardex`
- Endpoint `GET /api/patients/{patientId}/kardex`
- La tabla `medication_kardex` ya existe en la migración V10

**Estimado:** 1–2 horas. Bajo riesgo, sin dependencias bloqueantes.

---

### 10. RR.HH. y Empleados — `hrm`
**Endpoints activos:** `/api/hrm/employees`

| Feature del PDF | Estado |
|---|---|
| Ficha de empleado (cargo, colegiatura) | ✅ Crear, listar, desactivar |
| Gestión de horarios | ⚠️ Dominio `EmployeeSchedule` existe, sin endpoint |
| **Control de asistencia** | ❌ **PENDIENTE** |
| Métricas de productividad | ❌ (considerado Fase 3) |

**Qué falta:**
- Endpoint de horarios del empleado (CRUD sobre `employee_schedules`)
- `RegisterAttendanceUseCase` + tabla de asistencia + endpoint
- Decisión previa: ¿registro manual por endpoint o integración con biométrico/QR?

**Estimado:** 3–4 horas para horarios. Asistencia requiere decisión de diseño primero.

---

## Módulos Pendientes — Requieren Análisis ❌

### 5. Portal del Paciente
**No existe ninguna implementación.**

| Feature del PDF | Estado |
|---|---|
| Registro / login de pacientes | ❌ Requiere auth separada para rol PACIENTE |
| Búsqueda de médico/servicio/sede | ❌ Requiere endpoints públicos (sin JWT) |
| Disponibilidad en tiempo real | ❌ Posiblemente WebSocket / SSE |
| Reserva, reprogramar, cancelar cita | ❌ Reutiliza agenda pero con contexto paciente |
| Confirmaciones y recordatorios | ❌ Requiere servicio de email/WhatsApp |
| Pagos online | ❌ Requiere integración pasarela (Culqi/Niubiz) |

**Decisiones de diseño necesarias antes de implementar:**
1. ¿Portal web (SPA) o app móvil?
2. ¿Auth separada para pacientes o OAuth externo (Google)?
3. ¿Confirmaciones por email (SendGrid/SMTP) o WhatsApp (Twilio)?
4. ¿Pasarela de pagos: Culqi (Perú) o Niubiz?

---

### 13. Configuración e Integraciones
**No existe ninguna implementación.**

| Feature del PDF | Estado |
|---|---|
| Plantillas de documentos (recetas, informes, consentimientos) | ❌ Requiere elegir librería PDF |
| Exportación Excel/PDF de reportes | ❌ iText 7 vs JasperReports vs Apache POI |
| Notificaciones email | ❌ `spring-boot-starter-mail` + plantillas |
| Notificaciones WhatsApp/SMS | ❌ Twilio Business verificado |
| Integración pasarela de pagos | ❌ Webhooks + reconciliación |
| API pública para terceros | ❌ API Key + rate limiting |

**Decisiones de diseño necesarias:**
1. Librería PDF: **iText 7** (potente, licencia AGPL) vs **Thymeleaf + Flying Saucer** (HTML a PDF, más simple)
2. Notificaciones: ¿email primero (más barato) o directo a WhatsApp Business?
3. API pública: ¿OAuth2 o API Key simple?

---

## Backlog Priorizado

### Prioridad Alta — Completa el core del producto
| # | Tarea | Módulo | Esfuerzo |
|---|---|---|---|
| 1 | Kardex de medicación | `prescription` | Bajo (1–2h) |
| 2 | CRUD horarios empleado | `hrm` | Bajo (2h) |

### Prioridad Media — Requiere decisión de diseño
| # | Tarea | Decisión previa |
|---|---|---|
| 3 | Control de asistencia HRM | Manual vs biométrico/QR |
| 4 | Exportación PDF de reportes/recetas | Librería a elegir |
| 5 | Notificaciones por email | SMTP propio vs SendGrid |

### Prioridad Baja — Fase 3 (producto SaaS)
| # | Tarea |
|---|---|
| 6 | Portal del paciente completo |
| 7 | Notificaciones WhatsApp (Twilio) |
| 8 | Pagos online (Culqi/Niubiz) |
| 9 | API pública con API Keys |

---

## Cobertura de Endpoints por Módulo

| Módulo | Controladores | Use Cases |
|---|---|---|
| auth | 1 | 2 (login, register) |
| security | 3 (users, roles, audit) | 2+ |
| catalog | 6 (specialty, service, doctor, medication, tariff, sede, cie10) | 12+ |
| patients | 2 (patient, consent) | 5 |
| clinical | 1 | 2 |
| agenda | 3 (appointment, availability, triage) | 10 |
| billing | 1 | 4 |
| exam | 1 | 4 |
| prescription | 1 | 3 |
| inventory | 4 (movement, batch, supplier, purchaseOrder) | 3+ |
| hrm | 1 | 3 |
| customerservice | 1 | 3 |
| reports | 1 | 4 |
| **Total** | **~27 controladores** | **~57 use cases** |
