export type ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti';
export type SessionStatus = 'Buka' | 'Penuh' | 'Cuti';

export interface DoctorDailySession {
  id: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu: string;
  kuota_pasien: number;
  slot_tersedia: number;
  status_sesi: SessionStatus;
  ruang?: string;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string;
}

export interface DoctorSchedule {
  id: string;
  nama_dokter: string;
  spesialisasi: string;
  status_dokter: 'Buka' | 'Penuh' | 'Cuti' | string;
  email: string;
  nomor_telepon: string;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar: string;
  slot_tersedia: number;
  kapasitas_per_hari: number;
  jadwal_hari_ini: string;
  status_jadwal: 'Buka' | 'Penuh' | 'Cuti' | string;
  bulan_jadwal: string;
  monthly_schedule: MonthlyScheduleDay[];
  sesi_harian: DoctorDailySession[];
  is_cuti: boolean;
  cuti_reason?: string;
  cuti_start?: string;
  cuti_end?: string;
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

export interface DoctorScheduleListResponse {
  doctors: DoctorSchedule[];
  total_doctors: number;
}
