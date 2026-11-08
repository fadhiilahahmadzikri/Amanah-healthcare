import { z } from 'zod';
import type { EditableRegularData } from '../components/inspector/types';

export const regularFormZodSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  nik: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => !val || val === '' || /^\d{16}$/.test(val), {
      message: 'NIK harus berupa 16 digit angka'
    }),
  phone: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => !val || val === '' || /^(\+62|62|0)[0-9]{8,15}$/.test(val), {
      message: 'Nomor telepon tidak valid'
    }),
  email: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Format email tidak valid'
    })
});

export interface RegularValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegularForm(data: Partial<EditableRegularData>): RegularValidationResult {
  const result = regularFormZodSchema.safeParse({
    fullName: data.fullName ?? '',
    nik: data.nik ? data.nik.trim() : null,
    phone: data.phone ? data.phone.trim() : null,
    email: data.email ? data.email.trim() : null
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
