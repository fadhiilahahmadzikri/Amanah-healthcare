export const PATIENT_RELATIONSHIP = {
  SELF: 'self',
  CHILD: 'child',
  SPOUSE: 'spouse',
  PARENT: 'parent',
  RELATIVE: 'relative',
  FRIEND: 'friend',
  OTHER: 'other'
} as const;

export type PatientRelationship = (typeof PATIENT_RELATIONSHIP)[keyof typeof PATIENT_RELATIONSHIP];

export const RELATIONSHIP_LABEL_MAP: Record<PatientRelationship, string> = {
  [PATIENT_RELATIONSHIP.SELF]: 'Diri Sendiri',
  [PATIENT_RELATIONSHIP.CHILD]: 'Anak',
  [PATIENT_RELATIONSHIP.SPOUSE]: 'Pasangan',
  [PATIENT_RELATIONSHIP.PARENT]: 'Orang Tua',
  [PATIENT_RELATIONSHIP.RELATIVE]: 'Kerabat',
  [PATIENT_RELATIONSHIP.FRIEND]: 'Teman',
  [PATIENT_RELATIONSHIP.OTHER]: 'Lainnya'
};

export function getRelationshipLabel(type?: string | null, customLabel?: string | null): string {
  if (customLabel && customLabel.trim().length > 0) {
    return customLabel.trim();
  }
  if (!type) return '-';
  const normalized = type.toLowerCase() as PatientRelationship;
  return RELATIONSHIP_LABEL_MAP[normalized] ?? '-';
}
