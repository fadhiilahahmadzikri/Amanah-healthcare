import type { AutofillPayload, AutofillSchedule } from './types';

export const AUTOFILL_EVENT_NAME = 'devtool:autofill';

export function injectNativeInputValue(element: HTMLElement, value: string): void {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const valueSetter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

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

  Object.entries(values).forEach(([fieldId, val]) => {
    const el = document.getElementById(fieldId);
    if (el) {
      injectNativeInputValue(el, val);
    }
  });
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
      injectNativeInputValue(input, presetValues[input.id]);
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
