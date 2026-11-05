import { z } from 'zod';
import type { EditableMaternalData } from '../components/inspector/types';

export const maternalConditionItemZodSchema = z.object({
  conditionCode: z.string(),
  hasCondition: z.boolean(),
  diagnosisYear: z
    .number()
    .int('Tahun diagnosis harus berupa bilangan bulat')
    .min(1900, 'Tahun diagnosis minimal 1900')
    .max(
      new Date().getFullYear(),
      `Tahun diagnosis tidak boleh melebihi tahun ${new Date().getFullYear()}`
    )
    .nullable()
    .optional(),
  notes: z.string().nullable().optional()
});

export const maternalFormZodSchema = z.object({
  motherName: z.string().min(1, 'Nama lengkap ibu wajib diisi'),
  motherNik: z
    .string()
    .regex(/^\d{16}$/, { message: 'NIK ibu harus berupa 16 digit angka' })
    .optional()
    .or(z.literal('')),
  partnerNik: z
    .string()
    .regex(/^\d{16}$/, { message: 'NIK suami harus berupa 16 digit angka' })
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, { message: 'Nomor telepon tidak valid' })
    .optional()
    .or(z.literal('')),
  partnerPhone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, {
      message: 'Nomor HP suami tidak valid'
    })
    .optional()
    .or(z.literal('')),
  conditionResponses: z.array(maternalConditionItemZodSchema).optional()
});

export interface MaternalValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMaternalForm(data: Partial<EditableMaternalData>): MaternalValidationResult {
  let birthYear: number | null = null;
  if (data.motherBirthDate) {
    const parsed = new Date(data.motherBirthDate).getFullYear();
    if (!Number.isNaN(parsed)) birthYear = parsed;
  }
  const currentYear = new Date().getFullYear();

  const result = maternalFormZodSchema.safeParse({
    motherName: data.motherName ?? '',
    motherNik: data.motherNik ? data.motherNik.trim() : '',
    partnerNik: data.partnerNik ? data.partnerNik.trim() : '',
    phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : '',
    partnerPhone: data.partnerPhone ? data.partnerPhone.trim() : '',
    conditionResponses: data.conditionResponses
  });

  const errors: Record<string, string> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field === 'conditionResponses' && issue.path.length >= 3) {
        const index = issue.path[1] as number;
        const subfield = issue.path[2] as string;
        const conditionItem = data.conditionResponses?.[index];
        if (conditionItem?.conditionCode && subfield === 'diagnosisYear') {
          const specificKey = `condition_${conditionItem.conditionCode}_year`;
          errors[specificKey] = issue.message;
        }
      }
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    });
  }

  // Cross-field validation: diagnosisYear must not precede mother's birth year
  if (data.conditionResponses && Array.isArray(data.conditionResponses)) {
    for (const c of data.conditionResponses) {
      if (c.hasCondition && c.diagnosisYear) {
        if (birthYear && c.diagnosisYear < birthYear) {
          const msg = `Tahun diagnosis (${c.diagnosisYear}) tidak boleh lebih awal dari tahun kelahiran ibu (${birthYear})`;
          errors[`condition_${c.conditionCode}_year`] = msg;
          if (!errors.conditionResponses) {
            errors.conditionResponses = msg;
          }
        } else if (c.diagnosisYear > currentYear) {
          const msg = `Tahun diagnosis (${c.diagnosisYear}) tidak boleh melebihi tahun ${currentYear}`;
          errors[`condition_${c.conditionCode}_year`] = msg;
          if (!errors.conditionResponses) {
            errors.conditionResponses = msg;
          }
        }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

export type MaternityInspectorTab = 'identitas' | 'obstetri' | 'klinis' | 'skrining';

export function getMaternityTabWithErrors(
  errors: Record<string, string>
): MaternityInspectorTab | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;

  const identitasKeys = [
    'motherName',
    'motherNik',
    'motherBirthDate',
    'phoneNumber',
    'religion',
    'motherEducation',
    'motherJob',
    'marriageOrder',
    'marriageDate',
    'partnerName',
    'partnerNik',
    'partnerBirthDate',
    'partnerAge',
    'partnerJob',
    'partnerEducation',
    'partnerBloodType',
    'partnerPhone',
    'domicileAddress',
    'identityCardAddress',
    'dasawisma',
    'posyandu',
    'puskesmas'
  ];

  const obstetriKeys = [
    'hpht',
    'estimatedDueDate',
    'gestationalAgeWeeks',
    'gravidaCount',
    'parityCount',
    'abortionCount',
    'livingChildrenCount',
    'previousPregnancies'
  ];

  const klinisKeys = [
    'heightCm',
    'prePregnancyWeightKg',
    'upperArmCircumferenceCm',
    'initialBmi',
    'tetanusStatus',
    'motherBloodType',
    'contraceptiveHistories'
  ];

  for (const key of errorKeys) {
    if (identitasKeys.includes(key)) return 'identitas';
  }
  for (const key of errorKeys) {
    if (obstetriKeys.includes(key)) return 'obstetri';
  }
  for (const key of errorKeys) {
    if (klinisKeys.includes(key)) return 'klinis';
  }
  for (const key of errorKeys) {
    if (key.startsWith('condition_') || key === 'conditionResponses') return 'skrining';
  }

  return 'identitas';
}
