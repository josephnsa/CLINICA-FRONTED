export interface ExamOrder {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  examType: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'ENTREGADO';
  notes?: string;
  createdAt?: string;
}

export interface ExamOrderItem {
  serviceId: string;
}

export interface CreateExamOrderDto {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  notes?: string;
  items: ExamOrderItem[];
}
export interface ExamResult {
  result: string;
  fileUrl?: string;
}