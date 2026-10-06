import type { AppointmentStatus } from '../api/types';

export interface StatusPresentationConfig {
  label: string;
  description: string;
  pillBg: string;
  pillBorder: string;
  textGradient: string;
  dotGradient: string;
  hex: string;
}

export const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, StatusPresentationConfig> = {
  WAITING: {
    label: 'Menunggu',
    description: 'Pasien berada di ruang tunggu antrean pemeriksaan',
    pillBg: 'bg-warning-subtle',
    pillBorder: 'border-warning-border',
    textGradient: 'text-warning font-bold',
    dotGradient: 'bg-warning',
    hex: 'var(--warning)'
  },
  IN_SERVICE: {
    label: 'Sedang Diperiksa',
    description: 'Pasien sedang dalam ruang konsultasi dengan dokter',
    pillBg: 'bg-primary-subtle',
    pillBorder: 'border-border-accent',
    textGradient: 'text-primary-bright font-bold',
    dotGradient: 'bg-primary-bright',
    hex: 'var(--primary-bright, var(--primary))'
  },
  COMPLETED: {
    label: 'Selesai',
    description: 'Pemeriksaan selesai, rekam medis telah diperbarui',
    pillBg: 'bg-status-completed-subtle',
    pillBorder: 'border-status-completed-border',
    textGradient: 'text-status-completed font-bold',
    dotGradient: 'bg-status-completed',
    hex: 'var(--status-completed)'
  },
  CANCELLED: {
    label: 'Dibatalkan',
    description: 'Janji temu dibatalkan oleh pasien atau pihak klinik',
    pillBg: 'bg-destructive-subtle',
    pillBorder: 'border-destructive-border',
    textGradient: 'text-destructive font-bold',
    dotGradient: 'bg-destructive',
    hex: 'var(--destructive)'
  },
  LATE: {
    label: 'Terlambat',
    description: 'Pasien belum hadir melebihi batas toleransi waktu',
    pillBg: 'bg-slate-100 dark:bg-slate-800/60',
    pillBorder: 'border-slate-300 dark:border-slate-700',
    textGradient: 'text-slate-700 dark:text-slate-200',
    dotGradient: 'bg-slate-400 dark:bg-slate-500',
    hex: '#64748B'
  }
};

export const APPOINTMENT_STATUS_OPTIONS = (
  Object.keys(APPOINTMENT_STATUS_MAP) as AppointmentStatus[]
).map((status) => ({
  value: status,
  label: APPOINTMENT_STATUS_MAP[status].label,
  description: APPOINTMENT_STATUS_MAP[status].description
}));

export function normalizeToAppointmentStatus(status?: string | null): AppointmentStatus {
  if (!status) return 'WAITING';
  const raw = status.toUpperCase().replace(/\s+/g, '_');
  if (raw === 'IN_SERVICE' || raw === 'SEDANG_PERIKSA' || raw === 'SEDANG_DIPERIKSA') {
    return 'IN_SERVICE';
  }
  if (raw === 'COMPLETED' || raw === 'SELESAI') {
    return 'COMPLETED';
  }
  if (
    raw === 'CANCELLED' ||
    raw === 'BATAL' ||
    raw === 'TIDAK_ADA_DOKTER' ||
    raw === 'TIDAK_HADIR'
  ) {
    return 'CANCELLED';
  }
  if (raw === 'LATE' || raw === 'TERLAMBAT' || raw === 'NO_SHOW') {
    return 'LATE';
  }
  return 'WAITING';
}

export function getAppointmentStatusConfig(
  status?: AppointmentStatus | string | null
): StatusPresentationConfig {
  const canonical = normalizeToAppointmentStatus(status);
  return APPOINTMENT_STATUS_MAP[canonical];
}
