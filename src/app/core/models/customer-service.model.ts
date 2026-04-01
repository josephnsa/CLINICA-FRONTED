export type ComplaintType = 'MEDICAL_CARE' | 'ADMINISTRATIVE' | 'INFRASTRUCTURE' | 'BILLING' | 'WAITING_TIME' | 'OTHER';
export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Complaint {
  id: string;
  patientId: string;
  sedeId: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateComplaintRequest {
  patientId: string;
  sedeId: string;
  type: ComplaintType;
  description: string;
  priority: ComplaintPriority;
}

export interface ResolveComplaintRequest {
  resolution: string;
}

export interface SatisfactionSurvey {
  id: string;
  patientId: string;
  appointmentId: string;
  sedeId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface CreateSurveyRequest {
  patientId: string;
  appointmentId: string;
  sedeId: string;
  score: number;
  comment?: string;
}

export const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  MEDICAL_CARE: 'Atención médica',
  ADMINISTRATIVE: 'Procesos administrativos',
  INFRASTRUCTURE: 'Infraestructura',
  BILLING: 'Facturación',
  WAITING_TIME: 'Tiempos de espera',
  OTHER: 'Otros',
};

export const COMPLAINT_PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En gestión',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};