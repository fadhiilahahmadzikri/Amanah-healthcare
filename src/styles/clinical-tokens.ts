/**
 * Clinical Healthcare Design System Tokens
 * Gradient status badges without glow (flat, shadow-none):
 * - Gradient pill background & border
 * - Gradient text with bg-clip-text
 * - Multi-stop gradient dot ("bola")
 */

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
    case 'AKTIF':
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'HADIR':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: normalized === 'HADIR' ? 'Hadir' : 'Buka'
      };
    case 'CUTI':
    case 'LEAVE':
    case 'CUTI_/_TUTUP':
    case 'CUTI / TUTUP':
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Cuti'
      };
    case 'PENUH':
    case 'FULL':
    case 'SEBAGIAN':
    case 'PENDING':
      return {
        ...clinicalTokens.colors.status.pending,
        label: 'Penuh'
      };
    case 'COMPLETED':
    case 'SELESAI':
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Selesai'
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
    case 'SUDAH_BUAT_JANJI':
    case 'SUDAH BUAT JANJI':
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Sudah Buat Janji'
      };
    case 'SEDANG_PERIKSA':
    case 'SEDANG PERIKSA':
      return {
        ...clinicalTokens.colors.status.checkedIn,
        label: 'Sedang Periksa'
      };
    case 'TIDAK_ADA_DOKTER':
    case 'TIDAK ADA DOKTER':
    case 'TIDAK_HADIR':
    case 'TIDAK HADIR':
    case 'TUTUP':
    case 'CLOSED':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: normalized === 'TIDAK_HADIR' || normalized === 'TIDAK HADIR' ? 'Tidak Hadir' : 'Cuti'
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
    case 'INACTIVE':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Nonaktif'
      };
    case 'CONFIRMED':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Confirmed'
      };
    case 'UPCOMING':
      return {
        ...clinicalTokens.colors.status.upcoming,
        label: 'Upcoming'
      };
    case 'CHECKED_IN':
    case 'CHECKED IN':
    case 'DIPANGGIL':
      return {
        ...clinicalTokens.colors.status.checkedIn,
        label: 'Checked In'
      };
    case 'PENDING':
    case 'MENUNGGU':
      return {
        ...clinicalTokens.colors.status.pending,
        label: 'Menunggu'
      };
    case 'CANCELLED':
    case 'BATAL':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Cancelled'
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
