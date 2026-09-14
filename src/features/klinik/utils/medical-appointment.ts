import type { MedicalAppointmentFlow, MedicalIntakeRecord } from '../api/types';
import {
  getMedicalFlowDefinition,
  type MedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const previousPregnancySectionIds = new Set([
  'previousPregnancy1Details',
  'previousPregnancy2Details',
  'previousPregnancy3Details',
  'previousPregnancy4Details'
]);

const contraceptionSectionIds = new Set([
  'contraception1Details',
  'contraception2Details',
  'contraception3Details',
  'contraception4Details'
]);

export type MedicalAppointmentValues = Record<string, string>;

export interface MedicalAnswerSummary {
  id: string;
  label: string;
  value: string;
}

export function buildDefaultMedicalValues(definition: MedicalFlowDefinition) {
  return definition.sections.reduce<MedicalAppointmentValues>((values, section) => {
    section.fields.forEach((field) => {
      values[field.id] = '';
    });
    return values;
  }, {});
}

export function getActiveMedicalSections(
  definition: MedicalFlowDefinition,
  values: MedicalAppointmentValues
): MedicalFormSection[] {
  return definition.sections.filter((section) => {
    if (section.id === 'closing') {
      return false;
    }

    if (previousPregnancySectionIds.has(section.id)) {
      return values.hasPreviousPregnancyHistory === 'Ya, ada';
    }

    if (contraceptionSectionIds.has(section.id)) {
      return values.hasContraceptionHistory === 'Ya, pernah';
    }

    return true;
  });
}

export function isSectionComplete(
  section: MedicalFormSection,
  values: MedicalAppointmentValues
): boolean {
  return section.fields.every((field) => {
    if (!field.required) {
      return true;
    }

    return Boolean((values[field.id] || '').trim());
  });
}

export function collectAnsweredFields(
  definition: MedicalFlowDefinition,
  values: MedicalAppointmentValues
): MedicalAnswerSummary[] {
  const activeSections = getActiveMedicalSections(definition, values);

  return activeSections.flatMap((section) =>
    section.fields
      .map((field) => ({
        id: field.id,
        label: field.label,
        value: values[field.id] || ''
      }))
      .filter((answer) => answer.value.trim().length > 0)
  );
}

export function buildMedicalIntakeRecord(params: {
  definition: MedicalFlowDefinition;
  values: MedicalAppointmentValues;
}): MedicalIntakeRecord {
  const submittedAt = new Date();

  return {
    flow: params.definition.flow,
    schemaTitle: params.definition.formTitle,
    submittedAt: formatIndonesianDate(submittedAt),
    answersByFieldId: params.values,
    automatic: buildAutomaticRecord(params.definition.flow, params.values, submittedAt)
  };
}

export function buildAutomaticRecord(
  flow: MedicalAppointmentFlow,
  values: MedicalAppointmentValues,
  submittedAt = new Date()
): Record<string, string> {
  if (flow === 'pregnancy') {
    return buildPregnancyAutomaticRecord(values, submittedAt);
  }

  return buildImmunizationAutomaticRecord(values, submittedAt);
}

export function getMedicalFieldLabel(flow: MedicalAppointmentFlow, fieldId: string): string {
  const definition = getMedicalFlowDefinition(flow);
  const field = findMedicalField(definition, fieldId);

  return field?.label || fieldId;
}

export function findMedicalField(
  definition: MedicalFlowDefinition,
  fieldId: string
): MedicalFormField | undefined {
  for (const section of definition.sections) {
    const field = section.fields.find((item) => item.id === fieldId);

    if (field) {
      return field;
    }
  }

  return undefined;
}

export function calculateBmi(weightStr?: string, heightStr?: string): string {
  if (!weightStr || !heightStr) {
    return '';
  }

  const cleanWeightMatch = weightStr.replace(',', '.').match(/(\d+(\.\d+)?)/);
  const cleanHeightMatch = heightStr.replace(',', '.').match(/(\d+(\.\d+)?)/);

  if (!cleanWeightMatch || !cleanHeightMatch) {
    return '';
  }

  const weight = parseFloat(cleanWeightMatch[1]);
  let height = parseFloat(cleanHeightMatch[1]);

  if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
    return '';
  }

  if (height > 3) {
    height = height / 100;
  }

  if (height <= 0) {
    return '';
  }

  const bmi = weight / (height * height);
  if (!isFinite(bmi) || bmi <= 0 || bmi > 100) {
    return '';
  }

  return (Math.round(bmi * 10) / 10).toFixed(1);
}

export function calculateAgeInYears(
  birthDateStr?: string,
  referenceDate: Date = new Date()
): string {
  if (!birthDateStr) {
    return '';
  }

  try {
    let birthDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) {
      birthDate = toDateOnly(birthDateStr);
    } else {
      const match = birthDateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (match) {
        birthDate = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
      } else {
        const parsed = new Date(birthDateStr);
        if (isNaN(parsed.getTime())) {
          return '';
        }
        birthDate = toDateOnly(parsed);
      }
    }

    const reference = toDateOnly(referenceDate);
    if (reference.getTime() < birthDate.getTime()) {
      return '';
    }

    let age = reference.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = reference.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && reference.getUTCDate() < birthDate.getUTCDate())) {
      age -= 1;
    }

    if (age >= 0 && age < 130) {
      return `${age} tahun`;
    }

    return '';
  } catch {
    return '';
  }
}

function buildPregnancyAutomaticRecord(
  values: MedicalAppointmentValues,
  submittedAt: Date
): Record<string, string> {
  const bmi = calculateBmi(values.prePregnancyWeightKg, values.heightCm) || values.initialBmi || '';
  const result: Record<string, string> = {
    imtAtSubmit: bmi ? `${bmi} kg/m²` : ''
  };

  if (!values.hpht) {
    return {
      estimatedDueDate: '',
      gestationalAgeAtSubmit: '',
      ...result
    };
  }

  try {
    const dueDate = calculateEstimatedDueDate(values.hpht);
    const gestationalAge = calculateGestationalAge(values.hpht, submittedAt);

    return {
      estimatedDueDate: formatIndonesianDate(dueDate),
      gestationalAgeAtSubmit: gestationalAge,
      ...result
    };
  } catch {
    return {
      estimatedDueDate: '',
      gestationalAgeAtSubmit: '',
      ...result
    };
  }
}

function buildImmunizationAutomaticRecord(
  values: MedicalAppointmentValues,
  submittedAt: Date
): Record<string, string> {
  if (!values.childBirthDate) {
    return {
      childAgeAtSubmit: ''
    };
  }

  try {
    return {
      childAgeAtSubmit: calculateChildAge(values.childBirthDate, submittedAt)
    };
  } catch {
    return {
      childAgeAtSubmit: ''
    };
  }
}

function calculateEstimatedDueDate(value: string): Date {
  const hpht = toDateOnly(value);

  return new Date(
    Date.UTC(hpht.getUTCFullYear() + 1, hpht.getUTCMonth() - 3, hpht.getUTCDate() + 7)
  );
}

function calculateGestationalAge(value: string, referenceDate: Date): string {
  const hpht = toDateOnly(value);
  const reference = toDateOnly(referenceDate);
  const totalDays = Math.floor((reference.getTime() - hpht.getTime()) / DAY_IN_MS);

  if (totalDays < 0) {
    throw new Error('HPHT tidak boleh setelah tanggal submit.');
  }

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return `${weeks} minggu ${days} hari`;
}

function calculateChildAge(value: string, referenceDate: Date): string {
  const birthDate = toDateOnly(value);
  const reference = toDateOnly(referenceDate);

  if (reference.getTime() < birthDate.getTime()) {
    throw new Error('Tanggal lahir anak tidak boleh setelah tanggal submit.');
  }

  let years = reference.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = reference.getUTCMonth() - birthDate.getUTCMonth();
  let days = reference.getUTCDate() - birthDate.getUTCDate();

  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 0)).getUTCDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return `${years} tahun ${months} bulan ${days} hari`;
  }

  if (months > 0) {
    return `${months} bulan ${days} hari`;
  }

  return `${days} hari`;
}

function formatIndonesianDate(value: Date): string {
  const date = toDateOnly(value);
  const day = date.getUTCDate();
  const month = INDONESIAN_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

function toDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error('Tanggal harus berupa Date atau teks YYYY-MM-DD.');
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}
