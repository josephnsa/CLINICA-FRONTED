# Módulo: Exámenes y Resultados

## Propósito
Gestiona las órdenes de examen emitidas por médicos, el seguimiento de su estado (pendiente → en proceso → listo → entregado), el registro de resultados y la firma profesional de validación.

---

## Submodelos de Dominio

### ExamOrder (Orden de Examen)
**Tabla:** `exam_orders`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente |
| doctorId | UUID | Médico emisor |
| appointmentId | UUID | Cita de origen |
| status | Enum | Estado del proceso |
| notes | String | Indicaciones clínicas |
| signedBy | UUID | Profesional que firmó/validó |
| signedAt | OffsetDateTime | Fecha de firma |
| createdAt | OffsetDateTime | Fecha de emisión |
| createdBy | UUID | Usuario |

**Estados posibles (`ExamOrderStatus`):**
```
PENDIENTE → EN_PROCESO → LISTO → ENTREGADO
```

**Métodos de dominio:**
- `startProcessing()` — PENDIENTE → EN_PROCESO
- `markReady()` — EN_PROCESO → LISTO (solo si todos los ítems tienen resultados)
- `deliver()` — LISTO → ENTREGADO
- `sign(professionalId)` — registra firma profesional (desde EN_PROCESO en adelante)
- `isSigned()` — true si tiene signedBy y signedAt
- `validate()` — requiere patientId, doctorId y al menos un ítem

---

### ExamOrderItem (Ítem de Examen)
**Tabla:** `exam_order_items`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| examOrderId | UUID | FK a exam_orders |
| serviceId | UUID | Servicio/tipo de examen del catálogo |
| status | Enum | Estado individual del examen |
| resultText | String | Resultado textual |
| resultAt | OffsetDateTime | Fecha del resultado |
| resultBy | UUID | Técnico/especialista que cargó el resultado |

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateExamOrderUseCase` | Crea la orden con sus ítems desde una cita |
| `RegisterExamResultUseCase` | Carga resultados y marca los ítems como LISTO |
| `SignExamOrderUseCase` | Firma profesional de validación de resultados |
| `GetExamOrdersByPatientUseCase` | Lista todas las órdenes de un paciente |

---

## Endpoints REST

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/exams/orders` | `EXAMENES_CREATE` | Crear orden |
| GET | `/api/exams/orders?patientId=` | `EXAMENES_READ` | Órdenes del paciente |
| POST | `/api/exams/orders/{id}/result` | `EXAMENES_RESULT` | Registrar resultado |
| PATCH | `/api/exams/orders/{id}/sign` | `EXAMENES_SIGN` | Firma profesional |

---

## Reglas de Negocio Clave
1. Solo se puede firmar una orden que tenga al menos estado EN_PROCESO — no se firma una orden sin procesar.
2. La orden solo pasa a LISTO cuando **todos** los ítems tienen `resultText` no vacío.
3. La firma es independiente del estado: un médico puede firmar una orden EN_PROCESO o LISTO.
4. El resultado es texto libre — en el futuro puede extenderse para adjuntar archivos (URL de imágenes DICOM, PDFs).
5. Una orden ENTREGADO es el estado final — no se puede revertir.
