
Sistema de gestión clínica desarrollado con **Angular 21** y **Angular Material**, que incluye módulos de facturación, maestros, seguridad y autenticación.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | 21.x |
| Angular Material | 21.x |
| TailwindCSS | 4.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| ApexCharts | 5.x |
| ngx-translate | 17.x |
| ngx-toastr | 19.x |

---

## Requisitos previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 21.x

```bash
npm install -g @angular/cli
```

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/josephnsa/CLINICA-FRONTED.git
cd CLINICA-FRONTED

# Instalar dependencias
npm install
```

---

## Configuración

El archivo de entorno se encuentra en `src/environments/environment.ts`. Por defecto apunta al backend local:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:9090/api',
};
```

Para producción edita `src/environments/environment.prod.ts` con la URL del servidor real.

---

## Scripts disponibles

```bash
# Iniciar servidor de desarrollo (http://localhost:4200)
npm start

# Compilar para producción
npm run build

# Ejecutar tests unitarios
npm test

# Compilar en modo watch (desarrollo)
npm run watch
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── auth/              # AuthGuard y AuthService
│   │   ├── interceptors/      # JWT e interceptor de errores HTTP
│   │   ├── models/            # Interfaces y modelos de dominio
│   │   └── services/          # Servicios de negocio (billing, catalog, security)
│   ├── layouts/
│   │   ├── full/              # Layout principal con sidebar y header
│   │   └── blank/             # Layout para páginas sin menú (login)
│   ├── pages/
│   │   ├── authentication/    # Login y registro
│   │   ├── facturacion/       # Caja, emisión, pagos, proformas, notas de crédito
│   │   ├── maestro/           # Especialistas, medicamentos, servicios, tarifarios, CIE10
│   │   ├── seguridad/         # Usuarios, auditoría, autenticación, parámetros de sede
│   │   └── starter/           # Dashboard principal
│   ├── components/            # Componentes reutilizables (gráficas, tablas, etc.)
│   ├── pipe/                  # Pipes personalizados
│   └── services/              # Servicios compartidos
├── assets/
│   ├── i18n/                  # Traducciones (es, en, de, fr)
│   ├── images/                # Imágenes y recursos visuales
│   └── scss/                  # Estilos globales y overrides de Angular Material
└── environments/              # Configuración de entornos
```

---

## Módulos principales

### Autenticación
- Login con JWT
- Guard de rutas protegidas
- Interceptor que adjunta el token en cada petición HTTP

### Facturación
- Emisión de facturas
- Gestión de caja
- Registro de pagos
- Proformas
- Notas de crédito

### Maestros
- Especialistas
- Medicamentos
- Servicios médicos
- Tarifarios
- CIE-10 (Clasificación Internacional de Enfermedades)
- Dashboard clínico

### Seguridad
- Gestión de usuarios
- Auditoría del sistema
- Parámetros por sede
- Configuración de autenticación

---

## Internacionalización (i18n)

El proyecto usa `@ngx-translate` con soporte para:
- Español (`es.json`)
- Inglés (`en.json`)
- Alemán (`de.json`)
- Francés (`fr.json`)

---

## Despliegue en Cloud Run (GCP) — Recomendado

El proyecto incluye `Dockerfile` y `nginx.conf` listos para producción.

### 1. Configurar la URL del backend

Edita `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.axelior.ai/api', // host del LB+IAP corporativo
};
```

Si tu organización bloquea `allUsers` en Cloud Run, evita usar `*.run.app` directo desde navegador.
Usa la entrada corporativa **LB + IAP** documentada en:
`scripts/gcp-lb-iap/README.md`.

### 2. Build y push con Cloud Build

```bash
gcloud auth login
gcloud config set project pe-axelior-clinapp-dev

gcloud builds submit --tag gcr.io/pe-axelior-clinapp-dev/clinica-frontend
```

### 3. Desplegar en Cloud Run

```bash
gcloud run deploy clinica-frontend \
  --image gcr.io/pe-axelior-clinapp-dev/clinica-frontend \
  --region us-central1 \
  --platform managed \
  --service-account clinica-backend-sa@pe-axelior-clinapp-dev.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port 8080 \
  --project pe-axelior-clinapp-dev
```

### 4. Autorizar al frontend para invocar el backend

```bash
gcloud run services add-iam-policy-binding salud-backend \
  --region=us-central1 \
  --member=serviceAccount:clinica-backend-sa@pe-axelior-clinapp-dev.iam.gserviceaccount.com \
  --role=roles/run.invoker \
  --project=pe-axelior-clinapp-dev
```

### Arquitectura GCP

```
Usuario (navegador)
        │
        ▼
┌───────────────────────────┐
│  Cloud Run                │
│  clinica-frontend (nginx) │  puerto 8080
└────────────┬──────────────┘
             │ HTTP autenticado con SA
             ▼
┌───────────────────────────┐
│  Cloud Run                │
│  salud-backend (API REST) │
└────────────┬──────────────┘
             │
             ▼
       Cloud SQL / Firestore
```

---

## Despliegue en Netlify (alternativa)

El proyecto incluye `netlify.toml` preconfigurado para despliegue automático.

Solo conecta el repositorio en [netlify.com](https://netlify.com) y el despliegue se configura automáticamente.

---

## Backend

Este frontend consume la API REST del backend de Clinica Yoselin. Asegúrate de tener el backend corriendo en `http://localhost:9090` antes de iniciar el servidor de desarrollo.

---

## Licencia

Proyecto privado - Clinica . Todos los derechos reservados.
