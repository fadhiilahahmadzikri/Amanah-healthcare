/**
 * Clinical Healthcare Design System Tokens
 * Gradient status badges without glow (flat, shadow-none):
 * - Gradient pill background & border
 * - Gradient text with bg-clip-text
 * - Multi-stop gradient dot ("bola")
 */

import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';

export const clinicalTokens = {
  typography: {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    scale: {
      doctorName: { fontSize: '15px', lineHeight: '20px', fontWeight: 700 },
      specialty: { fontSize: '12.5px', lineHeight: '18px', fontWeight: 500 },
      status: { fontSize: '11.5px', lineHeight: '16px', fontWeight: 700 },
      date: { fontSize: '12.5px', lineHeight: '18px', fontWeight: 600 },
      location: { fontSize: '12.5px', lineHeight: '18px', fontWeight: 500 },
      locationSub: { fontSize: '11.5px', lineHeight: '16px', fontWeight: 400 },
      time: { fontSize: '18px', lineHeight: '24px', fontWeight: 700 },
      timeLabels: { fontSize: '11px', lineHeight: '14px', fontWeight: 400 },
      duration: { fontSize: '11.5px', lineHeight: '16px', fontWeight: 500 },
      timelineDesc: { fontSize: '11px', lineHeight: '14px', fontWeight: 400 }
    }
  },
  colors: {
    primaryNavy: 'var(--primary-deep, var(--primary))',
    primaryHover: 'color-mix(in oklab, var(--primary-deep, var(--primary)) 85%, black)',
    surface: 'var(--card)',
    surfaceSubtle: 'var(--surface-subtle, var(--muted))',
    textPrimary: 'var(--foreground)',
    textSecondary: 'var(--muted-foreground)',
    textMuted: 'var(--muted-foreground)',
    border: 'var(--border)',
    borderSubtle: 'var(--border-subtle, var(--border))',
    borderIndigo: 'var(--border-accent, var(--primary-subtle, var(--border)))',
    ratingGold: 'var(--rating-gold, #FFB61A)',
    ratingBg: 'var(--rating-gold-subtle, #FFF0C7)',
    ratingText: 'var(--foreground)',
    timelineTrack: 'var(--border-subtle, var(--border))',
    timelineDot: 'var(--border)',
    status: {
      completed: {
        pillBg: 'bg-status-completed-subtle',
        pillBorder: 'border-status-completed-border',
        pillShadow: 'shadow-none',
        textGradient: 'text-status-completed font-bold',
        dotGradient: 'bg-status-completed',
        hex: 'var(--status-completed)'
      },
      confirmed: {
        pillBg: 'bg-success-subtle',
        pillBorder: 'border-success-border',
        pillShadow: 'shadow-none',
        textGradient: 'text-success font-bold',
        dotGradient: 'bg-success',
        hex: 'var(--success)'
      },
      upcoming: {
        pillBg: 'bg-info-subtle',
        pillBorder: 'border-info-border',
        pillShadow: 'shadow-none',
        textGradient: 'text-info font-bold',
        dotGradient: 'bg-info',
        hex: 'var(--info)'
      },
      checkedIn: {
        pillBg: 'bg-primary-subtle',
        pillBorder: 'border-border-accent',
        pillShadow: 'shadow-none',
        textGradient: 'text-primary-bright font-bold',
        dotGradient: 'bg-primary-bright',
        hex: 'var(--primary-bright, var(--primary))'
      },
      pending: {
        pillBg: 'bg-warning-subtle',
        pillBorder: 'border-warning-border',
        pillShadow: 'shadow-none',
        textGradient: 'text-warning font-bold',
        dotGradient: 'bg-warning',
        hex: 'var(--warning)'
      },
      cancelled: {
        pillBg: 'bg-destructive-subtle',
        pillBorder: 'border-destructive-border',
        pillShadow: 'shadow-none',
        textGradient: 'text-destructive font-bold',
        dotGradient: 'bg-destructive',
        hex: 'var(--destructive)'
      }
    }
  },
  geometry: {
    cardRadius: '20px',
    ratingRadius: '6px',
    pillRadius: '9999px',
    tagRadius: '10px',
    buttonActionHeight: '40px',
    buttonActionRadius: '12px',
    buttonActionFontSize: '13px'
  }
} as const;

export type StatusConfig = {
  pillBg: string;
  pillBorder: string;
  pillShadow: string;
  textGradient: string;
  dotGradient: string;
  hex: string;
  label: string;
};

export const getStatusConfig = (status: string): StatusConfig => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'BUKA':
    case 'OPEN':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Buka'
      };
    case 'AKTIF':
    case 'ACTIVE':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Aktif'
      };
    case 'HADIR':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Hadir'
      };
    case 'AKUN_UTAMA':
    case 'MASTER':
      return {
        pillBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        pillBorder: 'border-amber-500/20 dark:border-amber-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-amber-600 dark:text-amber-400 font-bold',
        dotGradient: 'bg-amber-500',
        hex: '#F59E0B',
        label: 'Akun Utama'
      };
    case 'MANDIRI':
      return {
        pillBg: 'bg-muted/50 dark:bg-muted/40',
        pillBorder: 'border-border/60',
        pillShadow: 'shadow-none',
        textGradient: 'text-muted-foreground font-bold',
        dotGradient: 'bg-muted-foreground/60',
        hex: '#94A3B8',
        label: 'Mandiri'
      };
    case 'INDUK':
      return {
        pillBg: 'bg-muted/50 dark:bg-muted/40',
        pillBorder: 'border-border/60',
        pillShadow: 'shadow-none',
        textGradient: 'text-muted-foreground font-bold',
        dotGradient: 'bg-muted-foreground/60',
        hex: '#94A3B8',
        label: 'Induk'
      };
    case 'AFILIASI_ANAK':
      return {
        pillBg: 'bg-sky-500/10 dark:bg-sky-500/20',
        pillBorder: 'border-sky-500/20 dark:border-sky-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-sky-600 dark:text-sky-400 font-bold',
        dotGradient: 'bg-sky-500',
        hex: '#0EA5E9',
        label: 'Anak'
      };
    case 'AFILIASI_PASANGAN':
      return {
        pillBg: 'bg-rose-500/10 dark:bg-rose-500/20',
        pillBorder: 'border-rose-500/20 dark:border-rose-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-rose-600 dark:text-rose-400 font-bold',
        dotGradient: 'bg-rose-500',
        hex: '#F43F5E',
        label: 'Pasangan'
      };
    case 'AFILIASI_ORANG_TUA':
      return {
        pillBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        pillBorder: 'border-amber-500/20 dark:border-amber-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-amber-600 dark:text-amber-400 font-bold',
        dotGradient: 'bg-amber-500',
        hex: '#F59E0B',
        label: 'Orang Tua'
      };
    case 'AFILIASI_KERABAT':
      return {
        pillBg: 'bg-purple-500/10 dark:bg-purple-500/20',
        pillBorder: 'border-purple-500/20 dark:border-purple-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-purple-600 dark:text-purple-400 font-bold',
        dotGradient: 'bg-purple-500',
        hex: '#A855F7',
        label: 'Kerabat'
      };
    case 'AFILIASI':
    case 'AFILIASI_KELUARGA':
      return {
        pillBg: 'bg-sky-500/10 dark:bg-sky-500/20',
        pillBorder: 'border-sky-500/20 dark:border-sky-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-sky-600 dark:text-sky-400 font-bold',
        dotGradient: 'bg-sky-500',
        hex: '#0EA5E9',
        label: 'Keluarga'
      };
    case 'PUNYA_AKUN':
      return {
        pillBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        pillBorder: 'border-emerald-500/20 dark:border-emerald-500/30',
        pillShadow: 'shadow-none',
        textGradient: 'text-emerald-600 dark:text-emerald-400 font-bold',
        dotGradient: 'bg-emerald-500',
        hex: '#10B981',
        label: 'Punya Akun'
      };
    case 'ISONLEAVE':
    case 'LEAVE':
    case 'CUTI':
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Cuti'
      };
    case APPOINTMENT_STATUS.BOOKED:
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Sudah Buat Janji'
      };
    case APPOINTMENT_STATUS.WAITING:
      return {
        ...clinicalTokens.colors.status.pending,
        label: 'Menunggu'
      };
    case APPOINTMENT_STATUS.IN_SERVICE:
      return {
        ...clinicalTokens.colors.status.checkedIn,
        label: 'Sedang Diperiksa'
      };
    case APPOINTMENT_STATUS.COMPLETED:
      return {
        ...clinicalTokens.colors.status.completed,
        label: 'Selesai'
      };
    case APPOINTMENT_STATUS.CANCELLED:
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Dibatalkan'
      };
    case APPOINTMENT_STATUS.LATE:
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Terlambat'
      };
    case 'TERKONEKSI':
      return {
        ...clinicalTokens.colors.status.checkedIn,
        label: 'Terkoneksi'
      };
    case 'SUDAH_DATANG':
    case 'SUDAH DATANG':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Sudah Datang'
      };
    case 'TUTUP':
    case 'CLOSED':
      return {
        pillBg: 'bg-muted/50 dark:bg-muted/40',
        pillBorder: 'border-border/60',
        pillShadow: 'shadow-none',
        textGradient: 'text-muted-foreground font-bold',
        dotGradient: 'bg-muted-foreground/40',
        hex: '#94A3B8',
        label: 'Tutup'
      };
    case 'BELUM_DIATUR':
    case 'BELUM DIATUR':
      return {
        pillBg: 'bg-muted/50 dark:bg-muted/40',
        pillBorder: 'border-border/60',
        pillShadow: 'shadow-none',
        textGradient: 'text-muted-foreground font-bold',
        dotGradient: 'bg-muted-foreground/40',
        hex: '#94A3B8',
        label: 'Belum Diatur'
      };
    case 'LIBUR':
      return {
        pillBg: 'bg-slate-100 dark:bg-slate-800/60',
        pillBorder: 'border-slate-300 dark:border-slate-700',
        pillShadow: 'shadow-none',
        textGradient: 'text-slate-700 dark:text-slate-200',
        dotGradient: 'bg-slate-400 dark:bg-slate-500',
        hex: '#64748B',
        label: 'Libur'
      };
    case 'NONAKTIF':
    case 'NON_AKTIF':
    case 'INACTIVE':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Non-Aktif'
      };
    default:
      return {
        pillBg: 'bg-slate-100 dark:bg-slate-800/60',
        pillBorder: 'border-slate-300 dark:border-slate-700',
        pillShadow: 'shadow-none',
        textGradient: 'text-slate-700 dark:text-slate-200',
        dotGradient: 'bg-slate-400 dark:bg-slate-500',
        hex: '#64748B',
        label: status
      };
  }
};
