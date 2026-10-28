export const CANONICAL_ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  LEAVE: 'leave',
  ABSENT: 'absent',
  MISSED: 'missed',
} as const;

export type CanonicalAttendanceStatus =
  (typeof CANONICAL_ATTENDANCE_STATUS)[keyof typeof CANONICAL_ATTENDANCE_STATUS];

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  [CANONICAL_ATTENDANCE_STATUS.PRESENT]: 'Hadir',
  [CANONICAL_ATTENDANCE_STATUS.LATE]: 'Terlambat',
  [CANONICAL_ATTENDANCE_STATUS.LEAVE]: 'Izin / Cuti',
  [CANONICAL_ATTENDANCE_STATUS.ABSENT]: 'Tidak Hadir',
  [CANONICAL_ATTENDANCE_STATUS.MISSED]: 'Tidak Hadir',
};

export const CANONICAL_ATTENDANCE_SHIFTS = {
  EARLY_MORNING: 'early_morning',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night',
} as const;

export type CanonicalAttendanceShift =
  (typeof CANONICAL_ATTENDANCE_SHIFTS)[keyof typeof CANONICAL_ATTENDANCE_SHIFTS];

export const ATTENDANCE_SHIFT_LABELS: Record<string, string> = {
  [CANONICAL_ATTENDANCE_SHIFTS.EARLY_MORNING]: 'Dini Hari',
  [CANONICAL_ATTENDANCE_SHIFTS.MORNING]: 'Pagi',
  [CANONICAL_ATTENDANCE_SHIFTS.AFTERNOON]: 'Siang',
  [CANONICAL_ATTENDANCE_SHIFTS.NIGHT]: 'Malam',
};
