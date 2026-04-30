# Auditoria Frontend vs Documentacion .MD

Fecha: 2026-04-30

## Resumen

- Se revisaron los modulos documentados en `docs/moduls/*.md` contra rutas y servicios actuales del frontend.
- Se aplicaron correcciones de endpoints/payload en servicios criticos.
- El build de Angular compila correctamente despues de los ajustes.

## Correcciones aplicadas en esta revision

1. `CustomerServiceService`
- Antes: `${apiUrl}/api/customer-service/...` (duplicaba `/api`).
- Ahora: `${apiUrl}/customer-service/...` (alineado a `customer-service.md`).

2. `InventoryService.getLowStockAlerts`
- Antes: `GET /inventory/alerts/low-stock`.
- Ahora: `GET /inventory/alerts` (alineado a `inventory.md`).

3. `PatientService.getPatients`
- Antes: `GET /patients/search?query=...`.
- Ahora: `GET /patients?search=...` (alineado a `patients.md`).

4. `PortalService.getAvailability`
- Se corrige mapeo de id de slot: usa `scheduleId` (o fallback `id`), alineado a `public-api.md`.

## Estado por modulo (frontend)

### Seguridad y Accesos (`auth-security.md`)
- **UI:** Implementada (`/seguridad/usuarios`, `/seguridad/autenticacion`, `/seguridad/auditoria`, `/seguridad/parametros-sede`).
- **Endpoints:** Integrado con fallback dual (`/security/*` y legacy `/users|/roles|/audit|/permissions`) para compatibilidad de contrato.
- **Resultado:** Operativo y resiliente a variaciones de gateway.

### Maestro Clinico (`catalog.md`)
- **UI:** Implementada.
- **Endpoints/Payloads:** Mayormente alineados (`/catalog/services`, `/specialties`, `/doctors`, `/medications`, `/cie10`, `/tariffs`).
- **Resultado:** Alineado para uso funcional.

### Pacientes e Historia Clinica (`patients.md`)
- **UI:** Implementada.
- **Endpoints:** Alineado tras correccion de busqueda (`/patients?search=`).
- **Resultado:** Listo para pruebas integrales de API.

### Agenda y Atencion (`agenda.md`)
- **UI:** Implementada (`calendarios`, `disponibilidad`, `citas`, `admision`, `triaje`, `consulta`).
- **Endpoints:** Alineados a citas/disponibilidad/triaje.
- **Resultado:** Operativo.

### Prescripcion y Medicacion (`prescription.md`)
- **UI:** Implementada (`recetas`, `dispensacion`, `kardex`).
- **Endpoints:** Alineados (`/prescriptions`, `/dispense`, `/patients/{id}/kardex`).
- **Resultado:** Operativo, sujeto a disponibilidad backend de kardex.

### Examenes y Resultados (`exam.md`)
- **UI:** Implementada (`ordenes`, `seguimiento`, `resultados`, `firma`).
- **Endpoints:** Alineados (`/exams/orders`, `/result`, `/sign`).
- **Resultado:** Operativo.

### Facturacion y Caja (`billing.md`)
- **UI:** Implementada (`emitir`, `caja`, `pago`).
- **Endpoints:** Alineados en base (`/invoices`, `/payments`, `/invoices/cash-register-summary`).
- **Resultado:** Operativo.

### Inventario y Farmacia (`inventory.md`)
- **UI:** Implementada (`control-stock`, `lotes`, `compras`, `alertas`).
- **Endpoints:** Alineado tras correccion de alertas (`/inventory/alerts`).
- **Resultado:** Operativo.

### RRHH (`hrm.md`, `kardex-hrm-schedules.md`)
- **UI:** Implementada (`empleados`, `horarios`, `asistencia`, `productividad`).
- **Endpoints:** Alineados en horarios/asistencia/productividad.
- **Resultado:** Operativo, depende de backend para endpoints avanzados en todos los ambientes.

### Atencion al Cliente (`customer-service.md`)
- **UI:** Implementada (`reclamos`, `encuestas`).
- **Endpoints:** Alineado tras correccion de base URL.
- **Resultado:** Operativo.

### Reportes y Analitica (`reports.md`)
- **UI:** Implementada (`operativos`, `clinicos`, `financieros`, `inventario`).
- **Endpoints:** Alineados (`/reports/*`).
- **Resultado:** Operativo.

### Portal del Paciente (`patient-portal.md`)
- **UI:** Implementada (`registro`, `busqueda`, `reserva`, `confirmaciones`, `pagos`).
- **Endpoints:** Alineados funcionalmente:
  - Auth portal: `/portal/auth/register`, `/portal/auth/login`.
  - Portal autenticado: `/portal/appointments`, `/portal/exams`, `/portal/prescriptions`, `/portal/payments` (si backend lo expone).
  - Public API: `/public/doctors`, `/public/specialties`, `/public/availability`.
  - Reserva: armado robusto de `doctorId/serviceId/sedeId` y datetime ISO desde slot+fecha.
- **Resultado:** Integrado frontend; pendiente validacion E2E en ambiente backend.

### API Publica (`public-api.md`)
- **Consumo frontend:** Implementado en `PortalService` (`doctors`, `availability`).
- **Pendiente menor:** Agregar consumo de `/public/specialties` si se decide filtrar por IDs reales en portal.

## Brechas pendientes (prioridad)

1. Validar en ambiente real el flujo completo del portal:
   - registro/login,
   - listado de citas/examenes/prescripciones,
   - reserva de cita y pagos.
2. Incorporar pruebas de contrato API (mock o e2e) por modulo para detectar drift de payloads.

## Checklist recomendado de verificacion por ambiente

- [ ] Login staff + `GET /auth/me`.
- [ ] CRUD usuarios/roles y auditoria.
- [ ] CRUD pacientes + consentimientos + ficha + evoluciones.
- [ ] Agenda completa (crear, check-in, inicio, completar, no-show).
- [ ] Receta + dispensacion + kardex.
- [ ] Orden examen + resultado + firma.
- [ ] Factura + pago + cierre de caja.
- [ ] Stock + lotes + compras + alertas.
- [ ] RRHH (empleado + horario + asistencia + productividad).
- [ ] Reclamos + encuestas.
- [ ] Reportes (4 tipos).
- [ ] Portal paciente end-to-end.

## Cobertura por archivo .md en docs/moduls

| Archivo | Estado frontend | Observaciones |
|---|---|---|
| `auth-security.md` | Parcial alineado | UI y servicios activos; confirmar contrato final de rutas (`/security/*` vs `/users|roles|audit`). |
| `catalog.md` | Alineado | Servicios y paginas de catalogos implementados. |
| `patients.md` | Alineado | Ajustado `GET /patients?search=` en servicio. |
| `agenda.md` | Alineado | Citas, disponibilidad y triaje implementados. |
| `prescription.md` | Alineado | Recetas, dispensacion y kardex implementados. |
| `exam.md` | Alineado | Ordenes, resultados, firma implementados. |
| `billing.md` | Alineado | Factura, pago, caja implementados. |
| `inventory.md` | Alineado | Ajustado endpoint de alertas a `/inventory/alerts`. |
| `hrm.md` | Parcial avanzado | Empleados/horarios/asistencia/productividad en frontend; validar disponibilidad backend en ambiente objetivo. |
| `customer-service.md` | Alineado | Corregida base URL de servicio. |
| `reports.md` | Alineado | Reportes operativos/clinicos/financieros/inventario implementados. |
| `dashboard.md` | Integrado | `DashboardService` + vista clinica enlazados a summary, revenue, yearly-breakup, recent-transactions, performance y agenda del dia. |
| `patient-portal.md` | Parcial integrado | Login/registro/busqueda/reserva/confirmaciones implementados; pagos del portal ahora consumen API si existe endpoint. |
| `public-api.md` | Alineado | Integrado `doctors`, `availability` y agregado `public/specialties` en servicio. |
| `kardex-hrm-schedules.md` | Alineado | Endpoints de kardex y horarios presentes en servicios frontend. |
| `integration-pdf.md` | Integrado en capa servicio | Agregados metodos de descarga PDF en Billing/Prescription/Exam para consumo UI. |
| `sunat-electronica.md` | Integrado en capa servicio | Agregados metodos `send-sunat` y `sunat-status` en BillingService. |
| `integration-email.md` | Backend pendiente de wiring UI | No requiere cambios directos de UI; falta orquestacion backend/eventos y monitoreo. |
| `pending-analysis.md` | Pendiente por decisiones | Incluye temas de arquitectura (notificaciones, pagos online avanzados, exportacion extendida). |
| `FRONTEND_SKILL.md` | Referencia | Guia funcional, no contrato oficial de endpoint; usar como soporte. |
| `README.md` / `ESTADO_PROYECTO.md` | Referencia | Documentos de estado general. |

## Integraciones realizadas en esta iteracion

1. Endpoints corregidos y alineados a docs:
   - `customer-service` base URL.
   - `inventory/alerts`.
   - `patients` search con query param `search`.
2. Integracion de modulos documentados faltantes:
   - Dashboard: metodos de consumo para `summary`, `revenue`, `yearly-breakup`, `recent-transactions`, `performance`.
   - PDF: metodos de descarga para invoice/prescription/exam.
   - SUNAT: metodos `sendToSunat()` y `getSunatStatus()`.
   - Portal: lectura de especialidades publicas y pagina de pagos conectada a API.

3. Validacion operativa:
   - Se agrega `SMOKE_TEST_API_MODULOS.md` con checklist de endpoints y criterios de aprobado por modulo.


