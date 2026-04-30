# Módulo: Recursos Humanos (HRM)

## Propósito
Gestiona la ficha del personal de la clínica (médicos, enfermeros, administrativos), sus horarios semanales de trabajo y la información laboral necesaria para la operación.

---

## Submodelos de Dominio

### Employee (Empleado)
**Tabla:** `employees`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK a users (cuenta de sistema) |
| sedeId | UUID | Sede principal |
| firstName | String | Nombres |
| lastName | String | Apellidos |
| role | String | Cargo (MÉDICO, ENFERMERO, TÉCNICO, ADMINISTRATIVO, etc.) |
| licenseNumber | String | Colegiatura / habilitación profesional (opcional) |
| hireDate | LocalDate | Fecha de contratación |
| isActive | boolean | Activo/inactivo |

**Métodos de dominio:**
- `getFullName()` — concatena firstName + lastName
- `getSeniority()` — años desde hireDate hasta hoy
- `isLicensed()` — true si tiene licenseNumber no vacío
- `deactivate()` / `reactivate()` — gestión de estado
- `validate()` — requiere nombre, apellido, rol y sede

---

### EmployeeSchedule (Horario de Trabajo)
**Tabla:** `employee_schedules`

Define los turnos semanales habituales del empleado.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| employeeId | UUID | FK a employees |
| dayOfWeek | int | 1=Lunes … 7=Domingo |
| startTime | LocalTime | Hora de entrada |
| endTime | LocalTime | Hora de salida |

**Métodos de dominio:**
- `getDayName()` — retorna el nombre del día (Lunes, Martes, etc.)
- `getDurationMinutes()` — duración del turno en minutos
- `covers(LocalTime)` — true si la hora está dentro del turno
- `validate()` — valida día (1-7) y que endTime > startTime

---

### AttendanceRecord (Registro de Asistencia)
**Tabla:** `employee_attendance`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| employeeId | UUID | FK → employees.id |
| sedeId | UUID | Sede donde se registró |
| date | DATE | Fecha del registro (único por empleado/día) |
| checkIn | TIMESTAMP | Hora de entrada |
| checkOut | TIMESTAMP | Hora de salida |
| minutesWorked | INTEGER | Minutos trabajados (calculado automáticamente) |
| status | Enum | Estado de asistencia |
| notes | VARCHAR(500) | Observaciones |

**Estados (`AttendanceStatus`):** `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

**Métodos de dominio:**
- `registerCheckOut(LocalDateTime)` — registra salida y calcula `minutesWorked`
- `evaluateLate(LocalTime expectedStart)` — marca como LATE si llegó >10 min tarde
- `completedMinimumShift()` — true si trabajó ≥ 4 horas (240 min)
- `validate()` — requiere employeeId y date

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateEmployeeUseCase` | Registra un nuevo empleado |
| `ListEmployeesUseCase` | Lista empleados con filtros opcionales por sede |
| `DeactivateEmployeeUseCase` | Desactiva un empleado |
| `CreateScheduleUseCase` | Asigna turno semanal a un empleado |
| `ListSchedulesUseCase` | Lista horarios de un empleado |
| `DeleteScheduleUseCase` | Elimina un horario |
| `RegisterCheckInUseCase` | Registra entrada, evalúa tardanza vs. horario programado |
| `RegisterCheckOutUseCase` | Registra salida y calcula minutos trabajados |
| `ListAttendanceUseCase` | Lista asistencia de un empleado con filtro de fechas |
| `GetProductivityReportUseCase` | Reporte de asistencia + citas atendidas (para médicos) |

---

## Endpoints REST

### Empleados — `/api/hrm/employees`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/hrm/employees` | `RR_HH_WRITE` | Crear empleado |
| GET | `/api/hrm/employees` | `RR_HH_READ` | Listar empleados (filtros: `sedeId`, `activeOnly`) |
| DELETE | `/api/hrm/employees/{id}` | `RR_HH_WRITE` | Desactivar empleado |
| POST | `/api/hrm/employees/schedules` | `RR_HH_WRITE` | Crear horario semanal |
| GET | `/api/hrm/employees/{id}/schedules` | `RR_HH_READ` | Ver horarios de empleado |
| DELETE | `/api/hrm/employees/schedules/{id}` | `RR_HH_WRITE` | Eliminar horario |

### Asistencia — `/api/hrm/attendance`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/hrm/attendance/checkin` | `RR_HH_WRITE` | Registrar entrada |
| POST | `/api/hrm/attendance/checkout` | `RR_HH_WRITE` | Registrar salida |
| GET | `/api/hrm/attendance` | `RR_HH_READ` | Ver asistencia (params: `employeeId`, `from`, `to`) |
| GET | `/api/hrm/attendance/productivity/{employeeId}` | `RR_HH_READ` | Reporte de productividad (params: `from`, `to`) |

**Ejemplo productividad:**
```
GET /api/hrm/attendance/productivity/{employeeId}?from=2026-04-01&to=2026-04-30
```

---

## Reglas de Negocio Clave
1. Un empleado puede tener múltiples horarios (uno por día de la semana).
2. Un empleado desactivado no puede acceder al sistema — su cuenta de usuario también debe desactivarse.
3. El `licenseNumber` aplica solo a personal de salud (médicos, enfermeros) — es opcional para administrativos.
4. La antigüedad (`getSeniority()`) se calcula en tiempo real desde `hireDate`.
5. Antes de crear un médico en el módulo `catalog`, debe existir el empleado y su usuario asociado.
