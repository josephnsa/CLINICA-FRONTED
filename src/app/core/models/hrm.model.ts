export interface Employee {
  id: string;
  userId: string;
  sedeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: EmployeeRole;
  licenseNumber?: string;
  hireDate: string;
  isActive: boolean;
}

export type EmployeeRole =
  | 'MÉDICO'
  | 'ENFERMERO'
  | 'TÉCNICO'
  | 'ADMINISTRATIVO'
  | 'FARMACÉUTICO'
  | 'CAJERO'
  | 'RECEPCIONISTA';

export interface CreateEmployeeRequest {
  userId: string;
  sedeId: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  licenseNumber?: string;
  hireDate: string;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  sedeId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  active: boolean;
}

export interface CreateScheduleRequest {
  employeeId: string;
  sedeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const DAY_NAMES: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  'MÉDICO',
  'ENFERMERO',
  'TÉCNICO',
  'ADMINISTRATIVO',
  'FARMACÉUTICO',
  'CAJERO',
  'RECEPCIONISTA',
];