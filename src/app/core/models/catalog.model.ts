export interface ClinicalService {
  id: string;
  code: string;
  name: string;
  specialtyId: string | null;
  specialtyName: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface Doctor {
  id: string;
  fullName: string;
  licenseNumber: string;
  specialtyId: string;
  specialtyName: string | null;
  active: boolean;
}

export interface Cie10Diagnosis {
  id: string;
  code: string;
  description: string;
  category: string;
}

export interface Medication {
  id: string;
  code: string;
  genericName: string;
  tradeName: string;
  presentation: string;
  unit: string;
  active: boolean;
}

export interface Tariff {
  id: string;
  sedeId: string;
  sedeName: string;
  serviceId: string;
  serviceName: string;
  name: string;
  price: number;
  active: boolean;
}

