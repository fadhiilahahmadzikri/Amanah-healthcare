export type PatientGender = 'male' | 'female' | 'Laki-laki' | 'Perempuan';

export type PatientBloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'A'
  | 'B'
  | 'AB'
  | 'O'
  | 'Belum Tahu'
  | 'a'
  | 'b'
  | 'ab'
  | 'o'
  | 'unknown';

export type PatientAccountStatus = 'active' | 'inactive';

export interface Patient {
  id: string; // UUID from database
  patient_id: string; // Medical Record Number (e.g. RM-202610-0004)
  name: string;
  avatar?: string;
  avatarUrl?: string;
  masked_nik: string;
  nik?: string;
  nik_ktp?: string;
  nama_ibu_kandung?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  pekerjaan?: string;
  domisili?: string;
  nomor_telepon_wa?: string;
  email_pasien?: string;
  phone?: string;
  email?: string;
  gender: PatientGender;
  age: number;
  birth_date: string;
  blood_type: PatientBloodType;
  address: string;
  provinsi?: string | null;
  provinsi_id?: string | null;
  kabupaten?: string | null;
  kabupaten_id?: string | null;
  kecamatan?: string | null;
  kecamatan_id?: string | null;
  kelurahan?: string | null;
  kelurahan_id?: string | null;
  alamat_detail?: string | null;
  emergency_contact?: string;
  allergies?: string[];
  medical_history?: string;
  account_status: PatientAccountStatus;
  tanggal_registrasi_akun?: string | null;
  login_pertama_kali?: string | null;
  kunjungan_terakhir?: string | null;
  total_kunjungan?: number;
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
  nik?: string;
  gender?: PatientGender;
  birth_date?: string;
  phone?: string;
  address?: string;
};
