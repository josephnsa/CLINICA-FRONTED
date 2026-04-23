// ── AUTH ─────────────────────────────────────────────────
export interface PortalRegisterRequest {
  email: string;
  password: string;
}

export interface PortalLoginRequest {
  email: string;
  password: string;
}

export interface PortalAuthResponse {
  accessToken: string;
  refreshToken: string;
  patientId: string;
  fullName: string;
  email: string;
  permissions: string[];
}

// ── CITAS ────────────────────────────────────────────────
export interface PortalAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  serviceName: string;
  sedeName: string;
  startTime: string;
  status: string;
}

// ── EXÁMENES ─────────────────────────────────────────────
export interface PortalExamOrder {
  id: string;
  examName: string;
  status: string;
  resultUrl?: string;
  createdAt: string;
}

// ── PRESCRIPCIONES ───────────────────────────────────────
export interface PortalPrescription {
  id: string;
  doctorName: string;
  createdAt: string;
  items: PortalPrescriptionItem[];
}

export interface PortalPrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
}
export interface PortalDoctor {
  id: string;
  doctorName: string;
  specialty: string;
  services?: string[];
  sede?: string;
  consultationFee?: number;
  available?: boolean;
}
export interface PortalSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface BookAppointmentRequest {
  patientId: string;
  doctorId: string;
  slotId: string;
  notes?: string;
}
export interface PortalPayment {
  id: string;
  concept: string;
  doctorName: string;
  amount: number;
  status: string;
  createdAt: string;
}