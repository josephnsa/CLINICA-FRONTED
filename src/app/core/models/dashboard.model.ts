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
