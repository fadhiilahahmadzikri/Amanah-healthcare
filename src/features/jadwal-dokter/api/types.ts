export type ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup';
export type SessionStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup' | string;

export interface DoctorDailySession {
  id: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu?: string;
  kuota_pasien: number;
  slot_tersedia: number;
  status_sesi: SessionStatus;
  ruang?: string;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string | null;
}

export interface DoctorSchedule {
  id: string;
  practitioner_id?: string;
  nama_dokter: string;
  spesialisasi: string;
  status_dokter: 'Buka' | 'Penuh' | 'Cuti' | 'Tutup' | string;
  email?: string | null;
  nomor_telepon?: string | null;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar?: string;
  slot_tersedia: number;
  kapasitas_per_hari: number;
  jadwal_hari_ini: string;
  status_jadwal: 'Buka' | 'Penuh' | 'Cuti' | 'Tutup' | string;
  bulan_jadwal?: string;
  monthly_schedule?: MonthlyScheduleDay[];
  sesi_harian?: DoctorDailySession[];
  is_cuti: boolean;
  cuti_reason?: string | null;
  cuti_start?: string | null;
  cuti_end?: string | null;
}

export interface DoctorScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  poli?: string[];
  status?: string[];
  month?: string;
  date?: string;
  sort?: string;
}

export interface DoctorScheduleDetailParams {
  month?: string;
  year?: number;
  date?: string;
}

export interface DoctorScheduleListResponse {
  doctors: DoctorSchedule[];
  total_doctors: number;
  meta?: {
    page: number;
    limit: number;
    total_doctors: number;
    total_pages: number;
  };
}

export interface UpdateDoctorSchedulePayload {
  is_cuti?: boolean;
  cuti_reason?: string | null;
  cuti_start?: string | null;
  cuti_end?: string | null;
  status_dokter?: string;
  status_jadwal?: string;
  jadwal_hari_ini?: string;
  slot_tersedia?: number;
  kapasitas_per_hari?: number;
  ruang_praktik?: string;
  date?: string;
  monthly_schedule?: MonthlyScheduleDay[];
  sesi_harian?: DoctorDailySession[];
}

export interface CreateDoctorSessionPayload {
  schedule_date: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  kuota_pasien: number;
  slot_tersedia: number;
  status_sesi: string;
  ruang?: string;
}

export interface UpdateDoctorSessionPayload {
  nama_sesi?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  kuota_pasien?: number;
  slot_tersedia?: number;
  status_sesi?: string;
  ruang?: string;
}

export interface DeleteDoctorSessionResponse {
  success: boolean;
  message?: string;
  data?: {
    sessionId: string;
  };
}

export interface ClinicUnitOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface MedicalSpecialtyOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface ScheduleStatusOption {
  id: string;
  label: string;
}

export interface DoctorScheduleFilterOptions {
  poliklinik: ClinicUnitOption[];
  spesialisasi: MedicalSpecialtyOption[];
  statuses: ScheduleStatusOption[];
}
