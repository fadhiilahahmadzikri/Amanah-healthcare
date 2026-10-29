export const SCHEDULE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  ON_LEAVE: 'ON_LEAVE',
  PENDING: 'PENDING',
  REPLACEMENT: 'REPLACEMENT'
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.OPEN]: 'Buka',
  [SCHEDULE_STATUS.CLOSED]: 'Tutup',
  [SCHEDULE_STATUS.ON_LEAVE]: 'Cuti',
  [SCHEDULE_STATUS.PENDING]: 'Menunggu Verifikasi',
  [SCHEDULE_STATUS.REPLACEMENT]: 'Pengganti'
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

export function normalizeScheduleStatus(raw?: string | null): ScheduleStatus {
  if (raw === SCHEDULE_STATUS.REPLACEMENT) {
    return SCHEDULE_STATUS.REPLACEMENT;
  }
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
