import type { Patient, PatientSummary } from '@/constants/mock-api-patients';

export type { Patient, PatientSummary };

export type PatientFilters = {
  page?: number;
  limit?: number;
  gender?: string | string[];
  status?: string | string[];
  search?: string;
  sort?: string;
};

export type PatientsResponse = {
  success: boolean;
  time: string;
  total_patients: number;
  offset: number;
  limit: number;
  patients: Patient[];
  summary: PatientSummary;
};

export type PatientDetailResponse = {
  success: boolean;
  patient: Patient | null;
  message?: string;
};

export type PatientMutationPayload = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
