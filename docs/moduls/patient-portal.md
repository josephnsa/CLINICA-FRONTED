# Módulo: Portal del Paciente

## Propósito
Permite a los pacientes acceder de forma autónoma al sistema mediante su propio login. Pueden consultar sus citas, resultados de exámenes y prescripciones sin necesidad de contactar recepción.

---

## Prerrequisito
El paciente debe existir previamente en la tabla `patients` (creado por recepción) con un `email` registrado. El portal enlaza la cuenta de acceso con ese registro existente.

---

## Submodelos de Dominio

### PatientAccount (Cuenta de acceso)
**Tabla:** `patient_accounts`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | FK → patients.id |
| email | VARCHAR(255) | Email único de acceso |
| password | VARCHAR(255) | Contraseña hasheada con BCrypt |
| isActive | BOOLEAN | Estado de la cuenta |
| lastLogin | TIMESTAMP | Última sesión |
| createdAt | TIMESTAMP | Fecha de creación |

**Métodos de dominio:**
- `recordLogin()` — actualiza `lastLogin` al momento del acceso
- `deactivate()` — desactiva la cuenta (no reversible por el paciente)
- `validate()` — valida que email, password y patientId no sean nulos

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `PatientRegisterUseCase` | Crea cuenta vinculando email con registro de `patients`. Emite JWT inmediatamente. |
| `PatientLoginUseCase` | Valida credenciales y emite JWT con `role=PACIENTE_PORTAL` |
| `GetMyAppointmentsUseCase` | Lista las citas del paciente autenticado (JOIN con doctors, services, sedes) |
| `GetMyExamResultsUseCase` | Lista órdenes de examen y sus resultados |
| `GetMyPrescriptionsUseCase` | Lista prescripciones con detalle de medicamentos |

---

## Endpoints REST

### Autenticación — `/api/portal/auth` (público, sin token)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/portal/auth/register` | Crear cuenta de paciente |
| POST | `/api/portal/auth/login` | Iniciar sesión |

**Body registro/login:**
```json
{ "email": "paciente@gmail.com", "password": "Clave1234" }
```

**Respuesta:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "patientId": "uuid",
  "fullName": "Juan Pérez",
  "email": "paciente@gmail.com",
  "permissions": ["patients:read", "agenda:read", "agenda:create", "agenda:cancel", "EXAMENES_READ", "PRESCRIPCIONES_READ"]
}
```

### Portal autenticado — `/api/portal` (requiere Bearer token de paciente)

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/portal/appointments` | `ROLE_PACIENTE_PORTAL` | Mis citas (con médico, servicio, sede, estado) |
| GET | `/api/portal/exams` | `ROLE_PACIENTE_PORTAL` | Mis resultados de exámenes |
| GET | `/api/portal/prescriptions` | `ROLE_PACIENTE_PORTAL` | Mis prescripciones con medicamentos |

---

## JWT del Paciente

El token del paciente tiene el `patientId` como `subject` (no el `userId` de staff).

| Claim | Valor |
|---|---|
| `sub` | `patientId` (UUID del registro en `patients`) |
| `role` | `PACIENTE_PORTAL` |
| `permissions` | `["patients:read", "agenda:read", "agenda:create", "agenda:cancel", "EXAMENES_READ", "PRESCRIPCIONES_READ"]` |
| `sedeId` | `""` (pacientes no están vinculados a una sede fija) |

---

## Puertos Cross-Módulo

El módulo define puertos para leer datos de otros módulos sin depender de su infraestructura:

| Puerto | Implementación | Descripción |
|---|---|---|
| `PatientLookupPort` | `PatientLookupAdapter` (JdbcTemplate → `patients`) | Busca paciente por email |
| `PortalAppointmentPort` | `PortalAppointmentAdapter` (JdbcTemplate → `appointments` JOIN) | Lee citas del paciente |
| `PortalExamPort` | `PortalExamAdapter` (JdbcTemplate → `exam_orders` JOIN) | Lee exámenes del paciente |
| `PortalPrescriptionPort` | `PortalPrescriptionAdapter` (JdbcTemplate → `prescriptions` JOIN) | Lee prescripciones del paciente |

---

## Flujos clave

### Registro
1. Frontend envía `POST /api/portal/auth/register` con email y password
2. Backend busca paciente en `patients` por email → si no existe, retorna 404
3. Verifica que no exista ya una `patient_accounts` con ese email → si existe, retorna 409
4. Crea cuenta con password hasheado (BCrypt)
5. Retorna token JWT listo para usar

### Login
1. Frontend envía `POST /api/portal/auth/login`
2. Backend busca cuenta en `patient_accounts` por email
3. Valida password con BCrypt
4. Actualiza `last_login`
5. Retorna token JWT

### Consulta de citas
1. Frontend envía `GET /api/portal/appointments` con `Authorization: Bearer <token>`
2. El `@AuthenticationPrincipal` inyecta el `patientId` (subject del JWT)
3. Backend ejecuta JOIN de `appointments` con `doctors`, `users`, `specialties`, `services`, `sedes`
4. Retorna lista ordenada por `start_time DESC`

---

## Dependencias con otros módulos

| Tabla consultada | Módulo origen |
|---|---|
| `patients` | patients |
| `appointments` | agenda |
| `doctors`, `specialties`, `services`, `sedes` | catalog |
| `exam_orders`, `exam_order_items` | exam |
| `prescriptions`, `prescription_items`, `medications` | prescription |
