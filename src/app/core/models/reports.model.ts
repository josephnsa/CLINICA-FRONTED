export interface ReportRequest {
  sedeId: string;
  startDate: string;
  endDate: string;
}

export interface OperationalReportResponse {
  totalAppointments: number;
  attendedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  occupancyRate: number;
  topServices: ServiceFrequency[];
}

export interface ServiceFrequency {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface ClinicalReportResponse {
  totalPatients: number;
  newPatients: number;
  topDiagnoses: DiagnosisFrequency[];
  topMedications: MedicationFrequency[];
  topServices: ServiceFrequency[];
}

export interface DiagnosisFrequency {
  code: string;
  description: string;
  count: number;
}

export interface MedicationFrequency {
  medicationId: string;
  medicationName: string;
  count: number;
}

export interface FinancialReportResponse {
  totalRevenue: number;
  totalInvoices: number;
  totalRefunds: number;
  byPaymentMethod: PaymentMethodSummary[];
}

export interface PaymentMethodSummary {
  method: string;
  amount: number;
  count: number;
}

export interface InventoryReportResponse {
  totalItems: number;
  lowStockItems: InventoryItemSummary[];
  expiringItems: InventoryItemSummary[];
}

export interface InventoryItemSummary {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  expiryDate?: string;
}