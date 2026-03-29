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

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreateEmployeeUseCase` | Registra un nuevo empleado |
| `ListEmployeesUseCase` | Lista empleados con filtros opcionales por sede/rol |
| `DeactivateEmployeeUseCase` | Desactiva un empleado |

---

## Endpoints REST

### Empleados — `/api/hrm/employees`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/hrm/employees` | `hrm:write` | Crear empleado |
| GET | `/api/hrm/employees` | `hrm:read` | Listar empleados |
| DELETE | `/api/hrm/employees/{id}` | `hrm:write` | Desactivar empleado |

---

## Pendiente para análisis
- **Control de asistencia:** Registro de entrada/salida diaria. Requiere nueva tabla `attendance_records` y lógica para calcular horas trabajadas, tardanzas y ausencias.

---

## Reglas de Negocio Clave
1. Un empleado puede tener múltiples horarios (uno por día de la semana).
2. Un empleado desactivado no puede acceder al sistema — su cuenta de usuario también debe desactivarse.
3. El `licenseNumber` aplica solo a personal de salud (médicos, enfermeros) — es opcional para administrativos.
4. La antigüedad (`getSeniority()`) se calcula en tiempo real desde `hireDate`.
5. Antes de crear un médico en el módulo `catalog`, debe existir el empleado y su usuario asociado.
