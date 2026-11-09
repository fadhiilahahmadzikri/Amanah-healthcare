import { z } from 'zod';
import type { EditableRegularData } from '../components/inspector/types';

export const regularFormZodSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi'),
    complaint: z.string().trim().min(1, 'Keluhan utama wajib diisi').optional(),
    birthDate: z.string().trim().min(1, 'Tanggal lahir wajib diisi').optional(),
    gender: z.string().trim().min(1, 'Jenis kelamin wajib dipilih').optional(),
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
      .refine(
        (val) =>
          !val ||
          val === '' ||
          /^(\+62|62|0)[0-9]{8,15}$/.test(val.replace(/[\s-]/g, '')),
        { message: 'Nomor telepon tidak valid' }
      ),
    email: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) =>
          !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        { message: 'Format email tidak valid' }
      ),
    emergencyContactName: z.string().trim().nullable().optional(),
    emergencyContactPhone: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) =>
          !val ||
          val === '' ||
          /^(\+62|62|0)[0-9]{8,15}$/.test(val.replace(/[\s-]/g, '')),
        { message: 'Nomor telepon kontak darurat tidak valid' }
      ),
    emergencyContactRelationship: z.string().trim().nullable().optional(),
    relationshipType: z.string().trim().nullable().optional(),
    birthPlace: z.string().trim().nullable().optional(),
    motherName: z.string().trim().nullable().optional(),
    occupation: z.string().trim().nullable().optional(),
    bloodType: z.string().trim().nullable().optional(),
    line1: z.string().trim().nullable().optional(),
    address: z.string().trim().nullable().optional()
  })
  .superRefine((data, ctx) => {
    const hasEmgName = Boolean(
      data.emergencyContactName && data.emergencyContactName.trim().length > 0
    );
    const hasEmgPhone = Boolean(
      data.emergencyContactPhone && data.emergencyContactPhone.trim().length > 0
    );

    if (hasEmgName && !hasEmgPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nomor telepon kontak darurat wajib diisi jika nama diisi',
        path: ['emergencyContactPhone']
      });
    }

    if (hasEmgPhone && !hasEmgName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama kontak darurat wajib diisi jika nomor telepon diisi',
        path: ['emergencyContactName']
      });
    }
  });

export interface RegularValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegularForm(
  data: Partial<EditableRegularData>
): RegularValidationResult {
  const result = regularFormZodSchema.safeParse({
    fullName: data.fullName !== undefined ? data.fullName.trim() : '',
    complaint: data.complaint !== undefined ? data.complaint.trim() : undefined,
    birthDate: data.birthDate !== undefined ? data.birthDate.trim() : undefined,
    gender: data.gender !== undefined ? data.gender.trim() : undefined,
    nik: data.nik ? data.nik.trim() : null,
    phone: data.phone ? data.phone.trim() : null,
    email: data.email ? data.email.trim() : null,
    emergencyContactName: data.emergencyContactName
      ? data.emergencyContactName.trim()
      : null,
    emergencyContactPhone: data.emergencyContactPhone
      ? data.emergencyContactPhone.trim()
      : null,
    emergencyContactRelationship: data.emergencyContactRelationship
      ? data.emergencyContactRelationship.trim()
      : null,
    relationshipType: data.relationshipType
      ? data.relationshipType.trim()
      : null,
    birthPlace: data.birthPlace ? data.birthPlace.trim() : null,
    motherName: data.motherName ? data.motherName.trim() : null,
    occupation: data.occupation ? data.occupation.trim() : null,
    bloodType: data.bloodType ? data.bloodType.trim() : null,
    line1: data.line1 ? data.line1.trim() : null,
    address: data.address ? data.address.trim() : null
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
