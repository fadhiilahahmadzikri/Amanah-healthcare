import type { AutofillSchedule } from '../types';
import { PregnancyFakerFactory } from '../factories/pregnancy-faker-factory';

export function getPregnancyAutofillPreset(): {
  values: Record<string, string>;
  schedule: AutofillSchedule;
} {
  return PregnancyFakerFactory.generate();
}

export const PREGNANCY_AUTOFILL_PRESET: Record<string, string> =
  PregnancyFakerFactory.generate().values;

export const PREGNANCY_SCHEDULE_PRESET: AutofillSchedule =
  PregnancyFakerFactory.generate().schedule;
