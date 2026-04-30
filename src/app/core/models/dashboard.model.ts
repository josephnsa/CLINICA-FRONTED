export interface HeaderUserDto {
  userId: string;
  fullName: string;
  initials: string;
  role: string;
  roleLabel: string;
  sedeId: string;
  sedeName: string;
  availableSedes: SedeOptionDto[];
}

export interface SedeOptionDto {
  id: string;
  name: string;
}

export interface NotificationItemDto {
  type: string;
  title: string;
  body: string;
  severity: string;
  createdAt: string;
  linkId: string;
}

export interface NotificationSummaryDto {
  totalUnread: number;
  appointmentsToday: number;
  pendingExamResults: number;
  pendingInvoices: number;
  lowStockItems: number;
  recent: NotificationItemDto[];
}

export interface DashboardSummaryDto {
  currentMonthRevenue: number;
  monthOverMonthChange: number;
  currentYearRevenue: number;
  yearOverYearChange: number;
  currentMonthAppointments: number;
  newPatientsThisMonth: number;
}

export interface DashboardRevenuePointDto {
  month: number;
  monthLabel: string;
  totalInvoiced: number;
  appointmentCount: number;
}

export interface DashboardYearValueDto {
  year: number;
  totalRevenue: number;
  growthPercent: number | null;
}

export interface DashboardYearlyBreakupDto {
  years: DashboardYearValueDto[];
}

export interface DashboardRecentTransactionDto {
  invoiceId: string;
  paidAt: string;
  patientFullName: string;
  description: string;
  amount: number;
  status: string;
  paymentMethod: string;
}

export interface DashboardPerformanceDto {
  doctorId: string;
  doctorName: string;
  serviceName: string;
  appointmentCount: number;
  revenueGenerated: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
}
