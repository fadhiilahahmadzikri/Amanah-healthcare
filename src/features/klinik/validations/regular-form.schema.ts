import { z } from 'zod';
import type { EditableRegularData } from '../components/inspector/types';

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

export interface RegularValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegularForm(data: Partial<EditableRegularData>): RegularValidationResult {
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
