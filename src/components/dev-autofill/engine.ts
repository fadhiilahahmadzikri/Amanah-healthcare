import { resolveAdaptiveAutofillValues, resolveAdaptiveClearValues } from './adaptive-autofill';
import type { AutofillPayload, AutofillSchedule } from './types';

export const AUTOFILL_EVENT_NAME = 'devtool:autofill';

export function dispatchAutofillEvent(
  flow: string,
  values: Record<string, string>,
  schedule?: AutofillSchedule,
  step?: number
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: AutofillPayload = {
    flow,
    values,
    schedule,
    step
  };

  window.dispatchEvent(
    new CustomEvent(AUTOFILL_EVENT_NAME, {
      detail: payload
    })
  );
}

export function fillVisibleFields(presetValues: Record<string, string>, flow: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const adaptivePreset = resolveAdaptiveAutofillValues(flow, presetValues);
  const currentStepValues: Record<string, string> = {};
  const visibleElements = document.querySelectorAll<HTMLElement>(
    '[role="dialog"] [id], [role="dialog"] [name], [role="dialog"] [data-field-id]'
  );

  visibleElements.forEach((el) => {
    const key = el.getAttribute('data-field-id') || el.id || el.getAttribute('name');
    if (key && adaptivePreset[key] !== undefined) {
      currentStepValues[key] = adaptivePreset[key];
    }
  });

  const inputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >('[role="dialog"] input, [role="dialog"] textarea, [role="dialog"] select');
  inputs.forEach((input) => {
    const key = input.id || input.name;
    if (key && adaptivePreset[key] !== undefined) {
      currentStepValues[key] = adaptivePreset[key];
    }
  });

  const hasQuestionnaire = document.querySelector(
    '[role="dialog"] [role="radiogroup"], [role="dialog"] table'
  );
  if (hasQuestionnaire) {
    const questionnaireKeys = [
      'smokedBeforePregnancy',
      'alcoholBeforePregnancy',
      'irregularDietBeforePregnancy',
      'reducedPhysicalActivityBeforePregnancy',
      'unprescribedMedicationBeforePregnancy',
      'concerningCosmeticUseBeforePregnancy',
      'pesticideExposureBeforePregnancy',
      'chemicalExposureBeforePregnancy',
      'smokeExposureBeforePregnancy',
      'hasHypertensionHistory',
      'hypertensionHistoryNotes',
      'hasHeartDiseaseHistory',
      'heartDiseaseHistoryNotes',
      'hasThyroidDiseaseHistory',
      'thyroidDiseaseHistoryNotes',
      'hasAutoimmuneHistory',
      'autoimmuneHistoryNotes',
      'hasDiabetesHistory',
      'diabetesHistoryNotes',
      'hasAsthmaHistory',
      'asthmaHistoryNotes',
      'hasTuberculosisHistory',
      'tuberculosisHistoryNotes',
      'hasHepatitisBHistory',
      'hepatitisBHistoryNotes',
      'hasHivOrSyphilisHistory',
      'hivOrSyphilisHistoryNotes',
      'hasMentalHealthHistory',
      'mentalHealthHistoryNotes',
      'hasTwinPregnancyHistory',
      'twinPregnancyHistoryNotes',
      'hasCystMyomaTumorHistory',
      'cystMyomaTumorHistoryNotes',
      'hasSurgeryHistory',
      'surgeryHistoryNotes',
      'hasOtherDiseaseHistory',
      'otherDiseaseHistoryNotes',
      'otherDiseaseHistoryYear',
      'hasPreviousPregnancyHistory',
      'hasContraceptionHistory'
    ];
    questionnaireKeys.forEach((k) => {
      if (adaptivePreset[k] !== undefined) {
        currentStepValues[k] = adaptivePreset[k];
      }
    });
  }

  if (currentStepValues.motherBirthDate && adaptivePreset.motherAge) {
    currentStepValues.motherAge = adaptivePreset.motherAge;
  }
  if (currentStepValues.partnerName && adaptivePreset.partnerAge) {
    currentStepValues.partnerAge = adaptivePreset.partnerAge;
  }
  if (currentStepValues.heightCm && adaptivePreset.initialBmi) {
    currentStepValues.initialBmi = adaptivePreset.initialBmi;
  }

  dispatchAutofillEvent(flow, currentStepValues);
}

export function clearVisibleFields(presetValues: Record<string, string>, flow: string): void {
  const emptyValues = resolveAdaptiveClearValues(flow, presetValues);
  dispatchAutofillEvent(flow, emptyValues);
}

