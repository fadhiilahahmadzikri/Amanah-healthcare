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
  ON_LEAVE: 'ON_LEAVE',
  PENDING: 'PENDING'
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.OPEN]: 'Buka',
  [SCHEDULE_STATUS.CLOSED]: 'Tutup',
  [SCHEDULE_STATUS.ON_LEAVE]: 'Cuti',
  [SCHEDULE_STATUS.PENDING]: 'Menunggu Verifikasi'
} as const;

export const SHIFT_OPERATIONAL_STATUS = {
  ACTIVE: 'ACTIVE',
  NO_PRACTICE: 'NO_PRACTICE',
  CLOSED: 'CLOSED',
  ON_LEAVE: 'ON_LEAVE'
} as const;

export type ShiftOperationalStatus =
  (typeof SHIFT_OPERATIONAL_STATUS)[keyof typeof SHIFT_OPERATIONAL_STATUS];

export const SHIFT_OPERATIONAL_LABELS: Record<ShiftOperationalStatus, string> = {
  [SHIFT_OPERATIONAL_STATUS.ACTIVE]: 'Aktif',
  [SHIFT_OPERATIONAL_STATUS.NO_PRACTICE]: 'Tidak Ada Praktik',
  [SHIFT_OPERATIONAL_STATUS.CLOSED]: 'Praktik Ditutup',
  [SHIFT_OPERATIONAL_STATUS.ON_LEAVE]: 'Cuti Dokter'
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
  if (raw === SCHEDULE_STATUS.ON_LEAVE) {
    return SCHEDULE_STATUS.ON_LEAVE;
  }
  if (raw === SCHEDULE_STATUS.CLOSED) {
    return SCHEDULE_STATUS.CLOSED;
  }
  if (raw === SCHEDULE_STATUS.PENDING) {
    return SCHEDULE_STATUS.PENDING;
  }
  return SCHEDULE_STATUS.OPEN;
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

export const FRIENDLY_SESSION_NAME_MAP: Record<string, string> = {
  early_morning: 'Sesi Dini Hari',
  morning: 'Sesi Pagi',
  afternoon: 'Sesi Siang',
  night: 'Sesi Malam',
  DINI_HARI: 'Sesi Dini Hari',
  PAGI: 'Sesi Pagi',
  SIANG: 'Sesi Siang',
  MALAM: 'Sesi Malam',
  dini_hari: 'Sesi Dini Hari',
  pagi: 'Sesi Pagi',
  siang: 'Sesi Siang',
  malam: 'Sesi Malam'
};

export function formatFriendlySessionName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed in FRIENDLY_SESSION_NAME_MAP) {
    return FRIENDLY_SESSION_NAME_MAP[trimmed];
  }
  if (trimmed.startsWith('Sesi ')) {
    return trimmed;
  }
  return `Sesi ${trimmed}`;
}
