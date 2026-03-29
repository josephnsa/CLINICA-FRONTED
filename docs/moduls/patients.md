# Módulo: Pacientes e Historia Clínica

## Propósito
Gestiona el registro completo del paciente: datos personales, ficha clínica base (alergias, antecedentes), evoluciones clínicas y consentimientos informados.

---

## Submodelos de Dominio

### Patient (Paciente)
**Tabla:** `patients`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| docType | String | DNI / PASAPORTE / CE |
| docNumber | String | Número de documento (único) |
| firstName | String | Nombres |
| lastName | String | Apellidos |
| birthDate | LocalDate | Fecha de nacimiento |
| gender | String | M / F / OTHER |
| email | String | Correo |
| phone | String | Teléfono |
| address | String | Dirección |
| bloodType | String | Grupo sanguíneo |
| emergencyName | String | Contacto de emergencia (nombre) |
| emergencyPhone | String | Contacto de emergencia (teléfono) |
| isActive | boolean | Paciente activo |

**Métodos de dominio:**
- `isMinor()` — true si tiene menos de 18 años
- `validate()` — valida docNumber, nombre, fecha de nacimiento
- `deactivate()` / `reactivate()` — gestión de estado
- `updateEmergencyContact(name, phone)` — actualiza contacto de emergencia

---

### ClinicalProfile (Ficha Clínica Base)
**Tabla:** `patient_clinical_profiles`

Registro único por paciente con antecedentes médicos.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | FK único a patients |
| allergies | String | Lista de alergias (texto libre) |
| personalHistory | String | Antecedentes personales |
| familyHistory | String | Antecedentes familiares |
| surgicalHistory | String | Antecedentes quirúrgicos |
| currentMeds | String | Medicamentos actuales |

**Métodos de dominio:**
- `hasAllergyTo(substance)` — true si la sustancia aparece en alergias
- `addAllergy(newAllergy)` — agrega una alergia a la lista
- `addCurrentMedication(medication)` — agrega un medicamento activo
- `hasRiskFactors()` — true si tiene antecedentes personales o familiares

---

### PatientConsent (Consentimiento Informado)
**Tabla:** `patient_consents`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| patientId | UUID | FK a patients |
| type | String | Tipo: CIRUGÍA, ANESTESIA, TRATAMIENTO, FOTOGRAFÍA, etc. |
| fileUrl | String | URL del documento firmado (PDF/imagen) |
| signedAt | LocalDateTime | Fecha/hora de firma |
| createdBy | UUID | Usuario que registró |

**Métodos de dominio:**
- `validate()` — requiere patientId y type
- `isSigned()` — true si signedAt no es null

---

## Casos de Uso

| Use Case | Descripción |
|---|---|
| `CreatePatientUseCase` | Registra nuevo paciente, crea su ficha clínica vacía |
| `UpdatePatientUseCase` | Actualiza datos del paciente |
| `GetPatientUseCase` | Obtiene paciente por ID |
| `SearchPatientsUseCase` | Busca por nombre, DNI, etc. |
| `CreateConsentUseCase` | Registra un consentimiento, lista y elimina consentimientos |

---

## Endpoints REST

### Pacientes — `/api/patients`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/patients` | `patients:write` | Crear paciente |
| PUT | `/api/patients/{id}` | `patients:write` | Actualizar |
| GET | `/api/patients/{id}` | `patients:read` | Obtener por ID |
| GET | `/api/patients?search=` | `patients:read` | Buscar pacientes |

### Consentimientos — `/api/patients/{patientId}/consents`
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/patients/{id}/consents` | `patients:write` | Registrar consentimiento |
| GET | `/api/patients/{id}/consents` | `patients:read` | Listar consentimientos |
| DELETE | `/api/patients/{id}/consents/{consentId}` | `patients:write` | Eliminar |

---

## Reglas de Negocio Clave
1. Un paciente tiene exactamente **una** ficha clínica base (1:1).
2. No se puede registrar un paciente con un número de documento ya existente.
3. Para pacientes menores de edad (`isMinor()`) se requiere datos del responsable.
4. Los consentimientos son inmutables una vez firmados — solo se puede eliminar si fue un error de carga.
5. La ficha clínica se crea automáticamente vacía al registrar el paciente.
