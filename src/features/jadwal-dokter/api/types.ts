export type {
  ClinicRoom,
  ClinicRoomOccupantDetails,
  ClosureMetadata,
  RescheduleMetadata,
  SlotProjectionMetrics,
  OccupancySlot,
  OccupancyShift,
  RescheduleEligibilityData
} from '@/server/contracts/schedules/doctor-schedules.dto';

export {
  SHIFT_OPERATIONAL_STATUS,
  SHIFT_OPERATIONAL_LABELS,
  AVAILABILITY_STATE,
  TEMPORAL_STATE,
  EFFECTIVE_SLOT_STATUS,
  SLOT_UI_STATUS,
  SLOT_UI_VARIANT,
  SLOT_ACTION_TYPE
} from '../constants/schedule-shift.constants';

export type {
  ShiftOperationalStatus,
  AvailabilityState,
  TemporalState,
  EffectiveSlotStatus,
  SlotUiStatus,
  SlotUiVariant,
  SlotActionType
} from '../constants/schedule-shift.constants';

import type {
  ClosureMetadata,
  RescheduleMetadata,
  SlotProjectionMetrics,
  OccupancyShift,
  CreateAdminDoctorSessionPayload,
  UpdateAdminDoctorSessionPayload
} from '@/server/contracts/schedules/doctor-schedules.dto';

export type ScheduleDayStatus = 'Buka' | 'Terisi' | 'Penuh' | 'Cuti' | 'Tutup' | string;
export type SessionStatus =
  | 'Buka'
  | 'Terisi'
  | 'Penuh'
  | 'Cuti'
  | 'Tutup'
  | 'OPEN'
  | 'OCCUPIED'
  | 'CLOSED'
  | string;

export interface TimelineInterval {
  intervalIndex: number;
  slotIndex?: number;
  intervalId?: string;
  startTime: string;
  endTime: string;
  timeRange?: string;
  status: 'OPEN' | 'OCCUPIED' | 'CLOSED' | 'UNSCHEDULED' | 'EXPIRED' | string;
  displayLabel: 'Buka' | 'Terisi' | 'Tutup' | 'Belum Terjadwal' | 'Waktu Lewat' | string;
  isOccupied: boolean;
  temporalState?: 'PAST' | 'CURRENT' | 'FUTURE' | string;
  availabilityState?: 'UNSCHEDULED' | 'AVAILABLE' | 'OCCUPIED' | 'CLOSED' | string;
  effectiveStatus?: 'AVAILABLE' | 'OCCUPIED' | 'CLOSED' | 'UNSCHEDULED' | 'EXPIRED' | string;
  isSelectable?: boolean;
  appointmentRef?: {
    appointmentId: string;
    queueNumber: number | string;
    status: string;
    patientName?: string;
  } | null;
  closure?: ClosureMetadata | null;
  reschedule?: RescheduleMetadata | null;
  closedReason?: string | null;
}

export interface DoctorDailySession {
  id: string;
  nama_sesi: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu?: string;
  kuota_pasien: number;
  slot_tersedia: number;
  pasien_terdaftar?: number;
  display_slot?: string;
  status_sesi: SessionStatus;
  ruang?: string;
  tanggal?: string;
  is_reschedule_eligible?: boolean;
  reschedule_ineligibility_reason?: string | null;
}

export interface MonthlyScheduleDay {
  day: number;
  date: string;
  status: ScheduleDayStatus;
  notes?: string | null;
  dayStatus?: 'OPEN' | 'CLOSED' | 'CUTI' | 'EMPTY' | string;
  statusLabel?: string;
  badgeVariant?: 'success' | 'danger' | 'warning' | 'neutral' | string;
  activeSessions?: number;
  totalCapacity?: number;
  bookedPatients?: number;
  isClickable?: boolean;
}

export interface DoctorSchedule {
  id: string;
  practitioner_id?: string;
  nama_dokter: string;
  spesialisasi: string;
  status_dokter: 'Buka' | 'Terisi' | 'Penuh' | 'Cuti' | 'Tutup' | string;
  email?: string | null;
  nomor_telepon?: string | null;
  ruang_praktik: string;
  tanggal_praktik?: string;
  avatar?: string;
  slot_tersedia: number;
  kapasitas_per_hari: number;
  jadwal_hari_ini: string;
  status_jadwal: 'Buka' | 'Terisi' | 'Penuh' | 'Cuti' | 'Tutup' | string;
  bulan_jadwal?: string;
  monthly_schedule?: MonthlyScheduleDay[];
  sesi_harian?: DoctorDailySession[];
  timeline_intervals?: TimelineInterval[];
  shifts?: OccupancyShift[];
  context_projections?: OccupancyShift[];
  metrics?: SlotProjectionMetrics;
  summary?: SlotProjectionMetrics;
  is_cuti: boolean;
  cuti_reason?: string | null;
  cuti_start?: string | null;
  cuti_end?: string | null;
  display_akumulasi_slot?: string;
  jadwal_praktik_mendatang?: string;
  slot_terisi_akumulasi?: number;
  slot_kapasitas_akumulasi?: number;
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

export type CreateDoctorSessionPayload = CreateAdminDoctorSessionPayload;

export type UpdateDoctorSessionPayload = UpdateAdminDoctorSessionPayload;

/**
 * @deprecated Sesi jadwal dokter dilarang dihapus oleh admin (403 ADMIN_SCHEDULE_DELETION_PROHIBITED).
 */
export interface DeleteDoctorSessionResponse {
  success: boolean;
  message?: string;
  data?: {
    sessionId: string;
  };
}

export interface RescheduleDoctorSessionPayload {
  targetDate: string;
  targetStartTime: string;
  targetScheduleContextId?: string;
  targetShift?: string;
  targetRoomId?: string;
  notes?: string;
  reason?: string;
  rescheduleActiveAppointments?: boolean;
}

export interface UpdateDoctorDayByDatePayload {
  status: 'OPEN' | 'CLOSED' | 'Buka' | 'Tutup' | string;
  notes?: string;
}

export interface UpdateDoctorDurationPayload {
  consultationDurationMinutes: number;
  startPrecisionMinutes?: number;
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
