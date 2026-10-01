/**
 * Centralized Canonical Constants for Doctor Schedules
 * Single Source of Truth aligning directly with PostgreSQL enums:
 * - `staff_shift`: ('early_morning', 'morning', 'afternoon', 'night')
 * - `schedule_status`: ('open', 'closed')
 * Zero Magic Strings.
 */

export const SCHEDULE_SHIFT = {
  DINI_HARI: 'DINI_HARI',
  PAGI: 'PAGI',
  SIANG: 'SIANG',
  MALAM: 'MALAM'
} as const;

export type ScheduleShift = (typeof SCHEDULE_SHIFT)[keyof typeof SCHEDULE_SHIFT];

export const ALL_SCHEDULE_SHIFTS: readonly ScheduleShift[] = [
  SCHEDULE_SHIFT.DINI_HARI,
  SCHEDULE_SHIFT.PAGI,
  SCHEDULE_SHIFT.SIANG,
  SCHEDULE_SHIFT.MALAM
] as const;

export const SCHEDULE_SHIFT_LABELS: Record<ScheduleShift, string> = {
  [SCHEDULE_SHIFT.DINI_HARI]: 'Dini Hari',
  [SCHEDULE_SHIFT.PAGI]: 'Pagi',
  [SCHEDULE_SHIFT.SIANG]: 'Siang',
  [SCHEDULE_SHIFT.MALAM]: 'Malam'
} as const;

export const DB_STAFF_SHIFT_MAP: Record<string, ScheduleShift> = {
  early_morning: SCHEDULE_SHIFT.DINI_HARI,
  morning: SCHEDULE_SHIFT.PAGI,
  afternoon: SCHEDULE_SHIFT.SIANG,
  night: SCHEDULE_SHIFT.MALAM
} as const;

export const SCHEDULE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CUTI: 'CUTI',
  OCCUPIED: 'OCCUPIED'
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.OPEN]: 'Buka',
  [SCHEDULE_STATUS.CLOSED]: 'Tutup',
  [SCHEDULE_STATUS.CUTI]: 'Cuti',
  [SCHEDULE_STATUS.OCCUPIED]: 'Penuh'
} as const;

export const SHIFT_OPERATIONAL_STATUS = {
  ACTIVE: 'ACTIVE',
  NO_PRACTICE: 'NO_PRACTICE',
  CLOSED: 'CLOSED',
  CUTI: 'CUTI'
} as const;

export type ShiftOperationalStatus =
  (typeof SHIFT_OPERATIONAL_STATUS)[keyof typeof SHIFT_OPERATIONAL_STATUS];

export const SHIFT_OPERATIONAL_LABELS: Record<ShiftOperationalStatus, string> = {
  [SHIFT_OPERATIONAL_STATUS.ACTIVE]: 'Aktif',
  [SHIFT_OPERATIONAL_STATUS.NO_PRACTICE]: 'Tidak Ada Praktik',
  [SHIFT_OPERATIONAL_STATUS.CLOSED]: 'Praktik Ditutup',
  [SHIFT_OPERATIONAL_STATUS.CUTI]: 'Cuti Dokter'
} as const;

export const AVAILABILITY_STATE = {
  UNSCHEDULED: 'UNSCHEDULED',
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  CLOSED: 'CLOSED'
} as const;

export type AvailabilityState =
  (typeof AVAILABILITY_STATE)[keyof typeof AVAILABILITY_STATE];

export const TEMPORAL_STATE = {
  PAST: 'PAST',
  CURRENT: 'CURRENT',
  FUTURE: 'FUTURE'
} as const;

export type TemporalState =
  (typeof TEMPORAL_STATE)[keyof typeof TEMPORAL_STATE];

export const EFFECTIVE_SLOT_STATUS = {
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
  OCCUPIED: 'OCCUPIED',
  AVAILABLE: 'AVAILABLE',
  UNSCHEDULED: 'UNSCHEDULED'
} as const;

export type EffectiveSlotStatus =
  (typeof EFFECTIVE_SLOT_STATUS)[keyof typeof EFFECTIVE_SLOT_STATUS];

export const SLOT_UI_STATUS = {
  UNSCHEDULED_PAST: 'UNSCHEDULED_PAST',
  UNSCHEDULED: 'UNSCHEDULED',
  COMPLETED: 'COMPLETED',
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  OCCUPIED_BY_OTHER: 'OCCUPIED_BY_OTHER',
  RESCHEDULED: 'RESCHEDULED',
  CLOSED_LEAVE: 'CLOSED_LEAVE',
  CLOSED_CLINIC: 'CLOSED_CLINIC'
} as const;

export type SlotUiStatus = (typeof SLOT_UI_STATUS)[keyof typeof SLOT_UI_STATUS];

export const SLOT_UI_VARIANT = {
  NEUTRAL_DISABLED: 'neutral_disabled',
  DASHED_BORDER: 'dashed_border',
  MUTED_GRAY: 'muted_gray',
  SUCCESS_GREEN: 'success_green',
  INFO_BLUE: 'info_blue',
  PURPLE_OTHER: 'purple_other',
  WARNING_AMBER: 'warning_amber',
  SKY_BADGE: 'sky_badge',
  DANGER_RED: 'danger_red'
} as const;

export type SlotUiVariant = (typeof SLOT_UI_VARIANT)[keyof typeof SLOT_UI_VARIANT];

export const SLOT_ACTION_TYPE = {
  NONE: 'NONE',
  ADD_SESSION: 'ADD_SESSION',
  VIEW_SESSION: 'VIEW_SESSION',
  VIEW_PATIENTS: 'VIEW_PATIENTS',
  VIEW_OCCUPANCY_CONFLICT: 'VIEW_OCCUPANCY_CONFLICT'
} as const;

export type SlotActionType =
  (typeof SLOT_ACTION_TYPE)[keyof typeof SLOT_ACTION_TYPE];

export const SCHEDULE_MUTATION_NOTES = {
  CLOSE_SESSION: 'Tutup sesi operasional',
  OPEN_SESSION: 'Buka kembali sesi operasional'
} as const;

export const SCHEDULE_QUERY_KEYS = {
  ALL: 'doctor-schedules',
  SCHEDULES: 'schedules',
  PRACTITIONERS: 'clinical-practitioners',
  APPOINTMENTS: 'appointments',
  SLOT_AVAILABILITY: 'schedule-slot-availability',
  OCCUPANCY_OVERVIEW: 'schedule-occupancy-overview'
} as const;

export const SCHEDULE_UNAVAILABLE_REASONS = {
  PAST: 'Sudah Selesai',
  TIME_EXHAUSTED: 'Waktu Habis',
  FULL: 'Penuh',
  FULL_OR_EXHAUSTED: 'Penuh / Waktu Habis'
} as const;

export type ScheduleUnavailableReason =
  (typeof SCHEDULE_UNAVAILABLE_REASONS)[keyof typeof SCHEDULE_UNAVAILABLE_REASONS];

export const CANONICAL_TO_API_SHIFT: Record<ScheduleShift, string> = {
  [SCHEDULE_SHIFT.DINI_HARI]: 'dini_hari',
  [SCHEDULE_SHIFT.PAGI]: 'pagi',
  [SCHEDULE_SHIFT.SIANG]: 'siang',
  [SCHEDULE_SHIFT.MALAM]: 'malam'
} as const;

export const SCHEDULE_TIME_LABELS = {
  TIMEZONE: 'WIB',
  AUTOMATIC: 'Otomatis',
  SELECT_TIME: 'Pilih Jam Mulai',
  LOADING_SLOTS: 'Memuat slot...',
  SELECT_ROOM: 'Pilih Ruangan',
  CHOOSE_DATE: 'Pilih tanggal',
  DASH: '-'
} as const;

export const SCHEDULE_BUTTON_LABELS = {
  ADD_MORE_SLOT: '+ Add More Slot',
  CHANGE_DATE: 'Ubah Tanggal',
  CANCEL: 'Batal',
  SAVE_SCHEDULE: 'Simpan Jadwal'
} as const;

export const SCHEDULE_OCCUPANT_LABELS = {
  OTHER_DOCTOR: 'Dokter Lain'
} as const;

export const SCHEDULE_TOAST_MESSAGES = {
  SELECT_PREVIOUS_SLOT_FIRST: 'Tentukan jam mulai slot sebelumnya terlebih dahulu',
  SHIFT_TIME_EXHAUSTED: 'Sesi sudah terisi hingga batas shift',
  SESSIONS_ADDED_SUCCESS: (count: number, doctorName: string) =>
    `${count} sesi praktik berhasil ditambahkan untuk ${doctorName}.`,
  SESSIONS_ADDED_ERROR: 'Gagal menambahkan sesi praktik dokter'
} as const;

export const SCHEDULE_RESCHEDULE_MESSAGES = {
  INELIGIBLE_TITLE: 'Jadwal Tidak Memenuhi Syarat:',
  DEFAULT_CONFLICT: 'Terjadi bentrok jadwal atau ruangan sudah terpakai pada jam tersebut.'
} as const;

export const SCHEDULE_SHIFT_BOUNDARIES: Record<
  ScheduleShift,
  {
    startTime: string;
    endTime: string;
    startHour: number;
    endHour: number;
    timeRange: string;
    totalSlots: number;
  }
> = {
  [SCHEDULE_SHIFT.DINI_HARI]: {
    startTime: '00:00',
    endTime: '06:00',
    startHour: 0,
    endHour: 6,
    timeRange: '00:00 - 06:00 WIB',
    totalSlots: 12
  },
  [SCHEDULE_SHIFT.PAGI]: {
    startTime: '06:00',
    endTime: '12:00',
    startHour: 6,
    endHour: 12,
    timeRange: '06:00 - 12:00 WIB',
    totalSlots: 12
  },
  [SCHEDULE_SHIFT.SIANG]: {
    startTime: '12:00',
    endTime: '18:00',
    startHour: 12,
    endHour: 18,
    timeRange: '12:00 - 18:00 WIB',
    totalSlots: 12
  },
  [SCHEDULE_SHIFT.MALAM]: {
    startTime: '18:00',
    endTime: '24:00',
    startHour: 18,
    endHour: 24,
    timeRange: '18:00 - 24:00 WIB',
    totalSlots: 12
  }
} as const;

export function normalizeScheduleStatus(raw?: string | null): ScheduleStatus {
  if (!raw) return SCHEDULE_STATUS.OPEN;
  const clean = raw.trim().toUpperCase();
  if (clean === SCHEDULE_STATUS.CLOSED || clean === 'TUTUP') {
    return SCHEDULE_STATUS.CLOSED;
  }
  return SCHEDULE_STATUS.OPEN;
}

export function normalizeScheduleShift(raw?: string | null): ScheduleShift {
  if (!raw) return SCHEDULE_SHIFT.PAGI;
  const clean = raw.trim().toUpperCase();

  // If time format HH:mm or HH.mm (e.g. "00:30", "00:30 WIB", "08:00", "14:15", "19:00")
  const timeMatch = clean.match(/^(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    if (hour >= 0 && hour < 6) return SCHEDULE_SHIFT.DINI_HARI;
    if (hour >= 6 && hour < 12) return SCHEDULE_SHIFT.PAGI;
    if (hour >= 12 && hour < 18) return SCHEDULE_SHIFT.SIANG;
    if (hour >= 18 && hour < 24) return SCHEDULE_SHIFT.MALAM;
  }

  if (clean === SCHEDULE_SHIFT.DINI_HARI || clean === 'EARLY_MORNING' || clean.includes('DINI')) {
    return SCHEDULE_SHIFT.DINI_HARI;
  }
  if (clean === SCHEDULE_SHIFT.PAGI || clean === 'MORNING') {
    return SCHEDULE_SHIFT.PAGI;
  }
  if (
    clean === SCHEDULE_SHIFT.SIANG ||
    clean === 'AFTERNOON' ||
    clean.includes('SORE') ||
    clean.includes('SIANG')
  ) {
    return SCHEDULE_SHIFT.SIANG;
  }
  if (clean === SCHEDULE_SHIFT.MALAM || clean === 'NIGHT') {
    return SCHEDULE_SHIFT.MALAM;
  }
  return SCHEDULE_SHIFT.PAGI;
}

export function resolveShiftFromTime(timeStr?: string | null): ScheduleShift {
  return normalizeScheduleShift(timeStr);
}
