# Módulo: Generación de PDF (iText 7)

## Propósito
Genera documentos PDF descargables para comprobantes de pago, recetas médicas y órdenes de examen, usando la librería iText 7.

---

## Componentes

### PdfService (interfaz)
**Paquete:** `com.clinica.salud.modules.integration.pdf`

| Método | Descripción |
|--------|-------------|
| `generateInvoicePdf(invoiceId)` | Genera PDF del comprobante de pago con ítems, subtotal, IGV y total |
| `generatePrescriptionPdf(prescriptionId)` | Genera PDF de la receta médica con medicamentos, dosis y frecuencia |
| `generateExamOrderPdf(examOrderId)` | Genera PDF de la orden de examen con resultados si están disponibles |

### ITextPdfService (implementación)
**Paquete:** `com.clinica.salud.modules.integration.pdf`

Usa iText 7 (`itext7-core 7.2.5`) y `JdbcTemplate` para consultas cross-módulo.

- Encabezado estándar: "CLÍNICA YOSELIN" + tipo de documento + código
- Tabla de ítems con cabecera sombreada (`ColorConstants.LIGHT_GRAY`)
- Pie de página: "Documento generado electrónicamente — Clínica Yoselin"
- Errores quedan en log (`ERROR`) y lanzan `RuntimeException` al caller

---

## Endpoints

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/invoices/{id}/pdf` | `FACTURACION_READ` | Descarga PDF del comprobante de pago |
| GET | `/api/prescriptions/{id}/pdf` | `PRESCRIPCIONES_READ` | Descarga PDF de la receta médica |
| GET | `/api/exams/orders/{id}/pdf` | `EXAMENES_READ` | Descarga PDF de la orden de examen |

### Respuesta
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-{id}.pdf"` (o `prescription-` / `exam-order-`)
- **Body:** bytes del PDF

---

## Dependencia pom.xml

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

---

## Datos consultados por documento

### Comprobante de pago (`generateInvoicePdf`)
- `invoices` → serie, número, estado, subtotal, IGV, total, fecha
- `patients` → nombre completo, tipo y número de documento
- `sedes` → nombre de sede
- `invoice_items` → descripción, cantidad, precio unitario, total

### Receta médica (`generatePrescriptionPdf`)
- `prescriptions` → estado, notas, fecha
- `patients` → nombre completo, tipo y número de documento
- `users` (vía `doctors`) → nombre del médico
- `prescription_items` + `medications` → medicamento, dosis, frecuencia, duración, indicaciones

### Orden de examen (`generateExamOrderPdf`)
- `exam_orders` → estado, notas, fecha
- `patients` → nombre completo, tipo y número de documento
- `users` (vía `doctors`) → nombre del médico solicitante
- `exam_order_items` + `services` → nombre del examen, estado, resultado

---

## Dependencias con otros módulos
- **Billing**: `BillingController` expone el endpoint de descarga de factura
- **Prescription**: `PrescriptionController` expone el endpoint de receta
- **Exam**: `ExamOrderController` expone el endpoint de orden de examen
- `PdfService` se inyecta directamente en los controllers de cada módulo
