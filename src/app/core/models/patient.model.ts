export interface Patient {
  id: string;
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F' | 'OTHER';
  email?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  isActive: boolean;
}

export interface CreatePatientDto {
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

export interface PatientConsent {
  id: string;
  patientId: string;
  type: string;
  fileUrl?: string;
  signedAt?: string;
}

export interface ClinicalProfile {
  id: string;
  patientId: string;
  allergies?: string;
  personalHistory?: string;
  familyHistory?: string;
  surgicalHistory?: string;
  currentMeds?: string;
}