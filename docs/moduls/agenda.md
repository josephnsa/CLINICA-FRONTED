# Módulo: Agenda, Disponibilidad y Atención

## Propósito
Gestiona el ciclo completo de una cita médica: desde la disponibilidad del médico, la reserva, hasta el cierre de la consulta (check-in, triaje, consulta, completado).

---

## Submodelos de Dominio

### Appointment (Cita)
**Tabla:** `appointments`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente |
| doctorId | UUID | Médico |
| serviceId | UUID | Servicio/procedimiento |
| sedeId | UUID | Sede |
| startTime | LocalDateTime | Inicio de la cita |
| endTime | LocalDateTime | Fin de la cita |
| status | Enum | Estado actual |
| notes | String | Notas |
| cancellationReason | String | Razón de cancelación |
| createdBy | UUID | Usuario que creó |

**Estados posibles (`AppointmentStatus`):**
```
PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → ATTENDED
                                               → CANCELLED
                                               → NO_SHOW
```

**Transiciones de estado (métodos de dominio):**
- `confirm()` — PENDING → CONFIRMED
- `checkIn()` — CONFIRMED → CHECKED_IN
- `startConsultation()` — CHECKED_IN → IN_PROGRESS
- `complete()` — IN_PROGRESS → ATTENDED
- `cancel(reason)` — cualquier estado → CANCELLED
- `markNoShow()` — CONFIRMED/CHECKED_IN → NO_SHOW
- `reschedule(newStart, newEnd, reason)` — solo si no está ATTENDED/CANCELLED/NO_SHOW

---

### DoctorAvailabilityRule (Regla semanal)
**Tabla:** `doctor_availability`

Define los horarios habituales del médico por día de semana.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| doctorId | UUID | Médico |
| sedeId | UUID | Sede |
| dayOfWeek | int | 1=Lunes … 7=Domingo |
| startTime | LocalTime | Hora inicio |
| endTime | LocalTime | Hora fin |
| isActive | boolean | Si la regla está vigente |

**Métodos de dominio:**
- `coversTime(LocalTime)` — true si la hora cae dentro del turno
- `validate()` — valida rangos de día y hora

---

### AvailabilityBlock (Bloqueo)
**Tabla:** `availability_blocks`

Bloquea períodos completos: vacaciones, feriados, licencias.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| doctorId | UUID | Médico |
| sedeId | UUID | Sede |
| startDt | LocalDateTime | Inicio del bloqueo |
| endDt | LocalDateTime | Fin del bloqueo |
| reason | String | Motivo (vacaciones, feriado, etc.) |

**Métodos de dominio:**
- `overlaps(start, end)` — true si el bloqueo se superpone con el rango dado
- `validate()` — asegura que endDt > startDt

---

### Triage (Triaje)
**Tabla:** `triage`

Registra signos vitales antes de la consulta. Un triaje por cita.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| appointmentId | UUID | Cita asociada |
| patientId | UUID | Paciente |
| recordedBy | UUID | Enfermero/técnico que registró |
| bloodPressure | String | Ej. "120/80" |
| heartRate | Integer | lpm |
| respiratoryRate | Integer | rpm |
| temperature | BigDecimal | °C |
| oxygenSaturation | Integer | % |
| weight | BigDecimal | kg |
| height | BigDecimal | cm |
| triageLevel | Enum | EMERGENCY / URGENT / NORMAL / LOW |
| notes | String | Observaciones |
| recordedAt | LocalDateTime | Momento del registro |

**Niveles de triaje:**
- `EMERGENCY` — Atención inmediata
- `URGENT` — Atención prioritaria (< 30 min)
- `NORMAL` — Atención en orden de llegada
- `LOW` — Puede esperar

**Métodos de dominio:**
- `isCritical()` — true si es EMERGENCY o URGENT
- `getBmi()` — calcula IMC (peso / altura²)
- `hasLowOxygen()` — true si saturación < 95%
- `hasFever()` — true si temperatura ≥ 38°C

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateAppointmentUseCase` | Crea una cita validando conflictos de horario |
| `CancelAppointmentUseCase` | Cancela una cita con razón opcional |
| `RescheduleAppointmentUseCase` | Reprograma validando que no haya conflicto |
| `CheckInUseCase` | Registra llegada del paciente |
| `StartConsultationUseCase` | Inicia la consulta médica |
| `CompleteAppointmentUseCase` | Marca la consulta como completada |
| `MarkNoShowUseCase` | Registra inasistencia del paciente |
| `GetAvailabilityUseCase` | Retorna slots libres para un médico/fecha/sede |
| `SetDoctorAvailabilityUseCase` | Crea/desactiva reglas de horario semanal |
| `AddAvailabilityBlockUseCase` | Agrega/elimina bloqueos de disponibilidad |
| `RegisterTriageUseCase` | Registra signos vitales pre-consulta |

---

## Endpoints REST

### Citas — `/api/appointments`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/appointments` | `agenda:create` | Nueva cita |
| DELETE | `/api/appointments/{id}` | `agenda:cancel` | Cancelar |
| GET | `/api/appointments/availability` | `agenda:availability` | Slots disponibles |
| GET | `/api/appointments/patient/{patientId}` | `agenda:read` | Citas por paciente |
| PATCH | `/api/appointments/{id}/reschedule` | `agenda:reschedule` | Reprogramar |
| PATCH | `/api/appointments/{id}/checkin` | `agenda:checkin` | Check-in |
| PATCH | `/api/appointments/{id}/start-consultation` | `agenda:start` | Iniciar consulta |
| PATCH | `/api/appointments/{id}/complete` | `agenda:complete` | Completar |
| PATCH | `/api/appointments/{id}/no-show` | `agenda:noshow` | No se presentó |

### Disponibilidad — `/api/availability`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/availability/rules` | `agenda:availability` | Crear regla semanal |
| GET | `/api/availability/rules?doctorId=` | `agenda:availability` | Reglas del médico |
| DELETE | `/api/availability/rules/{ruleId}` | `agenda:availability` | Desactivar regla |
| POST | `/api/availability/blocks` | `agenda:availability` | Crear bloqueo |
| GET | `/api/availability/blocks?doctorId=` | `agenda:availability` | Bloqueos del médico |
| DELETE | `/api/availability/blocks/{blockId}` | `agenda:availability` | Eliminar bloqueo |

### Triaje — `/api/triage`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/triage` | `agenda:triage` | Registrar triaje |
| GET | `/api/triage/appointment/{id}` | `agenda:read` | Triaje de una cita |
| GET | `/api/triage/patient/{id}` | `agenda:read` | Historial de triajes del paciente |

---

## Reglas de Negocio Clave
1. No se puede crear una cita si el médico tiene otra cita solapada en ese horario.
2. No se puede crear una cita en un bloqueo de disponibilidad (vacaciones/feriado).
3. La transición de estados es unidireccional — no se puede revertir un ATTENDED.
4. Solo se puede triajear una cita que exista; un triaje por cita.
5. Los niveles EMERGENCY y URGENT deben alertar al frontend con prioridad visual.
