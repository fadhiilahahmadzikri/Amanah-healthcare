import type { FormJsonSchema } from '../../../../constants/medical-appointment-types';
import { getGenderLabel } from '@/constants/gender.constants';
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';

export function getInactiveFieldIds(schema?: FormJsonSchema | Record<string, any> | null): Set<string> {
  const inactive = new Set<string>();
  if (!schema || !Array.isArray(schema.steps)) return inactive;
  for (const step of schema.steps) {
    if (step && Array.isArray(step.fields)) {
      for (const field of step.fields) {
        if (field && field.isActive === false && field.id) {
          inactive.add(field.id);
        }
      }
    }
  }
  return inactive;
}

export function formatGender(gender?: string): string {
  return getGenderLabel(gender);
}

export const CANONICAL_PMB_DISEASE_KEYS = CANONICAL_MATERNAL_CONDITIONS.map((c) => c.docLabel);

export interface VaccineScheduleDef {
  rowIdx: number;
  codes: string[];
  defaultAge: string;
}

export const VACCINE_SCHEDULE_DEFINITIONS: VaccineScheduleDef[] = [
  { rowIdx: 0, codes: ['HB_0'], defaultAge: '0 bln' },
  { rowIdx: 1, codes: ['BCG'], defaultAge: '1 bln' },
  { rowIdx: 2, codes: ['PENTA_1', 'IPV_1', 'HEXA_1'], defaultAge: '2 bln' },
  { rowIdx: 3, codes: ['PCV_1'], defaultAge: '2 bln' },
  { rowIdx: 4, codes: ['RV_1'], defaultAge: '2 bln' },
  { rowIdx: 5, codes: ['PENTA_2', 'IPV_2', 'HEXA_2'], defaultAge: '3 bln' },
  { rowIdx: 6, codes: ['PCV_2'], defaultAge: '3 bln' },
  { rowIdx: 7, codes: ['RV_2'], defaultAge: '3 bln' },
  { rowIdx: 8, codes: ['PENTA_3', 'IPV_3', 'HEXA_3'], defaultAge: '4 bln' },
  { rowIdx: 9, codes: ['RV_3'], defaultAge: '4 bln' },
  { rowIdx: 10, codes: ['MR'], defaultAge: '9 bln' },
  { rowIdx: 11, codes: ['JE'], defaultAge: '10 bln' },
  { rowIdx: 12, codes: ['PCV_B'], defaultAge: '12 bln' },
  { rowIdx: 13, codes: ['PENTA_B'], defaultAge: '18 bln' },
  { rowIdx: 14, codes: ['MR_B'], defaultAge: '18 bln' }
];
