import { z } from 'zod';
import type {
  EditableRegularData,
  EditableMaternalData,
  EditableImmunizationData
} from '../components/inspector/types';

export const regularFormZodSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  nik: z
    .string()
    .regex(/^\d{16}$/, { message: 'NIK harus berupa 16 digit angka' })
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, { message: 'Nomor telepon tidak valid' })
    .optional()
    .or(z.literal('')),
  email: z.string().email({ message: 'Format email tidak valid' }).optional().or(z.literal(''))
});

export const conditionResponseItemZodSchema = z.object({
  conditionCode: z.string(),
  hasCondition: z.boolean(),
  diagnosisYear: z
    .number()
    .int('Tahun diagnosis harus berupa bilangan bulat')
    .min(1900, 'Tahun diagnosis minimal 1900')
    .max(
      new Date().getFullYear(),
      'Tahun diagnosis tidak boleh melebihi tahun saat ini'
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
  conditionResponses: z.array(conditionResponseItemZodSchema).optional()
});

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

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegularForm(data: Partial<EditableRegularData>): ValidationResult {
  const result = regularFormZodSchema.safeParse({
    fullName: data.fullName ?? '',
    nik: data.nik ? data.nik.trim() : '',
    phone: data.phone ? data.phone.trim() : '',
    email: data.email ? data.email.trim() : ''
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

export function validateMaternalForm(data: Partial<EditableMaternalData>): ValidationResult {
  let birthYear: number | null = null;
  if (data.motherBirthDate) {
    const parsed = new Date(data.motherBirthDate).getFullYear();
    if (!Number.isNaN(parsed)) birthYear = parsed;
  }

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
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    });
  }

  if (data.conditionResponses && birthYear) {
    for (const c of data.conditionResponses) {
      if (c.hasCondition && c.diagnosisYear && c.diagnosisYear < birthYear) {
        errors.conditionResponses = `Tahun diagnosis (${c.diagnosisYear}) tidak boleh lebih awal dari tahun kelahiran ibu (${birthYear})`;
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

export function validateImmunizationForm(
  data: Partial<EditableImmunizationData>
): ValidationResult {
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
