import { RegularPatientFakerFactory } from '../factories/regular-patient-faker-factory';
import type { DynamicProfileOptions } from '../core';

export function getRegularPatientAutofillPreset(options?: DynamicProfileOptions): {
  values: Record<string, string>;
} {
  return RegularPatientFakerFactory.generate(options);
}

export const REGULAR_PATIENT_AUTOFILL_PRESET: Record<string, string> =
  RegularPatientFakerFactory.generate().values;
