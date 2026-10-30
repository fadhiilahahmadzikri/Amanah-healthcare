import type {
  CanonicalAttendanceStatus,
  CanonicalAttendanceShift
} from '../constants/attendance-status.constants';

export type StaffCategory = string;
export type AttendanceStatus = CanonicalAttendanceStatus | (string & {});
export type WorkShift = CanonicalAttendanceShift | (string & {});

export const ATTENDANCE_ACTIONS = {
  CHECK_IN: 'check_in',
  MANUAL_CHECK_IN: 'manual_check_in',
  CHECK_OUT: 'check_out'
} as const;

export type AttendanceAction = (typeof ATTENDANCE_ACTIONS)[keyof typeof ATTENDANCE_ACTIONS];

export interface FilterOption {
  label: string;
  value: string;
}

export interface AvailableAttendanceFilters {
  shifts: FilterOption[];
  statuses: FilterOption[];
  categories: FilterOption[];
}

export interface StaffAttendance {
  id: string;
  id_staf: string;
  staffProfileId?: string;
  nama_staf: string;
  avatar?: string;
  kategori: StaffCategory;
  roleId?: string;
  roleCode?: string;
  roleName?: string;
  isClinical?: boolean;
  tanggal_presensi: string;
  waktu_presensi: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status: AttendanceStatus;
  shift: WorkShift;
  shiftLabel?: string;
  sessionName?: string;
  validatedDurationHours?: number;
  lateMinutes?: number | null;
  isReplacement?: boolean;
  replacementOpportunityId?: string | null;
  replacedStaffName?: string | null;
  replacedStaffCode?: string | null;
  isEarlyDeparture?: boolean;
  notes?: string | null;
}

export interface MetricSparklinePoint {
  label: string;
  value: number;
}

export interface AttendanceMetrics {
  total_staf: number;
  staf_hadir: number;
  staf_tidak_hadir: number;
  tingkat_kehadiran: number;
  perubahan_total_staf: number;
  perubahan_staf_hadir: number;
  perubahan_staf_tidak_hadir: number;
  perubahan_tingkat_kehadiran: number;
  sparkline_total_staf: MetricSparklinePoint[];
  sparkline_staf_hadir: MetricSparklinePoint[];
  sparkline_staf_tidak_hadir: MetricSparklinePoint[];
  sparkline_tingkat_kehadiran: MetricSparklinePoint[];
}

export interface QRPresenceConfig {
  status: string;
  isActive: boolean;
  status_presensi?: string;
  qr_code_identifier: string;
  qr_context: string;
  qr_validity: string;
  rotation_seconds: number;
  validUntil?: string;
}

export interface AttendanceFilterParams {
  date?: string | null;
  shift?: string | null;
  status?: string | null;
  category?: string | null;
  search?: string | null;
}

export interface AttendanceListResponse {
  records: StaffAttendance[];
  total: number;
  summary: AttendanceMetrics;
  qrConfig: QRPresenceConfig;
  availableFilters?: AvailableAttendanceFilters;
}

export interface AttendanceExportCandidate {
  id: string;
  staffCode: string;
  fullName: string;
  avatarUrl?: string | null;
  roleId?: string;
  roleCode?: string;
  roleName?: string;
  isClinical?: boolean;
  staffType?: string;
  positionTitle?: string | null;
  specialtyName?: string | null;
  totalAttendance: number;
}

export interface AttendanceExportCandidatesResponse {
  candidates: AttendanceExportCandidate[];
  period: {
    month: string;
    startDate: string;
    endDate: string;
  };
}
