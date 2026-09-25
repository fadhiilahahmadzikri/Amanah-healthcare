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
  CLOSED: 'CLOSED'
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.OPEN]: 'Buka',
  [SCHEDULE_STATUS.CLOSED]: 'Tutup'
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
