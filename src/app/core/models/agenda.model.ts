export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'ATTENDED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  serviceId: string;
  sedeId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface RescheduleAppointmentRequest {
  newStart: string;
  newEnd: string;
  reason: string;
}

export interface AppointmentResponse {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  sedeId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityRule {
  id: string;
  doctorId: string;
  sedeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateAvailabilityRuleRequest {
  doctorId: string;
  sedeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilityBlock {
  id: string;
  doctorId: string;
  sedeId: string;
  startDt: string;
  endDt: string;
  reason: string;
}

export interface CreateAvailabilityBlockRequest {
  doctorId: string;
  sedeId: string;
  startDt: string;
  endDt: string;
  reason: string;
}

export interface CreateTriageRequest {
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  triageLevel: 'EMERGENCY' | 'URGENT' | 'NORMAL' | 'LOW';
  notes?: string;
}

export interface TriageResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;
  triageLevel: string;
  critical: boolean;
  notes?: string;
  createdAt: string;
}