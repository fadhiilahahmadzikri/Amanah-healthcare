export const VISIT_TYPE = {
  NEW_VISIT: 'new_visit',
  FOLLOW_UP: 'follow_up'
} as const;

export type CanonicalVisitType = (typeof VISIT_TYPE)[keyof typeof VISIT_TYPE];

export const VISIT_TYPE_LABELS: Record<CanonicalVisitType, string> = {
  [VISIT_TYPE.NEW_VISIT]: 'Pemeriksaan Baru',
  [VISIT_TYPE.FOLLOW_UP]: 'Kontrol Ulang'
};

export function formatFriendlyVisitType(visitType?: CanonicalVisitType | null): string {
  if (!visitType) return '-';
  return VISIT_TYPE_LABELS[visitType] ?? '-';
}
