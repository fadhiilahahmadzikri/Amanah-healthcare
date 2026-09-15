export type PatientGender = 'Laki-laki' | 'Perempuan';

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
  | 'Belum Tahu';

export type PatientAccountStatus = 'Aktif' | 'Nonaktif' | 'AKTIF' | 'NONAKTIF';

export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  avatar: string;
  nik: string;
  nik_ktp?: string;
  nama_ibu_kandung?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  pekerjaan?: string;
  domisili?: string;
  nomor_telepon_wa?: string;
  email_pasien?: string;
  phone: string;
  email: string;
  gender: PatientGender;
  age: number;
  birth_date: string;
  blood_type: PatientBloodType;
  address: string;
  emergency_contact: string;
  allergies: string[];
  medical_history: string;
  account_status: PatientAccountStatus;
  tanggal_registrasi_akun?: string;
  login_pertama_kali?: string;
  kunjungan_terakhir?: string;
  total_kunjungan?: number;
  created_at: string;
  updated_at: string;
}

export interface PatientSummary {
  total: number;
  active: number;
  inactive: number;
}

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
