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
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    '[role="dialog"] input[id], [role="dialog"] textarea[id]'
  );

  inputs.forEach((input) => {
    if (input.id && presetValues[input.id] !== undefined) {
      currentStepValues[input.id] = presetValues[input.id];
    }
  });

  dispatchAutofillEvent(flow, currentStepValues);
}

export function clearVisibleFields(presetValues: Record<string, string>, flow: string): void {
  const emptyValues: Record<string, string> = {};
  Object.keys(presetValues).forEach((key) => {
    emptyValues[key] = '';
  });

  dispatchAutofillEvent(flow, emptyValues);
}
