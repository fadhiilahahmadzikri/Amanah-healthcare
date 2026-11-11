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

export const RECONCILE_DECISION = {
  APPROVED_OVERTIME: 'approved_overtime',
  REJECTED_OVERTIME: 'rejected_overtime',
} as const;

export type ReconcileDecision =
  (typeof RECONCILE_DECISION)[keyof typeof RECONCILE_DECISION];

export const MILESTONE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  LEAVE: 'leave',
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
} as const;

export type MilestoneStatus =
  (typeof MILESTONE_STATUS)[keyof typeof MILESTONE_STATUS];

export const MILESTONE_STATUS_LABELS: Record<string, string> = {
  [MILESTONE_STATUS.PRESENT]: 'Hadir',
  [MILESTONE_STATUS.LATE]: 'Terlambat',
  [MILESTONE_STATUS.ABSENT]: 'Tidak Hadir',
  [MILESTONE_STATUS.LEAVE]: 'Izin / Cuti',
  [MILESTONE_STATUS.ONGOING]: 'Sedang Berjalan',
  [MILESTONE_STATUS.UPCOMING]: 'Belum Dimulai',
};


