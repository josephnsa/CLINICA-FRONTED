# Módulo: Atención al Cliente

## Propósito
Gestiona el seguimiento post-atención: registro de quejas/reclamos, escalamiento por prioridad y encuestas de satisfacción del paciente.

---

## Submodelos de Dominio

### Complaint (Queja/Reclamo)
**Tabla:** `complaints`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente que reclama |
| sedeId | UUID | Sede donde ocurrió |
| type | Enum | Tipo de queja |
| description | String | Descripción detallada |
| status | Enum | Estado de gestión |
| priority | Enum | Urgencia del reclamo |
| assignedTo | UUID | Usuario responsable de resolver |
| resolution | String | Descripción de la solución |
| createdAt | LocalDateTime | Fecha de ingreso |
| resolvedAt | LocalDateTime | Fecha de cierre |

**Tipos de queja (`ComplaintType`):**
- `MEDICAL_CARE` — Atención médica
- `ADMINISTRATIVE` — Procesos administrativos
- `INFRASTRUCTURE` — Infraestructura/instalaciones
- `BILLING` — Facturación
- `WAITING_TIME` — Tiempos de espera
- `OTHER` — Otros

**Estados (`ComplaintStatus`):**
```
PENDING → IN_PROGRESS → RESOLVED → CLOSED
```

**Prioridades (`ComplaintPriority`):**
- `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Métodos de dominio:**
- `assignTo(userId)` — asigna responsable y pasa a IN_PROGRESS
- `resolve(resolution)` — registra solución, pasa a RESOLVED
- `close()` — cierra el reclamo
- `escalatePriority()` — sube el nivel de prioridad
- `isPending()` — true si está en PENDING
- `isUrgent()` — true si es HIGH o CRITICAL

---

### SatisfactionSurvey (Encuesta de Satisfacción)
**Tabla:** `satisfaction_surveys`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | Paciente encuestado |
| appointmentId | UUID | Cita evaluada |
| sedeId | UUID | Sede |
| score | int | Puntaje 1–5 (1=muy malo, 5=excelente) |
| comment | String | Comentario libre |
| createdAt | LocalDateTime | Fecha de respuesta |

**Métodos de dominio:**
- `rate(score)` — asigna puntaje validando rango 1-5
- `isPositive()` — true si score ≥ 4
- `isNegative()` — true si score ≤ 2
- `getScoreLabel()` — retorna "Excelente", "Bueno", "Regular", "Malo", "Muy malo"

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateComplaintUseCase` | Registra un nuevo reclamo |
| `ResolveComplaintUseCase` | Resuelve un reclamo con descripción de solución |
| `CreateSurveyUseCase` | Registra encuesta de satisfacción post-atención |

---

## Endpoints REST

### Quejas — `/api/customer-service/complaints`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/customer-service/complaints` | `cs:write` | Crear reclamo |
| PATCH | `/api/customer-service/complaints/{id}/resolve` | `cs:write` | Resolver reclamo |

### Encuestas — `/api/customer-service/surveys`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/customer-service/surveys` | `cs:write` | Registrar encuesta |

---

## Reglas de Negocio Clave
1. Un reclamo debe asignarse antes de resolverse (`assignTo` antes de `resolve`).
2. Solo se puede escalar la prioridad hacia arriba — no se puede bajar.
3. Las encuestas se crean automáticamente o invitan al paciente tras la consulta (ATTENDED).
4. El puntaje NPS (Net Promoter Score) se deriva del promedio de scores: promotores (≥4), neutros (3), detractores (≤2).
5. Un reclamo CLOSED no puede reabrirse — debe crearse uno nuevo si es un caso nuevo.

---

## Métricas clave para el Dashboard
- Promedio de satisfacción por sede/período
- % reclamos resueltos vs pendientes
- Tiempo promedio de resolución
- Distribución de tipos de queja
