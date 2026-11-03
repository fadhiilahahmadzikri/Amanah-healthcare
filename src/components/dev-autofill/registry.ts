import { resolveAdaptiveAutofillValues } from './adaptive-autofill';
import type { AutofillDefinition } from './types';
import { getPregnancyAutofillPreset } from './presets/pregnancy-preset';
import { getImmunizationAutofillPreset } from './presets/immunization-preset';
import { getRegularPatientAutofillPreset } from './presets/regular-patient-preset';
import { clearVisibleFields, dispatchAutofillEvent, fillVisibleFields } from './engine';

const registry: AutofillDefinition[] = [
  {
    id: 'regular-patient',
    name: 'Form Pasien Standar',
    flow: 'regular-patient',
    detect: () => {
      if (typeof document === 'undefined') {
        return false;
      }
      return Boolean(
        document.querySelector('[data-autofill-flow="regular-patient"]') ||
        document.querySelector('[data-patient-flow="regular"]') ||
        document.getElementById('patient-fullname') ||
        document.getElementById('patient-nik')
      );
    },
    fillFull: () => {
      const preset = getRegularPatientAutofillPreset();
      dispatchAutofillEvent('regular-patient', preset.values, undefined, 12);
      return true;
    },
    fillCurrentStep: () => {
      const preset = getRegularPatientAutofillPreset();
      fillVisibleFields(preset.values, 'regular-patient');
      return true;
    },
    clear: () => {
      const emptyValues: Record<string, string> = {
        relationship: '',
        fullName: '',
        nik: '',
        motherName: '',
        placeOfBirth: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        line1: '',
        provinceName: '',
        provinceCode: '',
        regencyName: '',
        regencyCode: '',
        districtName: '',
        districtCode: '',
        villageName: '',
        villageCode: '',
        occupationCode: '',
        name: '',
        nama_ibu_kandung: '',
        tempat_lahir: '',
        birth_date: '',
        blood_type: '',
        provinsi: '',
        provinsi_id: '',
        kabupaten: '',
        kabupaten_id: '',
        kecamatan: '',
        kecamatan_id: '',
        kelurahan: '',
        kelurahan_id: '',
        alamat_detail: '',
        pekerjaan: ''
      };
      dispatchAutofillEvent('regular-patient', emptyValues, undefined, 1);
    }
  },
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
      const adaptiveValues = resolveAdaptiveAutofillValues('pregnancy', preset.values);
      dispatchAutofillEvent('pregnancy', adaptiveValues, preset.schedule);
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
  },
  {
    id: 'immunization',
    name: 'Form Imunisasi Anak (KIA)',
    flow: 'immunization',
    detect: () => {
      if (typeof document === 'undefined') {
        return false;
      }
      return Boolean(
        document.getElementById('childName') ||
        document.getElementById('childNik') ||
        document.querySelector('[data-medical-flow="immunization"]')
      );
    },
    fillFull: () => {
      const preset = getImmunizationAutofillPreset();
      const adaptiveValues = resolveAdaptiveAutofillValues('immunization', preset.values);
      dispatchAutofillEvent('immunization', adaptiveValues, preset.schedule);
      return true;
    },
    fillCurrentStep: () => {
      const preset = getImmunizationAutofillPreset();
      fillVisibleFields(preset.values, 'immunization');
      return true;
    },
    clear: () => {
      const preset = getImmunizationAutofillPreset();
      clearVisibleFields(preset.values, 'immunization');
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
