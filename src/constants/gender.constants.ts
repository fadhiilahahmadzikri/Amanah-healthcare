/**
 * Canonical Single Source of Truth (SSOT) for Gender
 * - Database Enum Value: 'male' | 'female'
 * - Indonesian Presentation Label: 'Laki-laki' | 'Perempuan'
 */

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

export const GENDER_LABEL_MAP: Record<Gender, string> = {
  [GENDER.MALE]: 'Laki-laki',
  [GENDER.FEMALE]: 'Perempuan'
};

export interface GenderOption {
  label: string;
  value: Gender;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { label: 'Laki-laki', value: GENDER.MALE },
  { label: 'Perempuan', value: GENDER.FEMALE }
];

export const DEFAULT_GENDER_OPTIONS = GENDER_OPTIONS;

/**
 * Returns user-facing Indonesian label ('Laki-laki' | 'Perempuan') for a given gender value.
 */
export function getGenderLabel(raw?: string | null): string {
  if (!raw) return '-';
  const lower = raw.trim().toLowerCase();
  if (lower === 'male' || lower === 'laki-laki' || lower === 'l') {
    return GENDER_LABEL_MAP[GENDER.MALE];
  }
  if (lower === 'female' || lower === 'perempuan' || lower === 'p') {
    return GENDER_LABEL_MAP[GENDER.FEMALE];
  }
  return raw;
}

/**
 * Normalizes any incoming gender representation to canonical database enum ('male' | 'female').
 */
export function normalizeGender(raw?: string | null): Gender | null {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (lower === 'female' || lower === 'perempuan' || lower === 'p') {
    return GENDER.FEMALE;
  }
  if (lower === 'male' || lower === 'laki-laki' || lower === 'l') {
    return GENDER.MALE;
  }
  return null;
}

export type GenderLabel = 'Laki-laki' | 'Perempuan';
