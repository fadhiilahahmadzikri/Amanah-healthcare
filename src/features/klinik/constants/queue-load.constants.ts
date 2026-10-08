export const DEFAULT_FALLBACK_CAPACITY = 20;

export const QUEUE_LOAD_STATUS = {
  SENGGANG: 'Senggang',
  NORMAL: 'Normal',
  PADAT: 'Padat',
  SANGAT_PADAT: 'Sangat Padat',
} as const;

export type QueueLoadStatus =
  (typeof QUEUE_LOAD_STATUS)[keyof typeof QUEUE_LOAD_STATUS];

export const QUEUE_LOAD_THRESHOLDS = {
  SENGGANG_MAX_RATIO: 0.6,
  NORMAL_MAX_RATIO: 0.9,
  PADAT_MAX_RATIO: 1.2,
} as const;

export function resolveQueueLoadStatus(loadRatio: number): QueueLoadStatus {
  if (loadRatio < QUEUE_LOAD_THRESHOLDS.SENGGANG_MAX_RATIO) {
    return QUEUE_LOAD_STATUS.SENGGANG;
  }
  if (loadRatio <= QUEUE_LOAD_THRESHOLDS.NORMAL_MAX_RATIO) {
    return QUEUE_LOAD_STATUS.NORMAL;
  }
  if (loadRatio <= QUEUE_LOAD_THRESHOLDS.PADAT_MAX_RATIO) {
    return QUEUE_LOAD_STATUS.PADAT;
  }
  return QUEUE_LOAD_STATUS.SANGAT_PADAT;
}

export const QUEUE_LOAD_BADGE_STYLES: Record<QueueLoadStatus, string> = {
  [QUEUE_LOAD_STATUS.SENGGANG]:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  [QUEUE_LOAD_STATUS.NORMAL]:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  [QUEUE_LOAD_STATUS.PADAT]:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  [QUEUE_LOAD_STATUS.SANGAT_PADAT]:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};
