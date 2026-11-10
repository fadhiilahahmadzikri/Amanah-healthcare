import { z } from 'zod';
import { GENDER } from '@/constants/gender.constants';

export const staffProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Nama lengkap wajib diisi minimal 2 karakter'),
  nationalId: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || /^\d{16}$/.test(val),
      'NIK harus berupa tepat 16 digit angka numerik'
    )
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || val.length >= 8,
      'Nomor telepon minimal 8 digit'
    )
    .optional()
    .or(z.literal('')),
  profession: z.string().optional().or(z.literal('')),
  birthPlace: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z
    .enum([GENDER.MALE, GENDER.FEMALE])
    .optional()
    .nullable()
    .or(z.literal('')),
  poliklinikId: z.string().optional().or(z.literal('')),
  licenseNumber: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true)
});

export type StaffProfileSchemaValues = z.infer<typeof staffProfileSchema>;
