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

    if (nikFieldIds.has(field.id) && !/^\d{16}$/.test(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NIK harus 16 digit angka'
      });
      return;
    }

    if (phoneFieldIds.has(field.id)) {
      const digits = trimmedValue.replace(/\D/g, '');

      if (digits.length < 8 || digits.length > 15) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor telepon harus 8-15 digit'
        });
        return;
      }
    }

    if (countFieldIds.has(field.id) && !/^\d+$/.test(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Isi dengan angka'
      });
      return;
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

  return section.fields.every(
    (field) => getMedicalFieldValidationSchema(field).safeParse(values[field.id] || '').success
  );
}

export function normalizeMedicalFieldInput(field: MedicalFormField, value: string): string {
  if (nikFieldIds.has(field.id)) {
    return value.replace(/\D/g, '').slice(0, 16);
  }

  return value;
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
