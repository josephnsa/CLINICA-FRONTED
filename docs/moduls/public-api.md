# Módulo: API Pública Externa

## Propósito
Expone un conjunto de endpoints sin autenticación para integraciones externas: sitio web corporativo, apps de pacientes de terceros, agendamiento online. Permite consultar médicos activos, especialidades y disponibilidad de horarios.

---

## Endpoints

Todos los endpoints bajo `/api/public/**` son permitidos sin JWT (`SecurityConfig`).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/doctors` | Lista médicos activos con especialidad y sede |
| GET | `/api/public/specialties` | Lista todas las especialidades médicas |
| GET | `/api/public/availability` | Slots de horario disponibles para un médico en una fecha |

---

## GET /api/public/doctors

### Query params (todos opcionales)
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `specialtyId` | UUID | Filtra por especialidad |
| `sedeId` | UUID | Filtra por sede |

### Respuesta
```json
[
  {
    "id": "uuid",
    "name": "Dra. María López",
    "specialty": "Medicina General",
    "sede": "Sede Central",
    "consultationFee": 80.00,
    "available": true
  }
]
```

Solo devuelve médicos con `available = true` y usuario activo (`is_active = true`).

---

## GET /api/public/specialties

### Respuesta
```json
[
  {
    "id": "uuid",
    "name": "Cardiología",
    "description": "Especialidad del corazón y sistema cardiovascular"
  }
]
```

---

## GET /api/public/availability

### Query params (requeridos)
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `doctorId` | UUID | UUID del médico |
| `date` | `yyyy-MM-dd` | Fecha para consultar disponibilidad |

### Lógica
1. Consulta los horarios del médico (`schedules`) para el día de la semana de `date`
2. Excluye los tramos que ya tienen cita en estado `PENDING` o `CONFIRMED`
3. Devuelve los tramos libres ordenados por `start_time`

### Respuesta
```json
[
  {
    "scheduleId": "uuid",
    "startTime": "09:00:00",
    "endTime": "09:30:00",
    "sede": "Sede Central"
  }
]
```

---

## Seguridad
- No requiere token JWT
- Registrado en `SecurityConfig` como: `.requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()`
- No expone datos sensibles: sin emails, sin documentos de identidad, sin historias clínicas

---

## Dependencias con otros módulos
- **Catalog**: tablas `doctors`, `specialties`, `users`, `sedes`
- **Agenda**: tabla `appointments` para calcular disponibilidad real
- **HRM**: tabla `schedules` para los horarios del médico
