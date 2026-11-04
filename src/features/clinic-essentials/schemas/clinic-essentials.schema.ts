import { z } from 'zod';

export const createUnitTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama tipe unit tidak boleh kosong')
    .max(100, 'Nama tipe unit maksimal 100 karakter')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama tipe unit hanya boleh berisi huruf, angka, spasi, atau tanda hubung (-)'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode tipe unit harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode tipe unit maksimal 64 karakter')
    .optional(),
  description: z.string().trim().max(255, 'Keterangan maksimal 255 karakter').optional(),
  iconName: z.string().trim().max(64).default('layers'),
  isActive: z.boolean().default(true)
});

export type CreateUnitTypeFormValues = z.infer<typeof createUnitTypeSchema>;

export const createUnitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama unit poliklinik tidak boleh kosong')
    .max(150, 'Nama unit maksimal 150 karakter')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama unit hanya boleh berisi huruf, angka, spasi, atau tanda hubung (-)'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode unit harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode unit maksimal 64 karakter')
    .optional(),
  unitTypeId: z.string().uuid('Silakan pilih tipe klasifikasi unit yang valid'),
  queuePrefix: z
    .string()
    .trim()
    .max(8, 'Prefix antrean maksimal 8 karakter')
    .regex(/^[A-Za-z0-9]*$/, 'Prefix antrean hanya boleh berisi huruf atau angka')
    .optional(),
  iconName: z.string().trim().max(64).default('building-2'),
  location: z.string().trim().max(255, 'Lokasi maksimal 255 karakter').optional(),
  floor: z.string().trim().max(20, 'Lantai maksimal 20 karakter').optional(),
  isActive: z.boolean().default(true)
});

export type CreateUnitFormValues = z.infer<typeof createUnitSchema>;

export const createRoomSchema = z.object({
  unitId: z.string().uuid('Silakan pilih poliklinik induk ruangan'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama ruangan tidak boleh kosong')
    .max(100, 'Nama ruangan maksimal 100 karakter')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama ruangan hanya boleh berisi huruf, angka, spasi, atau tanda hubung (-)'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode ruangan harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode ruangan maksimal 64 karakter')
    .optional(),
  location: z.string().trim().max(255, 'Lokasi maksimal 255 karakter').optional(),
  floor: z.string().trim().max(20, 'Lantai maksimal 20 karakter').optional(),
  isActive: z.boolean().default(true)
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama kelompok layanan tidak boleh kosong')
    .max(128, 'Nama kelompok layanan maksimal 128 karakter')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama kelompok layanan hanya boleh berisi huruf, angka, spasi, atau tanda hubung (-)'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode kategori harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode kategori maksimal 64 karakter')
    .optional(),
  unitId: z.string().optional(),
  unitIds: z.array(z.string()).optional(),
  codePrefix: z
    .string()
    .trim()
    .max(8, 'Prefix kode maksimal 8 karakter')
    .regex(/^[A-Za-z0-9]*$/, 'Prefix hanya boleh berisi huruf atau angka')
    .optional(),
  iconName: z.string().trim().max(64).default('folder'),
  description: z.string().trim().max(255, 'Keterangan maksimal 255 karakter').optional(),
  displayOrder: z.coerce.number().int().min(0, 'Urutan tampilan minimal 0').default(0),
  isActive: z.boolean().default(true)
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export const createServiceSchema = z.object({
  serviceCategoryId: z.string().min(1, 'Silakan pilih kelompok layanan untuk service ini'),
  categoryIds: z.array(z.string()).optional(),
  intakeFormId: z.string().nullable().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Nama service medis tidak boleh kosong')
    .max(150, 'Nama service medis maksimal 150 karakter')
    .regex(
      /^[a-zA-Z0-9\s-()]+$/,
      'Nama service hanya boleh berisi huruf, angka, spasi, tanda hubung (-), atau kurung ()'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode service harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode service maksimal 64 karakter')
    .optional(),
  shortName: z.string().trim().max(64, 'Nama pendek maksimal 64 karakter').optional(),
  codePrefix: z
    .string()
    .trim()
    .max(8, 'Prefix antrean maksimal 8 karakter')
    .regex(/^[A-Za-z0-9]*$/, 'Prefix antrean hanya boleh berisi huruf atau angka')
    .optional(),
  iconName: z.string().trim().max(64).default('stethoscope'),
  description: z.string().trim().max(255, 'Keterangan maksimal 255 karakter').optional(),
  complaints: z.array(z.string()).optional(),
  displayOrder: z.coerce.number().int().min(0, 'Urutan tampilan minimal 0').default(0),
  isBookable: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

export const createRelationshipSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama relasi pasien tidak boleh kosong')
    .max(128, 'Nama relasi pasien maksimal 128 karakter')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama relasi hanya boleh berisi huruf, angka, spasi, atau tanda hubung (-)'
    ),
  code: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Kode relasi harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore'
    )
    .max(64, 'Kode relasi maksimal 64 karakter')
    .optional(),
  description: z.string().trim().max(255, 'Keterangan maksimal 255 karakter').optional(),
  iconName: z.string().trim().max(64).default('user'),
  displayOrder: z.coerce.number().int().min(0, 'Urutan tampilan minimal 0').default(0),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false).optional()
});

export type CreateRelationshipFormValues = z.infer<typeof createRelationshipSchema>;
