import type { AutofillDefinition } from './types';
import { PREGNANCY_AUTOFILL_PRESET, PREGNANCY_SCHEDULE_PRESET } from './presets/pregnancy-preset';
import { clearVisibleFields, dispatchAutofillEvent, fillVisibleFields } from './engine';

const registry: AutofillDefinition[] = [
  {
    id: 'pregnancy',
    name: 'Form Persalinan (KIA)',
    flow: 'pregnancy',
    detect: () => {
      if (typeof document === 'undefined') {
        return false;
      }
      return Boolean(
        document.getElementById('motherName') ||
        document.getElementById('motherNik') ||
        document.querySelector('[data-medical-flow="pregnancy"]')
      );
    },
    fillFull: () => {
      dispatchAutofillEvent('pregnancy', PREGNANCY_AUTOFILL_PRESET, PREGNANCY_SCHEDULE_PRESET);
      return true;
    },
    fillCurrentStep: () => {
      fillVisibleFields(PREGNANCY_AUTOFILL_PRESET, 'pregnancy');
      return true;
    },
    clear: () => {
      clearVisibleFields(PREGNANCY_AUTOFILL_PRESET, 'pregnancy');
    }
  }
];

export function getAutofillDefinitions(): readonly AutofillDefinition[] {
  return registry;
}

export function registerAutofillDefinition(def: AutofillDefinition): void {
  const existingIndex = registry.findIndex((item) => item.id === def.id);
  if (existingIndex !== -1) {
    registry[existingIndex] = def;
  } else {
    registry.push(def);
  }
}

export function detectActiveAutofillDefinition(): AutofillDefinition | null {
  for (const def of registry) {
    if (def.detect()) {
      return def;
    }
  }
  return null;
}
