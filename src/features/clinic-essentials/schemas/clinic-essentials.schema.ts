import { z } from 'zod';

export const createUnitTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama tipe unit tidak boleh kosong')
    .max(100, 'Nama tipe unit maksimal 100 karakter'),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode tipe unit harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode tipe unit maksimal 64 karakter')
    .optional(),
  description: z.string().trim().max(255).optional(),
  iconName: z.string().trim().max(64).default('building-2'),
  isActive: z.boolean().default(true)
});

export type CreateUnitTypeFormValues = z.infer<typeof createUnitTypeSchema>;

export const createUnitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama unit tidak boleh kosong')
    .max(150, 'Nama unit maksimal 150 karakter'),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode unit harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode unit maksimal 64 karakter')
    .optional(),
  unitTypeId: z.string().uuid('Silakan pilih tipe unit yang valid'),
  queuePrefix: z.string().trim().max(8, 'Prefix antrean maksimal 8 karakter').optional(),
  iconName: z.string().trim().max(64).default('building-2'),
  location: z.string().trim().max(255).optional(),
  floor: z.string().trim().max(20).optional(),
  isActive: z.boolean().default(true)
});

export type CreateUnitFormValues = z.infer<typeof createUnitSchema>;
