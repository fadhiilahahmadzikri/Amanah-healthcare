import { z } from 'zod';

import type {
  MedicalFormField,
  MedicalFormSection
} from '../constants/medical-appointment-schemas';
import type { MedicalAppointmentValues } from '../utils/medical-appointment';

const nikFieldIds = new Set(['motherNik', 'partnerNik', 'childNik']);
const phoneFieldIds = new Set(['phoneNumber', 'parentPhone']);
const countFieldIds = new Set([
  'marriageOrder',
  'gravidaCount',
  'parityCount',
  'abortionCount',
  'livingChildrenCount'
]);
const yearFieldIds = new Set([
  'previousPregnancy1BirthYear',
  'previousPregnancy2BirthYear',
  'previousPregnancy3BirthYear',
  'previousPregnancy4BirthYear',
  'otherDiseaseHistoryYear'
]);

export function getMedicalFieldFormat(
  field: MedicalFormField
): 'nik' | 'phone' | 'count' | 'year' | 'text' {
  if (field.format) return field.format;
  if (nikFieldIds.has(field.id)) return 'nik';
  if (phoneFieldIds.has(field.id)) return 'phone';
  if (countFieldIds.has(field.id)) return 'count';
  if (yearFieldIds.has(field.id)) return 'year';
  return 'text';
}

export function getMedicalFieldValidationSchema(field: MedicalFormField) {
  return z.string().superRefine((value, context) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      if (field.required) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Wajib diisi'
        });
      }
      return;
    }

    const format = getMedicalFieldFormat(field);

    if (format === 'nik' && !/^\d{16}$/.test(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NIK harus 16 digit angka'
      });
      return;
    }

    if (format === 'phone') {
      const digits = trimmedValue.replace(/\D/g, '');

      if (digits.length < 8 || digits.length > 15) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor telepon harus 8-15 digit'
        });
        return;
      }
    }

    if (format === 'count' && !/^\d+$/.test(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Isi dengan angka'
      });
      return;
    }

    if (format === 'year') {
      const year = Number(trimmedValue);
      if (!/^\d{4}$/.test(trimmedValue) || year < 1900 || year > 2100) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tahun harus 4 digit angka (1900-2100)'
        });
        return;
      }
    }

    if (field.type === 'DATE' && !isValidIsoDate(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pilih tanggal yang valid'
      });
      return;
    }

    if (
      (field.type === 'LIST' || field.type === 'MULTIPLE_CHOICE') &&
      field.choices.length > 0 &&
      !field.choices.includes(trimmedValue)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pilih salah satu opsi'
      });
    }
  });
}

export function isMedicalSectionValid(
  section: MedicalFormSection | undefined,
  values: MedicalAppointmentValues
): boolean {
  if (!section) {
    return false;
  }

  return section.fields.every((field) => {
    if (field.visibleIf && !field.visibleIf(values)) {
      return true;
    }

    const isFieldValid = getMedicalFieldValidationSchema(field).safeParse(
      values[field.id] || ''
    ).success;
    if (!isFieldValid) {
      return false;
    }

    if (field.yearFieldId && (values[field.id] || '').trim() === 'Ya') {
      const yearVal = (values[field.yearFieldId] || '').trim();
      if (!yearVal) {
        return false;
      }
    }

    if (field.notesFieldId && (values[field.id] || '').trim() === 'Ya') {
      const notesVal = (values[field.notesFieldId] || '').trim();
      if (!notesVal) {
        return false;
      }
    }

    return true;
  });
}

export function normalizeMedicalFieldInput(field: MedicalFormField, value: string): string {
  const format = getMedicalFieldFormat(field);
  switch (format) {
    case 'nik':
      return value.replace(/\D/g, '').slice(0, 16);
    case 'phone':
      return value.replace(/\D/g, '').slice(0, 15);
    case 'count':
      return value.replace(/\D/g, '').slice(0, 2);
    case 'year':
      return value.replace(/\D/g, '').slice(0, 4);
    default:
      return value;
  }
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}
