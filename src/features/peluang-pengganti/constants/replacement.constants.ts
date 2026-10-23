export const REPLACEMENT_STATUS = {
  OPEN: 'open',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type ReplacementStatus = (typeof REPLACEMENT_STATUS)[keyof typeof REPLACEMENT_STATUS];

export const REPLACEMENT_STATUS_CONFIG: Record<
  ReplacementStatus,
  {
    label: string;
    variant: 'amber' | 'lime' | 'blue' | 'red';
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    description: string;
  }
> = {
  [REPLACEMENT_STATUS.OPEN]: {
    label: 'Terbuka',
    variant: 'amber',
    dotColor: '#F59E0B',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-400',
    description: 'Peluang dinas terbuka, belum diambil oleh staf pengganti'
  },
  [REPLACEMENT_STATUS.CLAIMED]: {
    label: 'Diklaim',
    variant: 'lime',
    dotColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    description: 'Telah diklaim atau ditugaskan ke staf pengganti'
  },
  [REPLACEMENT_STATUS.COMPLETED]: {
    label: 'Selesai',
    variant: 'blue',
    dotColor: '#3B82F6',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-700 dark:text-blue-400',
    description: 'Dinas pengganti telah selesai dikerjakan (checkout presensi)'
  },
  [REPLACEMENT_STATUS.CANCELLED]: {
    label: 'Dibatalkan',
    variant: 'red',
    dotColor: '#EF4444',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-700 dark:text-rose-400',
    description: 'Peluang dinas pengganti dibatalkan oleh admin atau sistem'
  }
};

/**
 * Clean 1-to-1 mapping directly from canonical database column `session_def.code`.
 * Zero regex, zero string surgery.
 */
export const SESSION_CODE_LABELS: Record<string, string> = {
  morning: 'Sesi Pagi',
  afternoon: 'Sesi Siang',
  night: 'Sesi Malam',
  early_morning: 'Sesi Dini Hari'
};

export function getSessionTitle(sessionCode?: string | null): string {
  if (!sessionCode) return 'Sesi Dinas';
  return SESSION_CODE_LABELS[sessionCode.toLowerCase()] || `Sesi ${sessionCode}`;
}
