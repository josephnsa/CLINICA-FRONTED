# Smoke Test API por Modulo (Frontend)

Fecha: 2026-04-30

Objetivo: validar rapidamente que cada modulo documentado en `docs/moduls` responde con payload utilizable para frontend.

## Prerrequisitos

- API base en `environment.apiUrl`.
- Token staff con permisos altos (ADMIN) para modulos internos.
- Token portal para rutas `/portal/**`.
- IDs de prueba: `sedeId`, `patientId`, `doctorId`, `appointmentId`, `invoiceId`.

## Seguridad y Accesos

- `POST /auth/login`
- `GET /auth/me`
- `GET /security/users?page=0&size=20`
- `GET /security/roles`
- `GET /security/audit-logs?page=0&size=20`

Esperado:
- Respuesta `{ success, data }`.
- `data` de listas no nulo y paginacion consistente.

## Maestro Clinico

- `GET /catalog/specialties`
- `GET /catalog/services?activeOnly=true`
- `GET /catalog/doctors`
- `GET /catalog/medications?page=0&size=20`
- `GET /catalog/cie10?page=0&size=20`
- `GET /catalog/tariffs?sedeId={sedeId}&page=0&size=20`

## Pacientes

- `GET /patients?search=&page=0&size=20`
- `GET /patients/{patientId}`
- `GET /patients/{patientId}/consents`
- `GET /patients/{patientId}/kardex`

## Agenda

- `GET /appointments?page=0&size=20`
- `GET /appointments/patient/{patientId}`
- `GET /appointments/availability?doctorId={doctorId}&sedeId={sedeId}&date=2026-04-30`
- `GET /availability/rules?doctorId={doctorId}`
- `GET /triage/patient/{patientId}`

## Prescripcion

- `GET /prescriptions?patientId={patientId}`
- `GET /patients/{patientId}/kardex`
- `GET /prescriptions/{id}/pdf` (content-type `application/pdf`)

## Examenes

- `GET /exams/orders?patientId={patientId}&page=0&size=20`
- `GET /exams/orders/{id}/pdf` (content-type `application/pdf`)

## Facturacion y Caja

- `GET /invoices/{invoiceId}`
- `GET /invoices/cash-register-summary?sedeId={sedeId}&date=2026-04-30`
- `GET /invoices/{invoiceId}/pdf` (content-type `application/pdf`)
- `GET /invoices/{invoiceId}/sunat-status`

## Inventario

- `GET /inventory/alerts?sedeId={sedeId}`
- `GET /inventory/batches`
- `GET /inventory/batches/expiring`
- `GET /inventory/purchase-orders`

## RRHH

- `GET /hrm/employees`
- `GET /hrm/employees/{employeeId}/schedules`
- `GET /hrm/attendance?employeeId={employeeId}&from=2026-04-01&to=2026-04-30`
- `GET /hrm/attendance/productivity/{employeeId}?from=2026-04-01&to=2026-04-30`

## Atencion al Cliente

- `GET /customer-service/complaints`
- `GET /customer-service/surveys`

## Reportes

- `POST /reports/operational`
- `POST /reports/clinical`
- `POST /reports/financial`
- `GET /reports/inventory?sedeId={sedeId}`

## Dashboard

- `GET /dashboard/summary?sedeId={sedeId}&year=2026`
- `GET /dashboard/revenue?sedeId={sedeId}&year=2026`
- `GET /dashboard/yearly-breakup?sedeId={sedeId}`
- `GET /dashboard/recent-transactions?sedeId={sedeId}&limit=5`
- `GET /dashboard/performance?sedeId={sedeId}&month=4&year=2026`

## Portal Paciente

- `POST /portal/auth/login`
- `GET /portal/appointments`
- `GET /portal/exams`
- `GET /portal/prescriptions`
- `GET /portal/payments` (si backend lo expone)

## API Publica

- `GET /public/doctors`
- `GET /public/specialties`
- `GET /public/availability?doctorId={doctorId}&date=2026-04-30`

## Criterios de aprobado

1. Codigo HTTP 2xx.
2. Contrato estandar `{ success, data }`.
3. Campos criticos presentes (ids, nombres, fechas, estado).
4. Para PDF: content-type `application/pdf` y bytes no vacios.
5. Sin errores de parsing en frontend (console sin excepciones de shape/payload).

