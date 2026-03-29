# Módulo: Seguridad y Accesos

## Propósito
Gestiona la autenticación del personal interno, autorización granular por permisos, auditoría de acciones y la administración de usuarios, roles y sedes.

---

## Modelo de Seguridad

### Autenticación
- **Mecanismo:** JWT stateless (JJWT 0.12.3)
- **Endpoint:** `POST /api/auth/login`
- **Claims del token:** `sub` (userId), `role`, `permissions` (lista), `sedeId`
- **Expiración:** configurable en `application.properties`

### Autorización
- Cada endpoint usa `@PreAuthorize("hasAuthority('PERMISO')")`
- Los permisos son strings planos (ej. `agenda:create`, `FACTURACION_READ`)
- Un rol agrupa múltiples permisos

---

## Entidades Principales

### User (Usuario)
**Tabla:** `users`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| email | String | Login (único) |
| password | String | BCrypt hash |
| fullName | String | Nombre completo |
| roleId | UUID | FK a roles |
| isActive | boolean | Activo/bloqueado |
| createdAt | LocalDateTime | Fecha de creación |

---

### Role (Rol)
**Tabla:** `roles`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código único (ej. ADMIN, DOCTOR, NURSE) |
| name | String | Nombre descriptivo |

---

### Permission (Permiso)
**Tabla:** `permissions`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código del permiso (ej. `agenda:create`) |
| description | String | Descripción legible |

---

### RolePermission
**Tabla:** `role_permissions` (join table)

Relaciona roles con permisos. Un rol puede tener N permisos.

---

### UserSede
**Tabla:** `user_sedes`

Relaciona usuarios con las sedes a las que tienen acceso. Un usuario puede pertenecer a múltiples sedes.

---

### AuditLog (Auditoría)
**Tabla:** `audit_logs`

Registra acciones relevantes del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| userId | UUID | Usuario que ejecutó la acción |
| action | String | Acción (CREATE, UPDATE, DELETE, LOGIN) |
| entity | String | Entidad afectada |
| entityId | String | ID del registro afectado |
| details | String | JSON con detalles del cambio |
| createdAt | LocalDateTime | Timestamp |

---

## Endpoints REST

### Autenticación — `/api/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login con email/password |
| GET | `/api/auth/me` | JWT | Perfil del usuario autenticado |
| POST | `/api/auth/change-password` | JWT | Cambiar contraseña |

### Usuarios — `/api/users`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/users` | `SEGURIDAD_READ` |
| POST | `/api/users` | `SEGURIDAD_WRITE` |
| PUT | `/api/users/{id}` | `SEGURIDAD_WRITE` |
| DELETE | `/api/users/{id}` | `SEGURIDAD_WRITE` |

### Roles — `/api/roles`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/roles` | `SEGURIDAD_READ` |
| POST | `/api/roles` | `SEGURIDAD_WRITE` |

### Auditoría — `/api/audit`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/audit` | `SEGURIDAD_READ` |

---

## Permisos del Sistema

| Módulo | Permisos |
|---|---|
| Agenda | `agenda:create`, `agenda:cancel`, `agenda:reschedule`, `agenda:checkin`, `agenda:start`, `agenda:complete`, `agenda:noshow`, `agenda:read`, `agenda:availability`, `agenda:triage` |
| Pacientes | `patients:read`, `patients:write` |
| Facturación | `FACTURACION_READ`, `FACTURACION_CREATE`, `FACTURACION_REFUND` |
| Inventario | `INVENTARIO_READ`, `INVENTARIO_WRITE` |
| Exámenes | `EXAMENES_READ`, `EXAMENES_CREATE`, `EXAMENES_RESULT`, `EXAMENES_SIGN` |
| Prescripciones | `PRESCRIPCIONES_READ`, `PRESCRIPCIONES_CREATE`, `PRESCRIPCIONES_DISPENSE` |
| Catálogo | `CATALOGO_READ`, `CATALOGO_WRITE` |
| Reportes | `REPORTES_READ` |
| Seguridad | `SEGURIDAD_READ`, `SEGURIDAD_WRITE` |
| RR.HH. | `hrm:read`, `hrm:write` |
| At. Cliente | `cs:write` |

---

## Roles Sugeridos

| Rol | Permisos principales |
|---|---|
| `ADMIN` | Todos los permisos |
| `DOCTOR` | agenda:*, patients:read, EXAMENES_*, PRESCRIPCIONES_CREATE, CATALOGO_READ |
| `NURSE` | agenda:checkin, agenda:triage, patients:read, INVENTARIO_READ |
| `RECEPTIONIST` | agenda:create, agenda:cancel, patients:write, FACTURACION_CREATE, CATALOGO_READ |
| `PHARMACIST` | PRESCRIPCIONES_DISPENSE, INVENTARIO_* |
| `CASHIER` | FACTURACION_*, REPORTES_READ |

---

## Reglas de Negocio Clave
1. El JWT incluye los permisos del rol — no se consulta la BD en cada request.
2. Un usuario bloqueado (`isActive=false`) no puede autenticarse.
3. Al cambiar el rol de un usuario, debe re-autenticarse para obtener un nuevo token.
4. La auditoría registra solo acciones sensibles — no lecturas masivas.
5. Un usuario pertenece a al menos una sede — el `sedeId` del token indica la sede activa.
