# Módulo: Integración Email y Recordatorios

## Propósito
Envía notificaciones automáticas por email a pacientes: recordatorios de cita 24h antes, aviso de resultados de exámenes disponibles y comprobantes de pago.

---

## Componentes

### EmailService (interfaz)
**Paquete:** `com.clinica.salud.modules.integration.email`

Define el contrato de envío de emails. La implementación por defecto es `SmtpEmailService`.

| Método | Descripción |
|--------|-------------|
| `sendAppointmentReminder(to, patientName, doctorName, appointmentAt, sedeName)` | Recordatorio 24h antes de la cita |
| `sendExamResultReady(to, patientName, examName)` | Aviso de resultado de examen disponible |
| `sendInvoiceReceipt(to, patientName, invoiceCode, total)` | Comprobante de pago |

### SmtpEmailService (implementación)
Usa `JavaMailSender` de Spring Boot para envío vía SMTP.

- Formato: texto plano (SimpleMailMessage)
- Errores de envío quedan en log (`ERROR`) sin lanzar excepción al caller
- El campo `from` se configura con `${app.mail.from}`

### ReminderScheduler
Tarea programada con `@Scheduled(cron = "0 0 8 * * *")` — todos los días a las **08:00 AM**.

**Lógica:**
1. Solo ejecuta si `app.reminders.enabled=true`
2. Consulta en `appointments` las citas con status `PENDING` o `CONFIRMED` para el día siguiente con paciente con email registrado
3. Envía `sendAppointmentReminder` para cada una
4. Errores por fila son capturados individualmente (no detienen el batch)

---

## Configuración

### application.properties
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.mail.from=${MAIL_FROM:notificaciones@clinica.pe}
app.reminders.enabled=${REMINDERS_ENABLED:false}
```

### Variables de entorno requeridas en producción
| Variable | Descripción |
|----------|-------------|
| `MAIL_USERNAME` | Cuenta Gmail o SMTP (ej. `clinica@gmail.com`) |
| `MAIL_PASSWORD` | Contraseña de app (no la contraseña de Gmail — activar 2FA y generar App Password) |
| `MAIL_FROM` | Dirección que aparece como remitente |
| `REMINDERS_ENABLED` | `true` para activar el scheduler |

---

## Activar en desarrollo

Para probar localmente sin enviar emails reales, agregar a `application-dev.properties`:
```properties
app.reminders.enabled=false
spring.mail.host=localhost
spring.mail.port=1025
```
Y usar [MailHog](https://github.com/mailhog/MailHog) como servidor SMTP de prueba local.

---

## Dónde inyectar EmailService

El `EmailService` puede inyectarse en cualquier use case. Ejemplos de uso futuro:

| Evento | Use case | Método |
|--------|----------|--------|
| Cita confirmada | `ConfirmAppointmentUseCase` | `sendAppointmentReminder` |
| Resultado de examen listo | `RegisterExamResultUseCase` | `sendExamResultReady` |
| Pago registrado | `RegisterPaymentUseCase` | `sendInvoiceReceipt` |
