export interface InvoiceItemRequest {
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceType = 'BOLETA' | 'FACTURA';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'SEGURO';

export interface CreateInvoiceRequest {
  patientId: string;
  sedeId: string;
  items: InvoiceItemRequest[];
  invoiceType: InvoiceType;
  paymentMethod?: PaymentMethod;
}

export interface InvoicePatientSummary {
  id: string;
  fullName: string;
  documentNumber?: string | null;
}

export interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceResponse {
  id: string;
  number: string;
  date: string;
  sedeId: string;
  sedeName: string;
  patient: InvoicePatientSummary;
  items: InvoiceItem[];
  total: number;
  status: 'EMITIDO' | 'PAGADO' | 'PENDIENTE' | string;
  balance: number;
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
}

export interface CashRegisterMethodSummary {
  method: PaymentMethod;
  amount: number;
  count: number;
}

export interface CashRegisterSummary {
  date: string;
  sedeId: string;
  sedeName?: string;
  totalAmount: number;
  totalInvoices: number;
  byMethod: CashRegisterMethodSummary[];
}

