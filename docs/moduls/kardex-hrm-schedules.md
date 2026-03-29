# Módulos Completados: Kardex de Medicación + Horarios de Empleados

> Conexiones con otros módulos y guía completa para el frontend.

---

## 1. Kardex de Medicación

### Propósito
Historial cronológico **de solo lectura** de toda la medicación que un paciente ha recibido. Consolida recetas emitidas y dispensaciones realizadas en un único timeline ordenado.

### Dónde vive
- **Módulo:** `prescription`
- **Tabla:** `medication_kardex`
- **Endpoint:** `GET /api/patients/{patientId}/kardex`
- **Permiso:** `PRESCRIPCIONES_READ`

---

### Conexiones con otros módulos

```
patients ──────────────┐
                       ├──► medication_kardex ◄── prescription
catalog/medications ───┘
```

| Campo del kardex | Viene de |
|---|---|
| `patientId` | módulo `patients` → tabla `patients` |
| `prescriptionId` | módulo `prescription` → tabla `prescriptions` |
| `medicationId` | módulo `catalog` → tabla `medications` |
| `medicationName` | JOIN a `medications.generic_name` |
| `commercialName` | JOIN a `medications.commercial_name` |

> El kardex se **alimenta automáticamente** cuando se crea una receta (`PRESCRIBED`) y cuando se dispensa (`DISPENSED`). El frontend **nunca escribe** en el kardex — es solo lectura.

---

### Response del endpoint
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "prescriptionId": "uuid",
    "medicationId": "uuid",
    "medicationName": "Amoxicilina",
    "commercialName": "Amoxil",
    "action": "PRESCRIBED",
    "quantity": 21,
    "notes": "Tomar con alimentos",
    "recordedBy": "uuid",
    "recordedAt": "2026-03-25T10:00:00"
  }
]
```

### Valores del campo `action`
| Valor | Significado | Color sugerido UI |
|---|---|---|
| `PRESCRIBED` | Médico emitió la receta | Azul |
| `DISPENSED` | Farmacia entregó el medicamento | Verde |
| `SUSPENDED` | Medicamento suspendido por el médico | Naranja |
| `COMPLETED` | Tratamiento completado | Gris |

---

### Reglas de negocio
1. Es de **solo lectura** — el frontend nunca hace POST/PUT al kardex.
2. Los registros se crean automáticamente desde `CreatePrescriptionUseCase` y `DispensePrescriptionUseCase`.
3. El resultado viene **ordenado por `recordedAt DESC`** — el más reciente aparece primero.
4. Un paciente puede tener múltiples registros del mismo medicamento en diferentes momentos.

---

### Pantalla sugerida: "Historial de Medicación"
**Dónde mostrarla:** dentro de la ficha del paciente, pestaña "Medicación".

**Qué mostrar:**
- Timeline vertical con cada entrada del kardex
- Icono/color por tipo de `action`
- Nombre genérico + comercial del medicamento
- Cantidad y fecha
- Botón de filtro por medicamento o rango de fechas (filtrar en el cliente, ya que el endpoint devuelve todo)

**Endpoints que necesita esta pantalla:**
```
GET /api/patients/{id}/kardex          → historial completo
GET /api/prescriptions?patientId={id}  → recetas asociadas (opcional, para detalle)
```

---

---

## 2. Horarios de Empleados (HRM Schedules)

### Propósito
Define los turnos semanales habituales de cada empleado (qué días trabaja y en qué horario). Permite al sistema y al personal de RR.HH. conocer la disponibilidad laboral del equipo.

### Dónde vive
- **Módulo:** `hrm`
- **Tabla:** `employee_schedules`
- **Endpoints base:** `/api/hrm/employees`

---

### Conexiones con otros módulos

```
hrm/employees ──────────► employee_schedules
      │
      └──► catalog/doctors (un médico es primero un empleado)
                │
                └──► agenda/DoctorAvailabilityRule (horario de consultas)
```

**Relación importante con `agenda`:**

| Concepto | Módulo | Propósito |
|---|---|---|
| `EmployeeSchedule` | `hrm` | Horario **laboral** del empleado (entrada/salida) |
| `DoctorAvailabilityRule` | `agenda` | Horario de **consultas médicas** del doctor |

Son complementarios: un médico puede trabajar de 8:00 a 17:00 (HRM) y tener consultas de 9:00 a 13:00 (Agenda). **Son tablas distintas con propósitos distintos.**

---

### Endpoints

#### Crear horario
```
POST /api/hrm/employees/schedules
Permiso: RR_HH_WRITE
Body:
{
  "employeeId": "uuid",
  "sedeId": "uuid",
  "dayOfWeek": 0,          // 0=Lunes, 1=Martes, ..., 6=Domingo
  "startTime": "08:00:00",
  "endTime": "17:00:00"
}
```

#### Listar horarios de un empleado
```
GET /api/hrm/employees/{employeeId}/schedules?activeOnly=true
Permiso: RR_HH_READ
```

#### Eliminar horario (desactiva, no borra físicamente)
```
DELETE /api/hrm/employees/schedules/{scheduleId}
Permiso: RR_HH_WRITE
```

---

### Response de horario
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "sedeId": "uuid",
  "dayOfWeek": 0,
  "dayName": "Lunes",
  "startTime": "08:00:00",
  "endTime": "17:00:00",
  "durationMinutes": 540,
  "active": true
}
```

---

### Mapa de `dayOfWeek`
| Valor | Día |
|---|---|
| 0 | Lunes |
| 1 | Martes |
| 2 | Miércoles |
| 3 | Jueves |
| 4 | Viernes |
| 5 | Sábado |
| 6 | Domingo |

---

### Reglas de negocio
1. Un empleado **no puede tener dos horarios activos para el mismo día** — el sistema lanza error 422.
2. No se puede asignar horario a un empleado **inactivo**.
3. El turno debe tener **mínimo 30 minutos** de duración.
4. La eliminación es **lógica** (marca `isActive = false`), no física — se conserva el historial.
5. `durationMinutes` se calcula automáticamente en el backend al construir la respuesta.

---

### Pantalla sugerida: "Horario Semanal del Empleado"
**Dónde mostrarla:** dentro del detalle del empleado en RR.HH.

**Diseño recomendado:** grilla semanal de Lunes a Domingo.

```
Lunes    [08:00 - 17:00]  9h  [🗑]
Martes   [08:00 - 17:00]  9h  [🗑]
Miércoles [08:00 - 13:00] 5h  [🗑]
Jueves   [ + Agregar turno ]
Viernes  [08:00 - 17:00]  9h  [🗑]
Sábado   [ + Agregar turno ]
Domingo  [ — ]
```

**Flujo de creación:**
1. El usuario hace clic en "+ Agregar turno" para un día libre.
2. Se muestra un modal/formulario con `startTime` y `endTime`.
3. `POST /api/hrm/employees/schedules` con `dayOfWeek` y `employeeId` prelleno.
4. Al recibir respuesta 200, actualizar el día en la grilla.

**Endpoints que necesita esta pantalla:**
```
GET  /api/hrm/employees/{id}/schedules    → cargar horario al abrir el detalle
POST /api/hrm/employees/schedules         → agregar turno
DELETE /api/hrm/employees/schedules/{id}  → eliminar turno
```

---

## 3. Conexión completa: Ficha de Paciente con Kardex

Al construir la pantalla de ficha del paciente, los datos vienen de **4 módulos distintos**:

```
GET /api/patients/{id}                  → datos personales, contacto emergencia
GET /api/patients/{id}/consents         → consentimientos firmados
GET /api/clinical-notes?patientId={id}  → notas clínicas (evoluciones)
GET /api/patients/{id}/kardex           → historial de medicación ← NUEVO
GET /api/prescriptions?patientId={id}   → recetas activas/pasadas
GET /api/exams/orders?patientId={id}    → órdenes de examen
```

**Flujo recomendado de carga:**
1. Llamar a `GET /api/patients/{id}` primero (datos base).
2. Las demás llamadas hacerlas en paralelo (`Promise.all` en React/Angular).
3. Cada sección de la ficha se carga independientemente para no bloquear la UI.

---

## 4. Conexión completa: Detalle de Empleado en RR.HH.

Al construir la pantalla del detalle del empleado, los datos vienen de:

```
GET /api/hrm/employees?sedeId={id}           → lista de empleados
GET /api/hrm/employees/{id}/schedules        → horario semanal ← NUEVO
GET /api/catalog/doctors?active=true         → si es médico, ver sus datos clínicos
GET /api/availability/rules?doctorId={id}    → si es médico, ver horario de consultas
```

**Nota clave para el frontend:**
- `hrm/employees` tiene el perfil **laboral** (cargo, colegiatura, fecha contratación, horario laboral).
- `catalog/doctors` tiene el perfil **clínico** (especialidad, número de colegiatura para consultas).
- Son el mismo **humano** pero visto desde dos ángulos distintos del sistema.
