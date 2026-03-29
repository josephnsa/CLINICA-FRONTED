# Módulo: Maestro Clínico (Catalog)

## Propósito
Contiene todos los catálogos reutilizados por el resto del sistema: especialidades, servicios médicos, médicos/especialistas, medicamentos, códigos CIE-10 y tarifarios por sede.

---

## Submodelos

### Specialty (Especialidad)
**Tabla:** `specialties`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código único (ej. "CARD") |
| name | String | Nombre (ej. "Cardiología") |
| isActive | boolean | Activa/inactiva |

---

### MedicalService (Servicio/Procedimiento)
**Tabla:** `services`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código único |
| name | String | Nombre del servicio |
| specialtyId | UUID | Especialidad asociada |
| durationMin | int | Duración en minutos |
| price | BigDecimal | Precio base |
| isActive | boolean | Activo/inactivo |

---

### Doctor (Médico/Especialista)
**Tabla:** `doctors`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK a users (cuenta de acceso) |
| licenseNumber | String | Número de colegiatura (único) |
| specialtyId | UUID | Especialidad principal |
| isActive | boolean | Activo/inactivo |
| createdAt | LocalDateTime | Fecha de registro |

> Un médico siempre tiene asociada una cuenta de usuario (`userId`). El nombre completo y email se obtienen del usuario.

---

### Medication (Medicamento)
**Tabla:** `medications`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código único |
| genericName | String | Nombre genérico (DCI) |
| commercialName | String | Nombre comercial |
| presentation | String | Forma farmacéutica (tableta, ampolla, etc.) |
| unit | String | Unidad (mg, ml, etc.) |
| isActive | boolean | Activo/inactivo |

---

### Tariff (Tarifario)
**Tabla:** `tariffs`

Precio de un servicio específico en una sede específica. Permite precios diferentes por sede (ej. sede principal vs sucursal).

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| serviceId | UUID | FK a services |
| sedeId | UUID | FK a sedes |
| name | String | Nombre del tarifario (ej. "Particular", "EPS XYZ") |
| price | BigDecimal | Precio en esta sede |
| isActive | boolean | Activo/inactivo |

**Restricción:** combinación `(service_id, sede_id)` es única.

---

### Sede (Sucursal/Sede)
**Tabla:** `sedes`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | String | Código único |
| name | String | Nombre de la sede |
| address | String | Dirección |
| isActive | boolean | Activa/inactiva |

---

## Endpoints REST

### Especialidades — `/api/catalog/specialties`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/catalog/specialties` | `CATALOGO_READ` |
| POST | `/api/catalog/specialties` | `CATALOGO_WRITE` |
| PUT | `/api/catalog/specialties/{id}` | `CATALOGO_WRITE` |
| DELETE | `/api/catalog/specialties/{id}` | `CATALOGO_WRITE` |

### Servicios — `/api/catalog/services`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/catalog/services` | `CATALOGO_READ` |
| POST | `/api/catalog/services` | `CATALOGO_WRITE` |
| PUT | `/api/catalog/services/{id}` | `CATALOGO_WRITE` |
| DELETE | `/api/catalog/services/{id}` | `CATALOGO_WRITE` |

### Médicos — `/api/catalog/doctors`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/catalog/doctors` | `CATALOGO_READ` | Lista (filtros: `specialtyId`, `active`) |
| GET | `/api/catalog/doctors/{id}` | `CATALOGO_READ` | Ver médico |
| POST | `/api/catalog/doctors` | `CATALOGO_WRITE` | Crear médico |
| PUT | `/api/catalog/doctors/{id}` | `CATALOGO_WRITE` | Actualizar |
| PATCH | `/api/catalog/doctors/{id}/toggle` | `CATALOGO_WRITE` | Activar/desactivar |

### Medicamentos — `/api/catalog/medications`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/catalog/medications` | `CATALOGO_READ` |
| POST | `/api/catalog/medications` | `CATALOGO_WRITE` |
| DELETE | `/api/catalog/medications/{id}` | `CATALOGO_WRITE` |

### Tarifarios — `/api/catalog/tariffs`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/catalog/tariffs` | `CATALOGO_READ` | Lista (filtros: `sedeId`, `serviceId`) |
| POST | `/api/catalog/tariffs` | `CATALOGO_WRITE` | Crear tarifario |
| PUT | `/api/catalog/tariffs/{id}` | `CATALOGO_WRITE` | Actualizar precio/nombre |
| PATCH | `/api/catalog/tariffs/{id}/toggle` | `CATALOGO_WRITE` | Activar/desactivar |

### Sedes — `/api/catalog/sedes`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/api/catalog/sedes` | `CATALOGO_READ` | Listar con usuarios asociados |
| POST | `/api/catalog/sedes` | `CATALOGO_WRITE` | Crear sede |
| PUT | `/api/catalog/sedes/{id}` | `CATALOGO_WRITE` | Actualizar |
| PATCH | `/api/catalog/sedes/{id}/toggle` | `CATALOGO_WRITE` | Activar/desactivar |

### CIE-10 — `/api/catalog/cie10`
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/catalog/cie10?search=` | `CATALOGO_READ` |

---

## Reglas de Negocio Clave
1. Un médico requiere un usuario existente (`userId`) — primero se crea el usuario, luego el médico.
2. El número de colegiatura (`licenseNumber`) es único en todo el sistema.
3. Un tarifario define el precio de **un servicio en una sede específica** — sobrescribe el precio base del servicio.
4. Los catálogos no se eliminan físicamente — se desactivan para preservar la integridad referencial.
5. La combinación `(service_id, sede_id)` en tarifarios es única — no puede haber dos tarifarios del mismo servicio en la misma sede activos al mismo tiempo.
