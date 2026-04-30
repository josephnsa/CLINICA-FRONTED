# Módulo: Facturación Electrónica SUNAT

## Propósito
Genera, firma digitalmente y envía comprobantes electrónicos (facturas y boletas) a SUNAT a través de un PSE (Proveedor de Servicios Electrónicos). Almacena el estado del envío y el CDR (Comprobante de Recepción) devuelto por SUNAT.

---

## Submodelos de Dominio

### SunatDocument — Tabla: `sunat_documents`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| invoice_id | UUID | FK a `invoices` |
| document_type | VARCHAR(10) | `01` = Factura, `03` = Boleta |
| xml_content | TEXT | XML UBL 2.1 generado |
| cdr_content | TEXT | CDR XML devuelto por SUNAT |
| ticket | VARCHAR(100) | Número de ticket del PSE (envío asíncrono) |
| status | VARCHAR(20) | Estado del documento (ver abajo) |
| error_message | TEXT | Mensaje de error si fue rechazado |
| sent_at | TIMESTAMP | Fecha/hora de envío al PSE |
| created_at | TIMESTAMP | Fecha de creación del registro |

## Estados

```
PENDING → SENT → ACCEPTED
                → REJECTED
```

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Documento creado, pendiente de envío |
| `SENT` | XML enviado al PSE, esperando CDR |
| `ACCEPTED` | CDR recibido con aceptación de SUNAT |
| `REJECTED` | CDR con rechazo o error de comunicación |

---

## Componentes de Infraestructura

### UblXmlBuilder
Genera el XML UBL 2.1 leyendo la factura con `JdbcTemplate`.
- Serie que empieza en `B` → tipo `03` (boleta); cualquier otra → tipo `01` (factura)
- Incluye cabecera, datos del emisor/receptor, totales con IGV 18% y líneas de ítems
- Spec: UBL 2.1 SUNAT / `urn:oasis:names:specification:ubl:schema:xsd:Invoice-2`

### XmlDigitalSigner
Firma el XML con `javax.xml.crypto.dsig` (incluido en el JDK, sin dependencias extra).
- Lee el certificado desde un keystore JKS en classpath o filesystem
- Si `sunat.keystore.path` está vacío, devuelve el XML **sin firmar** (modo sandbox/dev)

### NubefactPseClient
Cliente HTTP REST para Nubefact PSE usando OkHttp 4.
- Endpoint: `POST {sunat.pse.url}/invoice`
- Autenticación: `Authorization: Token {sunat.pse.token}`
- Payload: JSON con XML codificado en Base64
- Si `sunat.pse.token` está vacío, simula respuesta `ACCEPTED` (modo sandbox)

---

## Use Cases

| Use Case | Descripción |
|----------|-------------|
| `SendToSunatUseCase` | Orquesta: genera XML → firma → envía al PSE → persiste estado |
| `GetSunatStatusUseCase` | Consulta el estado actual del documento SUNAT por `invoiceId` |

---

## Endpoints

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| POST | `/api/invoices/{id}/send-sunat` | `FACTURACION_CREATE` | Envía el comprobante a SUNAT |
| GET | `/api/invoices/{id}/sunat-status` | `FACTURACION_READ` | Consulta el estado del envío |

### Respuesta `SunatStatusResponse`
```json
{
  "id": "uuid",
  "invoiceId": "uuid",
  "documentType": "03",
  "status": "ACCEPTED",
  "ticket": null,
  "errorMessage": null,
  "sentAt": "2025-01-15T10:30:00",
  "createdAt": "2025-01-15T10:29:00"
}
```

---

## Migración

**V17__sunat_documents.sql** — Crea la tabla `sunat_documents`.

---

## Configuración

### application.properties
```properties
sunat.ruc=${EMPRESA_RUC:20000000001}
sunat.pse.url=${SUNAT_PSE_URL:https://api.nubefact.com/api/v1}
sunat.pse.token=${SUNAT_PSE_TOKEN:}
sunat.keystore.path=${KEYSTORE_PATH:}
sunat.keystore.password=${KEYSTORE_PASSWORD:}
```

### Variables de entorno requeridas en producción
| Variable | Descripción |
|----------|-------------|
| `EMPRESA_RUC` | RUC de 11 dígitos de la empresa |
| `SUNAT_PSE_URL` | URL del API REST del PSE (Nubefact u otro) |
| `SUNAT_PSE_TOKEN` | Token de autenticación del PSE |
| `KEYSTORE_PATH` | Ruta al archivo `.jks` con el certificado digital |
| `KEYSTORE_PASSWORD` | Contraseña del keystore |

### Modo Sandbox (desarrollo)
Dejar `SUNAT_PSE_TOKEN` y `KEYSTORE_PATH` vacíos. El sistema:
1. Generará el XML UBL correctamente
2. Omitirá la firma digital (log WARN)
3. Simulará una respuesta `ACCEPTED` sin llamar al PSE (log WARN)

---

## Dependencias con otros módulos
- **Billing**: `invoices` + `invoice_items` son la fuente de datos del XML
- **Patients**: datos del receptor (nombre, tipo/número de documento)
- **Sedes**: nombre de la sede emisora
- `SendToSunatUseCase` solo acepta facturas en estado `PAID` o `PENDING`
