# Documentación de Módulos — Clínica Backend

Esta carpeta contiene la documentación de lógica de negocio de cada módulo del sistema. Usar como referencia para el desarrollo del frontend y para entender las reglas del dominio.

---

## Módulos Implementados

| Módulo | Archivo | Estado |
|---|---|---|
| Seguridad y Accesos | [auth-security.md](modules/auth-security.md) | ✅ Completo |
| Maestro Clínico (Catalog) | [catalog.md](modules/catalog.md) | ✅ Completo |
| Pacientes e Historia Clínica | [patients.md](modules/patients.md) | ✅ Completo |
| Agenda y Atención | [agenda.md](modules/agenda.md) | ✅ Completo |
| Prescripción y Medicación | [prescription.md](modules/prescription.md) | ✅ Completo |
| Exámenes y Resultados | [exam.md](modules/exam.md) | ✅ Completo |
| Facturación y Caja | [billing.md](modules/billing.md) | ✅ Completo |
| Inventario y Farmacia | [inventory.md](modules/inventory.md) | ✅ Completo |
| Recursos Humanos | [hrm.md](modules/hrm.md) | ✅ Completo |
| Atención al Cliente | [customer-service.md](modules/customer-service.md) | ✅ Completo |
| Reportes y Analítica | [reports.md](modules/reports.md) | ✅ Completo |

---

## Pendiente — Requiere Análisis

| Feature | Archivo |
|---|---|
| Portal del paciente, notificaciones, exportación PDF, control asistencia, pagos online | [pending-analysis.md](modules/pending-analysis.md) |

---

## Convenciones del Sistema

- **Respuesta estándar:** `{ success, message, data, timestamp }` via `ApiResponse<T>`
- **Auth:** JWT Bearer token en header `Authorization`
- **Multisede:** el `sedeId` del token JWT indica la sede activa del usuario
- **UUIDs:** todos los IDs son UUID v4
- **Timestamps:** `LocalDateTime` en zona horaria del servidor (configurar UTC en prod)
- **Paginación:** endpoints de lista usan `Pageable` de Spring Data (`?page=0&size=20`)
