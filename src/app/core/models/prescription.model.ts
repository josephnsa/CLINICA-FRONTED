export interface PrescriptionItem {
  medicationId: string;
  quantity: number;
  dose: string;
  frequency: string;
  duration: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  appointmentId: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItemResponse {
  id: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  dose: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionResponse {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  status: 'ACTIVE' | 'DISPENSED' | 'CANCELLED';
  items: PrescriptionItemResponse[];
  createdAt: string;
  createdBy: string;
}

export interface KardexEntry {
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: string;
  dispensedAt?: string;
  createdAt: string;
}