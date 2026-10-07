export const APPOINTMENT_STATUS = {
  BOOKED: 'BOOKED',
  WAITING: 'WAITING',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  LATE: 'LATE'
} as const;

export type CanonicalAppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export type DomainAppointmentStatus = 'WAITING' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'LATE';

export interface StatusStyling {
  readonly pillBg: string;
  readonly pillBorder: string;
  readonly textGradient: string;
  readonly dotGradient: string;
  readonly hex: string;
}

export interface StatusDescriptorInit {
  readonly code: CanonicalAppointmentStatus;
  readonly domainStatus: DomainAppointmentStatus;
  readonly label: string;
  readonly description: string;
  readonly uiStatus: string;
  readonly badge: string;
  readonly queueDisplayStatus: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  readonly isTerminal: boolean;
  readonly isInService: boolean;
  readonly isWaiting: boolean;
  readonly isBooked?: boolean;
  readonly styling: StatusStyling;
}

export class AppointmentStatusDescriptor {
  readonly code: CanonicalAppointmentStatus;
  readonly domainStatus: DomainAppointmentStatus;
  readonly label: string;
  readonly description: string;
  readonly uiStatus: string;
  readonly badge: string;
  readonly queueDisplayStatus: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  readonly isTerminal: boolean;
  readonly isInService: boolean;
  readonly isWaiting: boolean;
  readonly isBooked: boolean;
  readonly styling: StatusStyling;

  constructor(init: StatusDescriptorInit) {
    this.code = init.code;
    this.domainStatus = init.domainStatus;
    this.label = init.label;
    this.description = init.description;
    this.uiStatus = init.uiStatus;
    this.badge = init.badge;
    this.queueDisplayStatus = init.queueDisplayStatus;
    this.isTerminal = init.isTerminal;
    this.isInService = init.isInService;
    this.isWaiting = init.isWaiting;
    this.isBooked = init.isBooked ?? false;
    this.styling = init.styling;
  }

  static from(raw?: string | null): AppointmentStatusDescriptor {
    const code = normalizeAppointmentStatus(raw);
    return APPOINTMENT_STATUS_REGISTRY[code];
  }
}

export type StatusDescriptor = AppointmentStatusDescriptor;

export const APPOINTMENT_STATUS_REGISTRY: Record<
  CanonicalAppointmentStatus,
  AppointmentStatusDescriptor
> = {
  [APPOINTMENT_STATUS.BOOKED]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.BOOKED,
    domainStatus: 'WAITING',
    label: 'Sudah Buat Janji',
    description: 'Pasien telah menjadwalkan janji temu dan menunggu konfirmasi kehadiran',
    uiStatus: 'Sudah Buat Janji',
    badge: 'Booked',
    queueDisplayStatus: 'WAITING',
    isTerminal: false,
    isInService: false,
    isWaiting: false,
    isBooked: true,
    styling: {
      pillBg: 'bg-primary-subtle',
      pillBorder: 'border-border-accent',
      textGradient: 'text-primary font-bold',
      dotGradient: 'bg-primary',
      hex: 'var(--primary)'
    }
  }),
  [APPOINTMENT_STATUS.WAITING]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.WAITING,
    domainStatus: 'WAITING',
    label: 'Menunggu',
    description: 'Pasien berada di ruang tunggu antrean pemeriksaan',
    uiStatus: 'Menunggu',
    badge: 'Menunggu',
    queueDisplayStatus: 'WAITING',
    isTerminal: false,
    isInService: false,
    isWaiting: true,
    isBooked: false,
    styling: {
      pillBg: 'bg-warning-subtle',
      pillBorder: 'border-warning-border',
      textGradient: 'text-warning font-bold',
      dotGradient: 'bg-warning',
      hex: 'var(--warning)'
    }
  }),
  [APPOINTMENT_STATUS.IN_SERVICE]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.IN_SERVICE,
    domainStatus: 'IN_SERVICE',
    label: 'Sedang Diperiksa',
    description: 'Pasien sedang dalam ruang konsultasi dengan dokter',
    uiStatus: 'Sedang Diperiksa',
    badge: 'Di Sesi',
    queueDisplayStatus: 'IN_SERVICE',
    isTerminal: false,
    isInService: true,
    isWaiting: false,
    isBooked: false,
    styling: {
      pillBg: 'bg-primary-subtle',
      pillBorder: 'border-border-accent',
      textGradient: 'text-primary-bright font-bold',
      dotGradient: 'bg-primary-bright',
      hex: 'var(--primary-bright, var(--primary))'
    }
  }),
  [APPOINTMENT_STATUS.COMPLETED]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.COMPLETED,
    domainStatus: 'COMPLETED',
    label: 'Selesai',
    description: 'Pemeriksaan selesai, rekam medis telah diperbarui',
    uiStatus: 'Selesai',
    badge: 'Selesai',
    queueDisplayStatus: 'COMPLETED',
    isTerminal: true,
    isInService: false,
    isWaiting: false,
    isBooked: false,
    styling: {
      pillBg: 'bg-status-completed-subtle',
      pillBorder: 'border-status-completed-border',
      textGradient: 'text-status-completed font-bold',
      dotGradient: 'bg-status-completed',
      hex: 'var(--status-completed)'
    }
  }),
  [APPOINTMENT_STATUS.CANCELLED]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.CANCELLED,
    domainStatus: 'CANCELLED',
    label: 'Dibatalkan',
    description: 'Janji temu dibatalkan oleh pasien atau pihak klinik',
    uiStatus: 'Batal',
    badge: 'Batal',
    queueDisplayStatus: 'CANCELLED',
    isTerminal: true,
    isInService: false,
    isWaiting: false,
    isBooked: false,
    styling: {
      pillBg: 'bg-destructive-subtle',
      pillBorder: 'border-destructive-border',
      textGradient: 'text-destructive font-bold',
      dotGradient: 'bg-destructive',
      hex: 'var(--destructive)'
    }
  }),
  [APPOINTMENT_STATUS.LATE]: new AppointmentStatusDescriptor({
    code: APPOINTMENT_STATUS.LATE,
    domainStatus: 'LATE',
    label: 'Terlambat',
    description: 'Pasien belum hadir melebihi batas toleransi waktu',
    uiStatus: 'Tidak Hadir',
    badge: 'Terlambat',
    queueDisplayStatus: 'NO_SHOW',
    isTerminal: true,
    isInService: false,
    isWaiting: false,
    isBooked: false,
    styling: {
      pillBg: 'bg-slate-100 dark:bg-slate-800/60',
      pillBorder: 'border-slate-300 dark:border-slate-700',
      textGradient: 'text-slate-700 dark:text-slate-200',
      dotGradient: 'bg-slate-400 dark:bg-slate-500',
      hex: '#64748B'
    }
  })
};

const STATUS_ALIASES: Readonly<Record<string, CanonicalAppointmentStatus>> = {
  BOOK: APPOINTMENT_STATUS.BOOKED,
  BOOKED: APPOINTMENT_STATUS.BOOKED,
  SUDAH_BUAT_JANJI: APPOINTMENT_STATUS.BOOKED,
  WAITING: APPOINTMENT_STATUS.WAITING,
  MENUNGGU: APPOINTMENT_STATUS.WAITING,
  CHECKED_IN: APPOINTMENT_STATUS.WAITING,
  IN_SERVICE: APPOINTMENT_STATUS.IN_SERVICE,
  SEDANG_DIPERIKSA: APPOINTMENT_STATUS.IN_SERVICE,
  SEDANG_PERIKSA: APPOINTMENT_STATUS.IN_SERVICE,
  DI_SESI: APPOINTMENT_STATUS.IN_SERVICE,
  DIPANGGIL: APPOINTMENT_STATUS.WAITING,
  CALLED: APPOINTMENT_STATUS.WAITING,
  COMPLETED: APPOINTMENT_STATUS.COMPLETED,
  SELESAI: APPOINTMENT_STATUS.COMPLETED,
  CANCELLED: APPOINTMENT_STATUS.CANCELLED,
  BATAL: APPOINTMENT_STATUS.CANCELLED,
  TIDAK_ADA_DOKTER: APPOINTMENT_STATUS.CANCELLED,
  LATE: APPOINTMENT_STATUS.LATE,
  TERLAMBAT: APPOINTMENT_STATUS.LATE,
  NO_SHOW: APPOINTMENT_STATUS.LATE,
  TIDAK_HADIR: APPOINTMENT_STATUS.LATE
};

export function normalizeAppointmentStatus(raw?: string | null): CanonicalAppointmentStatus {
  if (!raw) return APPOINTMENT_STATUS.WAITING;
  const normalizedKey = raw.trim().toUpperCase().replace(/\s+/g, '_');
  return STATUS_ALIASES[normalizedKey] ?? APPOINTMENT_STATUS.WAITING;
}

export const getAppointmentStatusDescriptor = AppointmentStatusDescriptor.from;
