# Frontend Skill — Clínica Yoselin Backend API

Documento de referencia completo para construir el frontend contra este backend. Contiene convenciones, todos los endpoints, shapes de request/response, máquinas de estado y reglas de UI.

---

## 1. Configuración Base

```
Base URL:     http://localhost:9090
Content-Type: application/json
Auth header:  Authorization: Bearer <jwt_token>
Swagger UI:   http://localhost:9090/swagger-ui.html
```

### Respuesta estándar (siempre igual)
```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "timestamp": "2026-03-25T10:00:00"
}
```
- `success: false` → error. Leer `message` para mostrar al usuario.
- `data` puede ser `null`, un objeto o un array.

### Errores comunes
| HTTP | Cuándo |
|---|---|
| 400 | Validación fallida (campos requeridos, formatos) |
| 401 | Token ausente, expirado o inválido |
| 403 | El usuario no tiene el permiso requerido |
| 404 | Recurso no encontrado |
| 422 | Regla de negocio violada (BusinessRuleException) |

---

## 2. Autenticación

### Login
```
POST /api/auth/login
Body: { "email": "string", "password": "string" }
```
```json
// Response data:
{
  "token": "eyJ...",
  "userId": "uuid",
  "fullName": "Dr. Juan Pérez",
  "role": "DOCTOR",
  "permissions": ["agenda:create", "agenda:read", ...],
  "sedeId": "uuid"
}
```
**Guardar en el cliente:** token, permissions[], sedeId, role, userId.

### Perfil del usuario autenticado
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Cambiar contraseña
```
POST /api/auth/change-password
Body: { "currentPassword": "string", "newPassword": "string" }
```

---

## 3. Control de acceso en el frontend

Los **permisos** vienen en el JWT. Úsalos para mostrar/ocultar elementos de UI.

```js
// Ejemplo de guardia de permiso (React/Angular)
const hasPermission = (perm) => permissions.includes(perm)

// Mostrar botón "Nueva Cita" solo si tiene permiso
{hasPermission('agenda:create') && <Button>Nueva Cita</Button>}
```

### Mapa de permisos por módulo

| Módulo | Ver | Crear/Editar | Acciones especiales |
|---|---|---|---|
| Agenda | `agenda:read` | `agenda:create` | `agenda:cancel`, `agenda:reschedule`, `agenda:checkin`, `agenda:start`, `agenda:complete`, `agenda:noshow`, `agenda:triage` |
| Disponibilidad | `agenda:availability` | `agenda:availability` | — |
| Pacientes | `patients:read` | `patients:write` | — |
| Facturación | `FACTURACION_READ` | `FACTURACION_CREATE` | `FACTURACION_REFUND` |
| Inventario | `INVENTARIO_READ` | `INVENTARIO_WRITE` | — |
| Exámenes | `EXAMENES_READ` | `EXAMENES_CREATE` | `EXAMENES_RESULT`, `EXAMENES_SIGN` |
| Recetas | `PRESCRIPCIONES_READ` | `PRESCRIPCIONES_CREATE` | `PRESCRIPCIONES_DISPENSE` |
| Catálogo | `CATALOGO_READ` | `CATALOGO_WRITE` | — |
| Reportes | `REPORTES_READ` | — | — |
| RR.HH. | `hrm:read` | `hrm:write` | — |
| At. Cliente | — | `cs:write` | — |
| Seguridad | `SEGURIDAD_READ` | `SEGURIDAD_WRITE` | — |

### Roles predefinidos y qué ven
| Rol | Pantallas principales |
|---|---|
| `ADMIN` | Todo |
| `DOCTOR` | Agenda, Pacientes, Exámenes, Recetas, Historia Clínica |
| `NURSE` | Agenda (checkin + triaje), Pacientes (solo lectura), Inventario (lectura) |
| `RECEPTIONIST` | Agenda (crear/cancelar), Pacientes, Facturación |
| `PHARMACIST` | Recetas (dispensar), Inventario completo |
| `CASHIER` | Facturación, Reportes |

---

## 4. Módulo Agenda

### Flujo de una cita (máquina de estados)
```
PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → ATTENDED
                                 ↘ CANCELLED
         ↘ CANCELLED             ↘ NO_SHOW
```

**Acciones disponibles según estado:**
| Estado actual | Acciones habilitadas |
|---|---|
| PENDING | Confirmar (implícita), Cancelar, Reprogramar |
| CONFIRMED | Check-in, Cancelar, Reprogramar |
| CHECKED_IN | Iniciar consulta, No show |
| IN_PROGRESS | Completar |
| ATTENDED | (ninguna — solo lectura) |
| CANCELLED | (ninguna — solo lectura) |
| NO_SHOW | (ninguna — solo lectura) |

### Endpoints

#### Crear cita
```
POST /api/appointments
Permiso: agenda:create
Body:
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "serviceId": "uuid",
  "sedeId": "uuid",
  "startTime": "2026-03-25T09:00:00",
  "endTime": "2026-03-25T09:30:00",
  "notes": "string (opcional)"
}
```

#### Cancelar cita
```
DELETE /api/appointments/{id}?reason=Motivo
Permiso: agenda:cancel
```

#### Ver disponibilidad (slots libres)
```
GET /api/appointments/availability?doctorId=uuid&sedeId=uuid&date=2026-03-25
Permiso: agenda:availability
Response data: [{ "startTime": "09:00", "endTime": "09:30", "available": true }, ...]
```

#### Citas por paciente
```
GET /api/appointments/patient/{patientId}?page=0&size=20
Permiso: agenda:read
```

#### Reprogramar
```
PATCH /api/appointments/{id}/reschedule
Permiso: agenda:reschedule
Body: { "newStart": "datetime", "newEnd": "datetime", "reason": "string" }
```

#### Transiciones de estado
```
PATCH /api/appointments/{id}/checkin          → Permiso: agenda:checkin
PATCH /api/appointments/{id}/start-consultation → Permiso: agenda:start
PATCH /api/appointments/{id}/complete         → Permiso: agenda:complete
PATCH /api/appointments/{id}/no-show          → Permiso: agenda:noshow
```
Todas retornan el objeto `AppointmentResponse` actualizado.

#### Response de cita
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "patientFullName": "string",
  "doctorId": "uuid",
  "doctorFullName": "string",
  "serviceId": "uuid",
  "serviceName": "string",
  "sedeId": "uuid",
  "startTime": "2026-03-25T09:00:00",
  "endTime": "2026-03-25T09:30:00",
  "status": "PENDING",
  "notes": "string",
  "cancellationReason": "string"
}
```

---

## 5. Módulo Disponibilidad

### Reglas semanales del médico

#### Crear regla (horario habitual)
```
POST /api/availability/rules
Permiso: agenda:availability
Body:
{
  "doctorId": "uuid",
  "sedeId": "uuid",
  "dayOfWeek": 1,        // 1=Lunes, 7=Domingo
  "startTime": "08:00",
  "endTime": "13:00"
}
```

#### Listar reglas
```
GET /api/availability/rules?doctorId=uuid
Response data: [{ "id", "dayOfWeek", "dayName": "Lunes", "startTime", "endTime", "active" }]
```

#### Desactivar regla
```
DELETE /api/availability/rules/{ruleId}
```

### Bloqueos (vacaciones, feriados)

#### Crear bloqueo
```
POST /api/availability/blocks
Body:
{
  "doctorId": "uuid",
  "sedeId": "uuid",
  "startDt": "2026-04-01T00:00:00",
  "endDt": "2026-04-07T23:59:59",
  "reason": "Vacaciones"
}
```

#### Listar bloqueos
```
GET /api/availability/blocks?doctorId=uuid
```

#### Eliminar bloqueo
```
DELETE /api/availability/blocks/{blockId}
```

---

## 6. Módulo Triaje

#### Registrar triaje
```
POST /api/triage
Permiso: agenda:triage
Body:
{
  "appointmentId": "uuid",
  "patientId": "uuid",
  "bloodPressure": "120/80",
  "heartRate": 72,
  "respiratoryRate": 16,
  "temperature": 36.5,
  "oxygenSaturation": 98,
  "weight": 70.5,
  "height": 170.0,
  "triageLevel": "NORMAL",   // EMERGENCY | URGENT | NORMAL | LOW
  "notes": "string"
}
```

#### Response de triaje
```json
{
  "id": "uuid",
  "appointmentId": "uuid",
  "patientId": "uuid",
  "triageLevel": "NORMAL",
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 36.5,
  "oxygenSaturation": 98,
  "weight": 70.5,
  "height": 170.0,
  "bmi": 24.4,
  "critical": false,
  "recordedAt": "2026-03-25T09:05:00"
}
```

**Regla UI:** Si `critical: true` (EMERGENCY o URGENT) → mostrar alerta visual prominente (rojo/naranja).

```
GET /api/triage/appointment/{appointmentId}   → triaje de una cita
GET /api/triage/patient/{patientId}           → historial de triajes del paciente
```

---

## 7. Módulo Pacientes

#### Crear paciente
```
POST /api/patients
Permiso: patients:write
Body:
{
  "docType": "DNI",
  "docNumber": "12345678",
  "firstName": "María",
  "lastName": "García",
  "birthDate": "1990-05-15",
  "gender": "F",            // M | F | OTHER
  "email": "string",
  "phone": "string",
  "address": "string",
  "bloodType": "O+",
  "emergencyName": "string",
  "emergencyPhone": "string"
}
```

#### Buscar pacientes
```
GET /api/patients?search=García&page=0&size=20
Permiso: patients:read
```

#### Obtener paciente
```
GET /api/patients/{id}
```

#### Consentimientos informados
```
POST /api/patients/{id}/consents
Body: { "type": "CIRUGÍA", "fileUrl": "https://..." }

GET  /api/patients/{id}/consents
DELETE /api/patients/{id}/consents/{consentId}
```

**Tipos de consentimiento sugeridos para el select:** `CIRUGÍA`, `ANESTESIA`, `TRATAMIENTO`, `FOTOGRAFÍA`, `DATOS_PERSONALES`, `OTRO`

---

## 8. Módulo Catálogo

### Especialidades
```
GET    /api/catalog/specialties
POST   /api/catalog/specialties    Body: { "code": "CARD", "name": "Cardiología" }
PUT    /api/catalog/specialties/{id}
DELETE /api/catalog/specialties/{id}
```

### Servicios
```
GET    /api/catalog/services
POST   /api/catalog/services
Body:
{
  "code": "CONS-CARD",
  "name": "Consulta Cardiología",
  "specialtyId": "uuid",
  "durationMin": 30,
  "price": 150.00
}
```

### Médicos
```
GET  /api/catalog/doctors?specialtyId=uuid&active=true
GET  /api/catalog/doctors/{id}
POST /api/catalog/doctors   Body: { "userId": "uuid", "licenseNumber": "12345", "specialtyId": "uuid" }
PUT  /api/catalog/doctors/{id}
PATCH /api/catalog/doctors/{id}/toggle
```

### Medicamentos
```
GET  /api/catalog/medications?search=amoxicilina
POST /api/catalog/medications
Body: { "code": "MED001", "genericName": "Amoxicilina", "commercialName": "Amoxil", "presentation": "Cápsula", "unit": "500mg" }
```

### Tarifarios
```
GET   /api/catalog/tariffs?sedeId=uuid&serviceId=uuid
POST  /api/catalog/tariffs
Body: { "serviceId": "uuid", "sedeId": "uuid", "name": "Particular", "price": 150.00 }
PUT   /api/catalog/tariffs/{id}   Body: { "name": "string", "price": 120.00 }
PATCH /api/catalog/tariffs/{id}/toggle
```

### Sedes
```
GET   /api/catalog/sedes            → incluye usuarios asignados por sede
POST  /api/catalog/sedes            Body: { "code": "S001", "name": "Sede Central", "address": "..." }
PUT   /api/catalog/sedes/{id}
PATCH /api/catalog/sedes/{id}/toggle
```

### CIE-10
```
GET /api/catalog/cie10?search=diabetes
Response: [{ "code": "E11", "description": "Diabetes mellitus tipo 2", "category": "..." }]
```

---

## 9. Módulo Facturación

#### Crear factura
```
POST /api/invoices
Permiso: FACTURACION_CREATE
Body:
{
  "patientId": "uuid",
  "sedeId": "uuid",
  "serie": "B001",
  "items": [
    { "serviceId": "uuid", "description": "Consulta", "quantity": 1, "unitPrice": 150.00 }
  ],
  "notes": "string"
}
```

**Nota UI:** Si `status: "DRAFT"` → es proforma. Mostrar botón "Confirmar proforma" para convertirla en comprobante real.

#### Flujo de estados de factura
```
DRAFT → PENDING → PAID
              → CANCELLED
              → REFUNDED
```

**Acciones según estado:**
| Estado | Acciones disponibles |
|---|---|
| DRAFT | Confirmar proforma, Cancelar |
| PENDING | Registrar pago, Cancelar |
| PAID | Ver detalle, Anular/Devolver |
| CANCELLED | (solo lectura) |
| REFUNDED | (solo lectura) |

```
GET    /api/invoices/{id}
PATCH  /api/invoices/{id}/refund     Permiso: FACTURACION_REFUND
POST   /api/payments                 Body: { "invoiceId": "uuid", "amount": 150.00, "method": "CASH", "reference": "op-123" }
GET    /api/invoices/cash-register-summary?sedeId=uuid&date=2026-03-25
```

**Métodos de pago:** `CASH` | `CARD` | `TRANSFER` | `INSURANCE`

---

## 10. Módulo Exámenes

#### Crear orden
```
POST /api/exams/orders
Permiso: EXAMENES_CREATE
Body:
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentId": "uuid",
  "notes": "string",
  "items": [{ "serviceId": "uuid" }]
}
```

#### Flujo de estados
```
PENDIENTE → EN_PROCESO → LISTO → ENTREGADO
```

**Acciones según estado:**
| Estado | Acción |
|---|---|
| PENDIENTE | (laboratorio inicia procesamiento — interno) |
| EN_PROCESO | Registrar resultado, Firmar |
| LISTO | Firmar, Marcar entregado |
| ENTREGADO | Solo lectura |

```
POST  /api/exams/orders/{id}/result   Permiso: EXAMENES_RESULT
Body: { "resultText": "Hemoglobina: 14 g/dL. Hematocrito: 42%." }

PATCH /api/exams/orders/{id}/sign     Permiso: EXAMENES_SIGN
GET   /api/exams/orders?patientId=uuid
```

#### Response de orden
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "status": "LISTO",
  "notes": "string",
  "createdAt": "datetime",
  "items": [
    {
      "id": "uuid",
      "serviceId": "uuid",
      "status": "LISTO",
      "resultText": "Hemoglobina: 14 g/dL",
      "resultAt": "datetime",
      "resultBy": "uuid"
    }
  ]
}
```

---

## 11. Módulo Prescripciones

#### Crear receta
```
POST /api/prescriptions
Permiso: PRESCRIPCIONES_CREATE
Body:
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentId": "uuid",
  "diagnosisId": "uuid",
  "notes": "Tomar con alimentos",
  "items": [
    {
      "medicationId": "uuid",
      "dose": "500mg",
      "frequency": "cada 8 horas",
      "duration": "7 días",
      "route": "oral",
      "instructions": "Con abundante agua",
      "quantity": 21
    }
  ]
}
```

#### Estados de receta
```
ACTIVE → DISPENSED
       → CANCELLED
```

```
GET  /api/prescriptions?patientId=uuid
POST /api/prescriptions/{id}/dispense   Permiso: PRESCRIPCIONES_DISPENSE
GET  /api/patients/{patientId}/kardex   → historial completo de medicación
```

#### Kardex — campos que devuelve
```json
{
  "medicationName": "Amoxicilina",
  "commercialName": "Amoxil",
  "action": "PRESCRIBED",    // PRESCRIBED | DISPENSED | SUSPENDED | COMPLETED
  "quantity": 21,
  "notes": "string",
  "recordedAt": "datetime"
}
```

---

## 12. Módulo Inventario

### Stock
```
POST /api/inventory/movements
Permiso: INVENTARIO_WRITE
Body:
{
  "itemId": "uuid",
  "type": "IN",           // IN | OUT | ADJUSTMENT
  "quantity": 100,
  "reason": "Compra proveedor",
  "expiryDate": "2027-06-30"
}

GET /api/inventory/alerts?sedeId=uuid  → ítems bajo stock mínimo
```

### Lotes
```
GET  /api/inventory/batches?itemId=uuid
GET  /api/inventory/batches/expiring?daysAhead=30   → vencimientos próximos
POST /api/inventory/batches
Body: { "itemId": "uuid", "batchNumber": "LOT001", "quantity": 100, "expiryDate": "2027-06-30" }
```

### Proveedores
```
GET    /api/inventory/suppliers?active=true
GET    /api/inventory/suppliers/{id}
POST   /api/inventory/suppliers   Body: { "name": "string", "ruc": "string", "contact": "string", "phone": "string", "email": "string", "address": "string" }
PUT    /api/inventory/suppliers/{id}
PATCH  /api/inventory/suppliers/{id}/toggle
```

### Órdenes de Compra — flujo de estados
```
PENDING → APPROVED → RECEIVED
        → CANCELLED
```

```
GET   /api/inventory/purchase-orders?sedeId=uuid&status=PENDING
GET   /api/inventory/purchase-orders/{id}   → incluye array "items"
POST  /api/inventory/purchase-orders
Body:
{
  "supplierId": "uuid",
  "sedeId": "uuid",
  "notes": "string",
  "items": [
    { "medicationId": "uuid", "description": "Amoxicilina 500mg", "quantity": 100, "unitPrice": 0.50 }
  ]
}
PATCH /api/inventory/purchase-orders/{id}/approve
PATCH /api/inventory/purchase-orders/{id}/receive
PATCH /api/inventory/purchase-orders/{id}/cancel
```

---

## 13. Módulo RR.HH.

```
GET    /api/hrm/employees            → lista empleados
POST   /api/hrm/employees
Body:
{
  "userId": "uuid",
  "sedeId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "role": "ENFERMERO",
  "licenseNumber": "string",
  "hireDate": "2024-01-15"
}
DELETE /api/hrm/employees/{id}       → desactiva (no elimina físicamente)
```

---

## 14. Módulo Reportes

Todos los reportes POST reciben:
```json
{ "sedeId": "uuid", "dateFrom": "2026-03-01", "dateTo": "2026-03-31" }
```

```
POST /api/reports/operational   → tasa asistencia, no-shows, duración promedio
POST /api/reports/financial     → facturación, cobros, por método de pago
POST /api/reports/clinical      → top diagnósticos, servicios, medicamentos
GET  /api/reports/inventory?sedeId=uuid  → estado del stock (no necesita fechas)
```

#### Reporte operativo — campos clave para dashboard
```json
{
  "totalAppointments": 120,
  "attendedAppointments": 98,
  "cancelledAppointments": 10,
  "noShowAppointments": 12,
  "attendanceRate": 81.6,
  "noShowRate": 10.0,
  "avgConsultationMinutes": 28.5
}
```

#### Reporte financiero — campos clave
```json
{
  "totalBilled": 15000.00,
  "totalCollected": 12500.00,
  "totalPending": 2500.00,
  "cashAmount": 8000.00,
  "cardAmount": 3500.00,
  "transferAmount": 1000.00,
  "insuranceAmount": 0.00
}
```

#### Reporte clínico — campos clave
```json
{
  "topDiagnoses": [{ "code": "J06", "description": "IRA", "count": 45 }],
  "topServices":  [{ "serviceName": "Consulta General", "count": 80 }],
  "topMedications": [{ "medicationName": "Amoxicilina", "count": 32 }]
}
```

---

## 15. Módulo Atención al Cliente

```
POST /api/customer-service/complaints
Body:
{
  "patientId": "uuid",
  "sedeId": "uuid",
  "type": "WAITING_TIME",   // MEDICAL_CARE | ADMINISTRATIVE | INFRASTRUCTURE | BILLING | WAITING_TIME | OTHER
  "description": "string",
  "priority": "MEDIUM"      // LOW | MEDIUM | HIGH | CRITICAL
}

PATCH /api/customer-service/complaints/{id}/resolve
Body: { "resolution": "Se explicó el procedimiento al paciente" }

POST /api/customer-service/surveys
Body:
{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "sedeId": "uuid",
  "score": 5,       // 1 (muy malo) a 5 (excelente)
  "comment": "string"
}
```

**Regla UI:** Crear encuesta automáticamente cuando una cita pasa a estado `ATTENDED`.

---

## 16. Módulo Seguridad (Admin)

```
GET    /api/users
POST   /api/users    Body: { "email": "string", "password": "string", "fullName": "string", "roleId": "uuid" }
PUT    /api/users/{id}
DELETE /api/users/{id}

GET    /api/roles
POST   /api/roles    Body: { "code": "FARMACEUTICO", "name": "Farmacéutico" }

GET    /api/audit    → log de acciones del sistema
```

---

## 17. Pantallas sugeridas y qué endpoints usar

| Pantalla | Endpoints principales |
|---|---|
| **Dashboard** | `POST /api/reports/operational`, `GET /api/inventory/alerts` |
| **Agenda / Calendario** | `GET /api/appointments/patient/{id}`, `GET /api/appointments/availability` |
| **Nueva Cita** | `GET /api/catalog/doctors`, `GET /api/catalog/services`, `POST /api/appointments` |
| **Detalle de Cita** | `GET /api/appointments/patient/{id}`, `GET /api/triage/appointment/{id}` |
| **Triaje** | `POST /api/triage` |
| **Consulta Médica** | Historia clínica, receta, orden examen (módulos clinical, prescription, exam) |
| **Ficha Paciente** | `GET /api/patients/{id}`, `GET /api/patients/{id}/consents`, `GET /api/patients/{id}/kardex` |
| **Admisión / Recepción** | `GET /api/appointments`, citas del día por sede + check-in |
| **Caja** | `POST /api/invoices`, `POST /api/payments`, `GET /api/invoices/cash-register-summary` |
| **Farmacia** | `GET /api/prescriptions`, `POST /api/prescriptions/{id}/dispense`, alertas inventario |
| **Inventario** | Movimientos, lotes, alertas, órdenes de compra |
| **Reportes** | Los 4 endpoints de `/api/reports/` |
| **Configuración** | Catálogos, sedes, usuarios, roles |

---

## 18. Patrones de paginación

Los endpoints de lista que usan `Pageable`:
```
GET /api/appointments/patient/{id}?page=0&size=20&sort=startTime,desc
GET /api/patients?search=García&page=0&size=20
```

Response paginada:
```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 150,
    "totalPages": 8,
    "number": 0,
    "size": 20
  }
}
```

---

## 19. Fechas y formatos

| Tipo | Formato | Ejemplo |
|---|---|---|
| Fecha | `YYYY-MM-DD` | `2026-03-25` |
| Fecha-Hora | `YYYY-MM-DDTHH:mm:ss` | `2026-03-25T09:00:00` |
| Hora sola | `HH:mm` | `09:00` |
| UUID | String estándar | `550e8400-e29b-41d4-a716-446655440000` |
| Moneda | Número decimal | `150.00` |

---

## 20. Tips de integración

1. **Guardar el token** en `localStorage` o `sessionStorage`. Enviarlo en cada request como `Authorization: Bearer <token>`.
2. **Interceptar el 401** globalmente → redirigir al login y limpiar el token guardado.
3. **Interceptar el 403** → mostrar mensaje "No tienes permiso para esta acción".
4. **El `sedeId` del token** indica la sede activa — enviarlo en los filtros de listas para que el usuario solo vea datos de su sede.
5. **Para selects de catálogo** (médicos, servicios, medicamentos) → cargar con `GET /api/catalog/...` al montar el componente y cachear en el estado global.
6. **Las encuestas** se crean automáticamente en el frontend cuando detectas que una cita pasó a `ATTENDED`.
7. **Alertas de inventario** → mostrar badge en el menú de Farmacia si `GET /api/inventory/alerts` devuelve items.
8. **Los reportes** no tienen paginación — retornan el agregado completo del período.
