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
  isOnLeave: 'isOnLeave'
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.OPEN]: 'Buka',
  [SCHEDULE_STATUS.CLOSED]: 'Tutup',
  [SCHEDULE_STATUS.isOnLeave]: 'Cuti'
} as const;

export const SHIFT_OPERATIONAL_STATUS = {
  ACTIVE: 'ACTIVE',
  NO_PRACTICE: 'NO_PRACTICE',
  CLOSED: 'CLOSED',
  isOnLeave: 'isOnLeave'
} as const;

export type ShiftOperationalStatus =
  (typeof SHIFT_OPERATIONAL_STATUS)[keyof typeof SHIFT_OPERATIONAL_STATUS];

export const SHIFT_OPERATIONAL_LABELS: Record<ShiftOperationalStatus, string> = {
  [SHIFT_OPERATIONAL_STATUS.ACTIVE]: 'Aktif',
  [SHIFT_OPERATIONAL_STATUS.NO_PRACTICE]: 'Tidak Ada Praktik',
  [SHIFT_OPERATIONAL_STATUS.CLOSED]: 'Praktik Ditutup',
  [SHIFT_OPERATIONAL_STATUS.isOnLeave]: 'isOnLeave Dokter'
} as const;

export const SCHEDULE_MUTATION_NOTES = {
  CLOSE_SESSION: 'Tutup sesi operasional',
  OPEN_SESSION: 'Buka kembali sesi operasional'
} as const;

export const SCHEDULE_QUERY_KEYS = {
  ALL: 'doctor-schedules',
  SCHEDULES: 'schedules',
  PRACTITIONERS: 'clinical-practitioners',
  APPOINTMENTS: 'appointments'
} as const;

export const CANONICAL_TO_API_SHIFT: Record<ScheduleShift, string> = {
  [SCHEDULE_SHIFT.DINI_HARI]: 'dini_hari',
  [SCHEDULE_SHIFT.PAGI]: 'pagi',
  [SCHEDULE_SHIFT.SIANG]: 'siang',
  [SCHEDULE_SHIFT.MALAM]: 'malam'
} as const;

export function normalizeScheduleStatus(raw?: string | null): ScheduleStatus {
  return raw?.trim().toUpperCase() === SCHEDULE_STATUS.CLOSED
    ? SCHEDULE_STATUS.CLOSED
    : SCHEDULE_STATUS.OPEN;
}

export function normalizeScheduleShift(raw?: string | null): ScheduleShift {
  if (!raw) return SCHEDULE_SHIFT.PAGI;
  const key = raw.trim();
  if (key in SCHEDULE_SHIFT) {
    return SCHEDULE_SHIFT[key as keyof typeof SCHEDULE_SHIFT];
  }
  return DB_STAFF_SHIFT_MAP[key] ?? SCHEDULE_SHIFT.PAGI;
}

export function resolveShiftFromTime(timeStr?: string | null): ScheduleShift {
  if (!timeStr) return SCHEDULE_SHIFT.PAGI;
  const hour = Number.parseInt(timeStr.split(':')[0] ?? '', 10);
  if (hour < 6) return SCHEDULE_SHIFT.DINI_HARI;
  if (hour < 12) return SCHEDULE_SHIFT.PAGI;
  if (hour < 18) return SCHEDULE_SHIFT.SIANG;
  return SCHEDULE_SHIFT.MALAM;
}
