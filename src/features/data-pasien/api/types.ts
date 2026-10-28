import type { Gender } from '@/constants/gender.constants';
import type { PatientBloodType } from '@/constants/blood-type.constants';
export { UNKNOWN_BLOOD_TYPE, type PatientBloodType } from '@/constants/blood-type.constants';

export type PatientGender = Gender;

export type PatientAccountStatus = 'active' | 'inactive';

export interface Patient {
  id: string; // UUID from database
  patient_id: string; // Medical Record Number (e.g. RM-202610-0004)
  medical_record_number?: string;
  name: string;
  avatarUrl?: string;
  masked_nik: string;
  nik?: string;
  mother_name?: string;
  birth_place?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  gender: PatientGender;
  age: number;
  birth_date: string;
  blood_type: PatientBloodType;
  address: string;
  line1?: string | null;
  province_name?: string | null;
  province_code?: string | null;
  regency_name?: string | null;
  regency_code?: string | null;
  district_name?: string | null;
  district_code?: string | null;
  village_name?: string | null;
  village_code?: string | null;
  emergency_contact?: string;
  allergies?: string[];
  medical_history?: string;
  status: PatientAccountStatus;
  registered_at?: string | null;
  first_login_at?: string | null;
  // Affiliation Paradigm Fields
  is_master?: boolean;
  has_own_account?: boolean;
  affiliate_count?: number;
  relationship_type?: string | null;
  relation_label?: string | null;
  master_patient_id?: string | null;
  master_patient_name?: string | null;
  affiliates?: Patient[];
  // Aggregated metrics derived from backend SSOT
  total_appointments: number;
  completed_visits: number;
  missed_appointments: number;
  cancelled_appointments: number;
  last_visit_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PatientTimelineItem {
  id: string;
  booking_code: string;
  status: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time?: string | null;
  poliklinik_name?: string | null;
  doctor_name?: string | null;
  complaint?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  has_associated_form: boolean;
  associated_form_type?: 'maternal' | 'immunization' | 'general' | null;
}

export interface PatientSummary {
  total: number;
  active: number;
  inactive: number;
  total_appointments?: number;
  completed_visits?: number;
  missed_or_cancelled?: number;
}

export type PatientFilters = {
  page?: number;
  limit?: number;
  gender?: string | string[];
  status?: string | string[];
  search?: string;
  sort?: string;
  bloodType?: string | string[];
  profileType?: string | string[];
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

export type PatientMutationPayload = Partial<Patient> & {
  name: string;
  patient_id?: string;
  medical_record_number?: string;
  nik?: string;
  gender?: PatientGender;
  birth_date?: string;
  phone?: string;
  address?: string;
};
