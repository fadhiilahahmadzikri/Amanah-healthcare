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

  const currentStepValues: Record<string, string> = {};
  const visibleElements = document.querySelectorAll<HTMLElement>(
    '[role="dialog"] [id], [role="dialog"] [name], [role="dialog"] [data-field-id]'
  );

  visibleElements.forEach((el) => {
    const key = el.getAttribute('data-field-id') || el.id || el.getAttribute('name');
    if (key && presetValues[key] !== undefined) {
      currentStepValues[key] = presetValues[key];
    }
  });

  const inputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >('[role="dialog"] input, [role="dialog"] textarea, [role="dialog"] select');
  inputs.forEach((input) => {
    const key = input.id || input.name;
    if (key && presetValues[key] !== undefined) {
      currentStepValues[key] = presetValues[key];
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
      if (presetValues[k] !== undefined) {
        currentStepValues[k] = presetValues[k];
      }
    });
  }

  if (currentStepValues.motherBirthDate && presetValues.motherAge) {
    currentStepValues.motherAge = presetValues.motherAge;
  }
  if (currentStepValues.partnerName && presetValues.partnerAge) {
    currentStepValues.partnerAge = presetValues.partnerAge;
  }
  if (currentStepValues.heightCm && presetValues.initialBmi) {
    currentStepValues.initialBmi = presetValues.initialBmi;
  }

  dispatchAutofillEvent(flow, currentStepValues);
}

export function clearVisibleFields(presetValues: Record<string, string>, flow: string): void {
  const emptyValues: Record<string, string> = {};
  Object.keys(presetValues).forEach((key) => {
    emptyValues[key] = '';
  });

  dispatchAutofillEvent(flow, emptyValues);
}
