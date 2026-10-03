import type { AutofillSchedule } from '../types';
import { ImmunizationFakerFactory } from '../factories/immunization-faker-factory';

export function getImmunizationAutofillPreset(): {
  values: Record<string, string>;
  schedule: AutofillSchedule;
} {
  return ImmunizationFakerFactory.generate();
}

export const IMMUNIZATION_AUTOFILL_PRESET: Record<string, string> =
  ImmunizationFakerFactory.generate().values;

export const IMMUNIZATION_SCHEDULE_PRESET: AutofillSchedule =
  ImmunizationFakerFactory.generate().schedule;
