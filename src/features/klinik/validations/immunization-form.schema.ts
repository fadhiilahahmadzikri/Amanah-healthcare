import { z } from 'zod';
import type { EditableImmunizationData } from '../components/inspector/types';

export const immunizationFormZodSchema = z.object({
  childName: z.string().min(1, 'Nama lengkap anak wajib diisi'),
  childNik: z
    .string()
    .regex(/^\d{16}$/, { message: 'NIK anak harus berupa 16 digit angka' })
    .optional()
    .or(z.literal('')),
  parentPhone: z
    .string()
    .min(1, 'Nomor HP orang tua wajib diisi')
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, {
      message: 'Nomor HP orang tua tidak valid'
    })
});

export interface ImmunizationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateImmunizationForm(
  data: Partial<EditableImmunizationData>
): ImmunizationValidationResult {
  const result = immunizationFormZodSchema.safeParse({
    childName: data.childName ?? '',
    childNik: data.childNik ? data.childNik.trim() : '',
    parentPhone: data.parentPhone ? data.parentPhone.trim() : ''
  });

  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { isValid: false, errors };
}

export type ImmunizationInspectorTab = 'identitas' | 'orang-tua' | 'riwayat' | 'trajektori';

export function getImmunizationTabWithErrors(
  errors: Record<string, string>
): ImmunizationInspectorTab | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;

  const identitasKeys = ['childName', 'childNik', 'childBirthDate', 'childSex'];
  const parentKeys = ['parentPhone', 'fatherName', 'motherName', 'childAddress'];
  const riwayatKeys = ['previousVaccineHistory', 'childAllergyHistory'];

  for (const key of errorKeys) {
    if (identitasKeys.includes(key)) return 'identitas';
  }
  for (const key of errorKeys) {
    if (parentKeys.includes(key)) return 'orang-tua';
  }
  for (const key of errorKeys) {
    if (riwayatKeys.includes(key)) return 'riwayat';
  }

  return 'trajektori';
}
