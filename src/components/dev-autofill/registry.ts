import type { AutofillDefinition } from './types';
import { getPregnancyAutofillPreset } from './presets/pregnancy-preset';
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
      const preset = getPregnancyAutofillPreset();
      dispatchAutofillEvent('pregnancy', preset.values, preset.schedule);
      return true;
    },
    fillCurrentStep: () => {
      const preset = getPregnancyAutofillPreset();
      fillVisibleFields(preset.values, 'pregnancy');
      return true;
    },
    clear: () => {
      const preset = getPregnancyAutofillPreset();
      clearVisibleFields(preset.values, 'pregnancy');
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
