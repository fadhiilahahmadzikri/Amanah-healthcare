export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

export const GENDER_LABEL_MAP: Record<Gender, string> = {
  [GENDER.MALE]: 'Laki-laki',
  [GENDER.FEMALE]: 'Perempuan'
};

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: GENDER_LABEL_MAP[GENDER.MALE], value: GENDER.MALE },
  { label: GENDER_LABEL_MAP[GENDER.FEMALE], value: GENDER.FEMALE }
];

export function getGenderLabel(gender?: string | null): string {
  return (gender && GENDER_LABEL_MAP[gender as Gender]) || '-';
}
