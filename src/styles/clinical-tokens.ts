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
    primaryNavy: '#151A66',
    primaryHover: '#10144F',
    surface: '#FFFFFF',
    surfaceSubtle: '#F8F9FC',
    textPrimary: '#151A66',
    textSecondary: '#6F7895',
    textMuted: '#98A1B8',
    border: '#E3E7F0',
    borderSubtle: '#EDF0F5',
    borderIndigo: '#C7D2FE',
    ratingGold: '#FFB61A',
    ratingBg: '#FFF0C7',
    ratingText: '#252525',
    timelineTrack: '#D5DAE8',
    timelineDot: '#D0D6E4',
    status: {
      completed: {
        pillBg:
          'bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-purple-500/10 dark:from-purple-950/40 dark:via-fuchsia-950/30 dark:to-purple-950/40',
        pillBorder: 'border-purple-300/80 dark:border-purple-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#6d2aad] via-[#a855f7] to-[#d946ef] dark:from-[#d8b4fe] dark:via-[#f0abfc] dark:to-[#ff79fd]',
        dotGradient: 'bg-gradient-to-tr from-[#6d2aad] via-[#a855f7] to-[#ff79fd]',
        hex: '#a855f7'
      },
      confirmed: {
        pillBg:
          'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40',
        pillBorder: 'border-emerald-300/80 dark:border-emerald-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] dark:from-[#6ee7b7] dark:via-[#34d399] dark:to-[#a7f3d0]',
        dotGradient: 'bg-gradient-to-tr from-[#047857] via-[#10b981] to-[#34d399]',
        hex: '#10b981'
      },
      upcoming: {
        pillBg:
          'bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-blue-950/40',
        pillBorder: 'border-blue-300/80 dark:border-blue-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] dark:from-[#93c5fd] dark:via-[#60a5fa] dark:to-[#38bdf8]',
        dotGradient: 'bg-gradient-to-tr from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4]',
        hex: '#3b82f6'
      },
      checkedIn: {
        pillBg:
          'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40',
        pillBorder: 'border-blue-300/80 dark:border-blue-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#1d4ed8] via-[#4338ca] to-[#2563eb] dark:from-[#93c5fd] dark:via-[#a5b4fc] dark:to-[#818cf8]',
        dotGradient: 'bg-gradient-to-tr from-[#1d4ed8] via-[#4f46e5] to-[#60a5fa]',
        hex: '#4f46e5'
      },
      pending: {
        pillBg:
          'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40',
        pillBorder: 'border-amber-300/80 dark:border-amber-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] dark:from-[#fde68a] dark:via-[#fcd34d] dark:to-[#fbbf24]',
        dotGradient: 'bg-gradient-to-tr from-[#b45309] via-[#f59e0b] to-[#fbbf24]',
        hex: '#f59e0b'
      },
      cancelled: {
        pillBg:
          'bg-gradient-to-r from-rose-500/10 via-red-500/10 to-rose-500/10 dark:from-rose-950/40 dark:via-red-950/30 dark:to-rose-950/40',
        pillBorder: 'border-rose-300/80 dark:border-rose-600/50',
        pillShadow: 'shadow-none',
        textGradient:
          'bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#f43f5e] dark:from-[#fecdd3] dark:via-[#fda4af] dark:to-[#fb7185]',
        dotGradient: 'bg-gradient-to-tr from-[#be123c] via-[#f43f5e] to-[#fb7185]',
        hex: '#f43f5e'
      }
    }
  },
  geometry: {
    cardRadius: '20px',
    ratingRadius: '6px',
    pillRadius: '9999px',
    tagRadius: '10px'
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
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Tidak Ada Dokter'
      };
    case 'AKTIF':
    case 'ACTIVE':
      return {
        ...clinicalTokens.colors.status.confirmed,
        label: 'Aktif'
      };
    case 'SEBAGIAN':
      return {
        ...clinicalTokens.colors.status.pending,
        label: 'Sebagian'
      };
    case 'CUTI':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Cuti'
      };
    case 'CUTI_/_TUTUP':
    case 'CUTI / TUTUP':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Cuti / Tutup'
      };
    case 'TUTUP':
    case 'CLOSED':
      return {
        ...clinicalTokens.colors.status.cancelled,
        label: 'Tutup'
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
