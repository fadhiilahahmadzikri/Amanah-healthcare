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

export type CanonicalAttendanceShift = string;


