import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap pengguna wajib diisi minimal 2 karakter'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val.length === 0 || val.length >= 8,
      'Nomor telepon minimal 8 digit'
    )
    .optional()
    .nullable()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  roleIds: z.array(z.string()).default([])
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
