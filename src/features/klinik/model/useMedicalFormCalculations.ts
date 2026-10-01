'use client';

import * as React from 'react';
import type { MedicalAppointmentValues } from '../utils/medical-appointment';
import { calculateAgeInYears, calculateBmi } from '../utils/medical-appointment';
import {
  calculateEddFromLmp,
  calculateGestationalAge as calculateObstetricGestationalAge,
  formatIndonesianDateText
} from '../utils/obstetric-calculator';

interface UseMedicalFormCalculationsParams {
  values: MedicalAppointmentValues;
  setFieldValue: (fieldId: string, value: string) => void;
}

export function useMedicalFormCalculations({
  values,
  setFieldValue
}: UseMedicalFormCalculationsParams) {
  React.useEffect(() => {
    const calculated = calculateBmi(values.prePregnancyWeightKg, values.heightCm);
    if (calculated && values.initialBmi !== calculated) {
      setFieldValue('initialBmi', calculated);
    }
  }, [values.prePregnancyWeightKg, values.heightCm, values.initialBmi, setFieldValue]);

  React.useEffect(() => {
    if (values.motherBirthDate) {
      const formatted = calculateAgeInYears(values.motherBirthDate);
      if (formatted && values.motherAge !== formatted) {
        setFieldValue('motherAge', formatted);
      }
    }
  }, [values.motherBirthDate, values.motherAge, setFieldValue]);

  React.useEffect(() => {
    if (values.partnerBirthDate) {
      const formatted = calculateAgeInYears(values.partnerBirthDate);
      if (formatted && values.partnerAge !== formatted) {
        setFieldValue('partnerAge', formatted);
      }
    }
  }, [values.partnerBirthDate, values.partnerAge, setFieldValue]);

  React.useEffect(() => {
    if (values.hpht) {
      try {
        const edd = calculateEddFromLmp(values.hpht);
        const estimatedDueDate = formatIndonesianDateText(edd);
        const gestationalAge = calculateObstetricGestationalAge(edd, new Date()).formatted;

        if (values.estimatedDueDate !== estimatedDueDate) {
          setFieldValue('estimatedDueDate', estimatedDueDate);
        }
        if (values.gestationalAge !== gestationalAge) {
          setFieldValue('gestationalAge', gestationalAge);
        }
      } catch {
        return;
      }
      return;
    }

    if (values.estimatedDueDate) {
      setFieldValue('estimatedDueDate', '');
    }
    if (values.gestationalAge) {
      setFieldValue('gestationalAge', '');
    }
  }, [values.hpht, values.estimatedDueDate, values.gestationalAge, setFieldValue]);
}
