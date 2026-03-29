# Módulo: Prescripción y Medicación

## Propósito
Gestiona las recetas médicas emitidas en consulta, el control de dispensación en farmacia y el historial de medicación del paciente (kardex).

---

## Submodelos de Dominio

### Prescription (Receta)
**Tabla:** `prescriptions`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente |
| doctorId | UUID | Médico emisor |
| appointmentId | UUID | Cita de origen |
| diagnosisId | UUID | Código CIE-10 del diagnóstico |
| notes | String | Indicaciones generales |
| status | Enum | ACTIVE / DISPENSED / CANCELLED |
| createdAt | LocalDateTime | Fecha de emisión |
| createdBy | UUID | Usuario que creó |

**Métodos de dominio:**
- `dispense()` — ACTIVE → DISPENSED
- `cancel()` — ACTIVE → CANCELLED
- `isDispensable()` — true si está ACTIVE y tiene ítems válidos
- `validate()` — requiere patientId, doctorId y al menos un ítem
- `getTotalItems()` — cuenta ítems en la receta

---

### PrescriptionItem (Ítem de Receta)
**Tabla:** `prescription_items`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| prescriptionId | UUID | FK a prescriptions |
| medicationId | UUID | Medicamento del catálogo |
| dose | String | Dosis (ej. "500mg") |
| frequency | String | Frecuencia (ej. "cada 8 horas") |
| duration | String | Duración (ej. "7 días") |
| route | String | Vía de administración (oral, IV, etc.) |
| instructions | String | Instrucciones adicionales |
| quantity | int | Cantidad total a dispensar |
| isDispensed | boolean | Si ya fue entregado |
| dispensedAt | LocalDateTime | Cuándo fue dispensado |
| dispensedBy | UUID | Farmacéutico |

**Métodos de dominio:**
- `validate()` — requiere medicationId, dose y quantity > 0

---

### Medication Kardex
**Tabla:** `medication_kardex`

Historial cronológico de medicación de un paciente. Se registra automáticamente al prescribir y dispensar.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente |
| prescriptionId | UUID | Receta origen |
| medicationId | UUID | Medicamento |
| action | Enum | PRESCRIBED / DISPENSED / SUSPENDED / COMPLETED |
| quantity | int | Cantidad involucrada |
| notes | String | Observaciones |
| recordedBy | UUID | Usuario |
| recordedAt | LocalDateTime | Timestamp |

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreatePrescriptionUseCase` | Crea receta con sus ítems desde una cita |
| `DispensePrescriptionUseCase` | Marca la receta como dispensada en farmacia |
| `GetPrescriptionsByPatientUseCase` | Lista todas las recetas de un paciente |

---

## Endpoints REST

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/prescriptions` | `PRESCRIPCIONES_CREATE` | Crear receta |
| GET | `/api/prescriptions?patientId=` | `PRESCRIPCIONES_READ` | Recetas del paciente |
| POST | `/api/prescriptions/{id}/dispense` | `PRESCRIPCIONES_DISPENSE` | Dispensar en farmacia |
| GET | `/api/patients/{patientId}/kardex` | `PRESCRIPCIONES_READ` | Kardex de medicación |

---

## Reglas de Negocio Clave
1. Solo se puede dispensar una receta en estado ACTIVE.
2. La receta se emite desde una cita médica — requiere `appointmentId`.
3. El kardex es de solo lectura para el frontend — refleja el historial completo de medicación.
4. Una receta DISPENSED no puede cancelarse — debe emitirse una nueva.
5. Los ítems de la receta se imprimen o exportan como documento formal al paciente.
