# Features Pendientes — Requieren Análisis de Arquitectura

Estas funcionalidades no están implementadas porque implican decisiones técnicas de mayor envergadura que deben analizarse antes de desarrollar.

---

## 1. Portal del Paciente (Reservas Virtuales)

### Qué es
Una interfaz pública donde el **paciente** (no el personal) puede:
- Registrarse y autenticarse con su propio login
- Buscar médicos por especialidad y sede
- Ver disponibilidad en tiempo real
- Reservar, reprogramar y cancelar citas
- Ver su historial de citas y resultados

### Decisiones pendientes
| Pregunta | Opciones |
|---|---|
| ¿Auth separada para pacientes? | Nuevo endpoint público `/api/patient-portal/auth/login` con rol `PATIENT` |
| ¿Disponibilidad en tiempo real? | Polling cada N segundos vs WebSocket (Spring WebFlux / STOMP) |
| ¿Pagos online para reserva? | Culqi (Perú), Niubiz, Stripe — requiere webhook de confirmación |
| ¿Confirmación por notificación? | Email (SendGrid/SES) o WhatsApp (Twilio) |

### Entidades nuevas necesarias
- `patient_users` — credenciales separadas de `users` (o extender `users` con rol `PATIENT`)
- Endpoints públicos sin `@PreAuthorize` (acceso sin JWT del personal)

---

## 2. Notificaciones (Recordatorios de Cita)

### Qué es
Envío automático de mensajes al paciente para:
- Confirmación de cita agendada
- Recordatorio 24h antes
- Aviso de cancelación o reprogramación
- Resultados de exámenes disponibles

### Decisiones pendientes
| Pregunta | Opciones |
|---|---|
| Canal principal | WhatsApp Business API (Twilio) vs SMS vs Email |
| ¿Cuándo se dispara? | Scheduler (`@Scheduled`) vs evento de dominio (Spring ApplicationEvent) |
| ¿Plantillas editables? | Hardcoded vs tabla `notification_templates` en BD |
| ¿Logs de envío? | Tabla `notification_logs` para auditoría de mensajes |

### Dependencias técnicas
- `spring-boot-starter-mail` para email
- SDK de Twilio para WhatsApp/SMS
- Job scheduler para recordatorios (Quartz o `@Scheduled`)

---

## 3. Exportación de Documentos (PDF/Excel)

### Qué es
Generación de documentos descargables:
- Recetas médicas en PDF (con membrete, firma)
- Órdenes de examen en PDF
- Reportes financieros en Excel
- Historia clínica resumida del paciente en PDF

### Decisiones pendientes
| Pregunta | Opciones |
|---|---|
| Librería PDF | iText 7, Apache PDFBox, JasperReports |
| Librería Excel | Apache POI |
| ¿Plantillas HTML → PDF? | Thymeleaf + Flying Saucer (render HTML como PDF) |
| ¿Se almacenan los PDFs? | Generación on-demand vs almacenamiento en S3/MinIO |

---

## 4. Control de Asistencia del Personal (HRM)

### Qué es
Registro de entrada y salida diaria del personal para:
- Control de horario cumplido vs programado
- Cálculo de tardanzas y ausencias
- Reporte mensual de asistencia

### Decisiones pendientes
| Pregunta | Opciones |
|---|---|
| ¿Cómo se registra? | Manual (endpoint) vs lector biométrico / QR |
| ¿Nueva tabla? | `attendance_records` (employee_id, date, check_in, check_out, status) |
| ¿Cálculo automático? | Comparar con `employee_schedules` para detectar tardanzas |

### Tabla propuesta
```sql
CREATE TABLE attendance_records (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id  UUID NOT NULL REFERENCES employees(id),
    work_date    DATE NOT NULL,
    check_in     TIME,
    check_out    TIME,
    status       VARCHAR(20) -- ON_TIME, LATE, ABSENT, HALF_DAY
);
```

---

## 5. Integraciones de Pago Online

### Qué es
Cobro en línea para el portal del paciente al reservar una cita.

### Decisiones pendientes
| Pregunta | Opciones |
|---|---|
| Pasarela | Culqi (más común en Perú), Niubiz, PayPal |
| Flujo | Frontend llama a pasarela → webhook notifica al backend → backend confirma cita |
| ¿Reembolsos automáticos? | Depende de la pasarela |

---

## Prioridad sugerida de implementación

1. **Exportación PDF** — alto impacto, independiente, librería conocida
2. **Notificaciones email** — básico con `spring-boot-starter-mail`, sin dependencias externas costosas
3. **Control de asistencia** — solo requiere una migración y endpoints simples
4. **Portal del paciente** — mayor complejidad, requiere decisión de arquitectura frontend también
5. **Notificaciones WhatsApp** — costo por mensaje, requiere cuenta Business verificada
6. **Pagos online** — requiere proceso de afiliación con la pasarela
