export type {
  ClinicRoom,
  ClinicRoomOccupantDetails,
  ClosureMetadata
} from '@/server/contracts/schedules/doctor-schedules.dto';

export {
  SHIFT_OPERATIONAL_STATUS,
  SHIFT_OPERATIONAL_LABELS
} from '../constants/schedule-shift.constants';

export type { ShiftOperationalStatus } from '../constants/schedule-shift.constants';

import type { UpdateAdminDoctorSessionPayload } from '@/server/contracts/schedules/doctor-schedules.dto';

export type ScheduleDayStatus = 'OPEN' | 'CLOSED' | 'PENDING';
export type SessionStatus = 'OPEN' | 'CLOSED' | 'PENDING';

export interface DoctorDailySession {
  id: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu?: string;
  pasien_terdaftar?: number;
  status_sesi: SessionStatus;
  ruang?: string;
  roomId?: string;
  ruang_id?: string;
  tanggal?: string;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string | null;
}

export interface DoctorCardPatientPreview {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
}

export interface DoctorSchedule {
  id: string;
  practitioner_id?: string;
  staff_profile_id?: string | null;
  staff_id?: string | null;
  nama_dokter: string;
  spesialisasi: string;
  status_dokter: 'OPEN' | 'CLOSED' | 'PENDING' | string;
  email?: string | null;
  nomor_telepon?: string | null;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar?: string;
  jadwal_hari_ini: string;
  status_jadwal: 'OPEN' | 'CLOSED' | 'PENDING' | string;
  bulan_jadwal?: string;
  monthly_schedule?: MonthlyScheduleDay[];
  sesi_harian?: DoctorDailySession[];
  is_on_leave?: boolean;
  leave_reason?: string | null;
  leave_start?: string | null;
  leave_end?: string | null;
  jadwal_praktik_mendatang?: string;
  total_pasien?: number;
  pasien_preview?: DoctorCardPatientPreview[];
  is_accepting_appointments?: boolean;
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
  is_on_leave?: boolean;
  leave_reason?: string | null;
  leave_start?: string | null;
  leave_end?: string | null;
  status_dokter?: string;
  status_jadwal?: string;
  jadwal_hari_ini?: string;
  ruang_praktik?: string;
  date?: string;
  monthly_schedule?: MonthlyScheduleDay[];
  sesi_harian?: DoctorDailySession[];
}

export type UpdateDoctorSessionPayload = UpdateAdminDoctorSessionPayload;

export interface UpdateDoctorDayByDatePayload {
  status: 'OPEN' | 'CLOSED';
  notes?: string;
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
