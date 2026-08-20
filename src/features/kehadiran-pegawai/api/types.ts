export type StaffCategory = 'Staf' | 'Dokter';
export type AttendanceStatus = 'Hadir' | 'Tidak Hadir';
export type WorkShift = 'Pagi' | 'Siang' | 'Malam';

export interface StaffAttendance {
  id: string;
  id_staf: string;
  nama_staf: string;
  avatar?: string;
  kategori: StaffCategory;
  tanggal_presensi: string;
  waktu_presensi: string;
  waktu: string;
  status: AttendanceStatus;
  shift: WorkShift;
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
  status_presensi: string;
  qr_code_identifier: string;
  qr_context: string;
  qr_validity: string;
  rotation_seconds: number;
}

export interface AttendanceFilterParams {
  date?: string | null;
  shift?: string | null;
  status?: string | null;
  category?: string | null;
  search?: string | null;
  page: number;
  limit: number;
}

export interface AttendanceListResponse {
  records: StaffAttendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: AttendanceMetrics;
  qrConfig: QRPresenceConfig;
}
