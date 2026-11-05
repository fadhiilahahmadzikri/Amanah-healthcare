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

export const maternalPreviousPregnancyZodSchema = z.object({
  orderNumber: z.number().int().optional(),
  birthYear: z.string().max(16, 'Tahun persalinan maksimal 16 karakter').nullable().optional(),
  birthWeightGrams: z
    .number()
    .int('Berat lahir harus berupa angka bulat dalam gram')
    .min(0, 'Berat lahir minimal 0 gram')
    .max(30000, 'Berat lahir maksimal 30.000 gram')
    .nullable()
    .optional(),
  birthLengthCm: z
    .number()
    .min(0, 'Panjang badan lahir minimal 0 cm')
    .max(250, 'Panjang badan lahir maksimal 250 cm')
    .nullable()
    .optional(),
  childSex: z.string().nullable().optional(),
  gestationalAgeAtBirth: z.string().max(64).nullable().optional(),
  birthAttendant: z.string().max(128).nullable().optional(),
  deliveryMethod: z.string().max(64).nullable().optional(),
  deliveryPlace: z.string().max(128).nullable().optional(),
  complications: z.string().nullable().optional()
});

export const maternalContraceptiveHistoryZodSchema = z.object({
  orderNumber: z.number().int().optional(),
  startDate: z.string().nullable().optional(),
  contraceptiveType: z.string().max(64, 'Jenis KB maksimal 64 karakter').nullable().optional(),
  durationText: z.string().max(64, 'Lama pemakaian maksimal 64 karakter').nullable().optional(),
  stopDate: z.string().nullable().optional(),
  problems: z.string().nullable().optional(),
  sideEffects: z.string().nullable().optional()
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
  heightCm: z
    .number()
    .min(0, 'Tinggi badan minimal 0 cm')
    .max(300, 'Tinggi badan maksimal 300 cm')
    .nullable()
    .optional(),
  prePregnancyWeightKg: z
    .number()
    .min(0, 'Berat badan minimal 0 kg')
    .max(500, 'Berat badan maksimal 500 kg')
    .nullable()
    .optional(),
  upperArmCircumferenceCm: z
    .number()
    .min(0, 'Lingkar lengan atas minimal 0 cm')
    .max(150, 'Lingkar lengan atas maksimal 150 cm')
    .nullable()
    .optional(),
  initialBmi: z
    .number()
    .min(0, 'BMI minimal 0')
    .max(150, 'BMI maksimal 150')
    .nullable()
    .optional(),
  gestationalAgeWeeks: z
    .number()
    .min(0, 'Usia kehamilan minimal 0 minggu')
    .max(60, 'Usia kehamilan maksimal 60 minggu')
    .nullable()
    .optional(),
  gravidaCount: z.number().int().min(1, 'Gravida minimal 1').max(50, 'Gravida maksimal 50').optional(),
  parityCount: z.number().int().min(0, 'Paritas minimal 0').max(50, 'Paritas maksimal 50').optional(),
  abortionCount: z.number().int().min(0, 'Abortus minimal 0').max(50, 'Abortus maksimal 50').optional(),
  livingChildrenCount: z
    .number()
    .int()
    .min(0, 'Jumlah anak hidup minimal 0')
    .max(50, 'Jumlah anak hidup maksimal 50')
    .optional(),
  previousPregnancies: z.array(maternalPreviousPregnancyZodSchema).optional(),
  contraceptiveHistories: z.array(maternalContraceptiveHistoryZodSchema).optional(),
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

  const parseNumber = (val: unknown): number | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const parsedPreviousPregnancies = data.previousPregnancies?.map((p) => ({
    orderNumber: p.orderNumber,
    birthYear: p.birthYear ? String(p.birthYear).trim() : null,
    birthWeightGrams: parseNumber(p.birthWeightGrams),
    birthLengthCm: parseNumber(p.birthLengthCm),
    childSex: p.childSex || null,
    gestationalAgeAtBirth: p.gestationalAgeAtBirth || null,
    birthAttendant: p.birthAttendant || null,
    deliveryMethod: p.deliveryMethod || null,
    deliveryPlace: p.deliveryPlace || null,
    complications: p.complications || null
  }));

  const parsedContraceptiveHistories = data.contraceptiveHistories?.map((c) => ({
    orderNumber: c.orderNumber,
    startDate: c.startDate || null,
    contraceptiveType: c.contraceptiveType || null,
    durationText: c.durationText || null,
    stopDate: c.stopDate || null,
    problems: c.problems || null,
    sideEffects: c.sideEffects || null
  }));

  const result = maternalFormZodSchema.safeParse({
    motherName: data.motherName ?? '',
    motherNik: data.motherNik ? data.motherNik.trim() : '',
    partnerNik: data.partnerNik ? data.partnerNik.trim() : '',
    phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : '',
    partnerPhone: data.partnerPhone ? data.partnerPhone.trim() : '',
    heightCm: parseNumber(data.heightCm),
    prePregnancyWeightKg: parseNumber(data.prePregnancyWeightKg),
    upperArmCircumferenceCm: parseNumber(data.upperArmCircumferenceCm),
    initialBmi: parseNumber(data.initialBmi),
    gestationalAgeWeeks: parseNumber(data.gestationalAgeWeeks),
    gravidaCount: parseNumber(data.gravidaCount) ?? 1,
    parityCount: parseNumber(data.parityCount) ?? 0,
    abortionCount: parseNumber(data.abortionCount) ?? 0,
    livingChildrenCount: parseNumber(data.livingChildrenCount) ?? 0,
    previousPregnancies: parsedPreviousPregnancies,
    contraceptiveHistories: parsedContraceptiveHistories,
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
      } else if (field === 'previousPregnancies' && issue.path.length >= 3) {
        const index = issue.path[1] as number;
        const subfield = issue.path[2] as string;
        errors[`prev_preg_${index}_${subfield}`] = issue.message;
        if (!errors.previousPregnancies) {
          errors.previousPregnancies = issue.message;
        }
      } else if (field && !errors[field]) {
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
    if (obstetriKeys.includes(key) || key.startsWith('prev_preg_')) return 'obstetri';
  }
  for (const key of errorKeys) {
    if (klinisKeys.includes(key) || key.startsWith('contra_')) return 'klinis';
  }
  for (const key of errorKeys) {
    if (key.startsWith('condition_') || key === 'conditionResponses') return 'skrining';
  }

  return 'identitas';
}
