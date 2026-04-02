export interface PrescriptionItem {
  medicationId: string;
  quantity: number;
  dose: string;
  frequency: string;
  duration: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  items: PrescriptionItem[];
  diagnosisId?: string;
  notes?: string;
}

export interface PrescriptionItemResponse {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
  quantity: number;
  dispensed: boolean;
}

export interface PrescriptionResponse {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  diagnosisId?: string;
  notes?: string;
  status: 'ACTIVE' | 'DISPENSED' | 'CANCELLED';
  items: PrescriptionItemResponse[];
  createdAt: string;
  createdBy: string;
}

export interface KardexEntry {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicationId: string;
  medicationName: string;
  commercialName?: string;
  action: 'PRESCRIBED' | 'DISPENSED' | 'SUSPENDED' | 'COMPLETED';
  quantity?: number;
  notes?: string;
  recordedBy?: string;
  recordedAt: string;
}