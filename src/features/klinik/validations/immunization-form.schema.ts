import { z } from 'zod';
import type { EditableImmunizationData } from '../components/inspector/types';

export const immunizationClinicalEntryZodSchema = z.object({
  rowIndex: z.number().int().min(0).max(14),
  vaccineName: z.string().optional(),
  vaccineCode: z.string().optional(),
  status: z.string().optional(),
  injectionDate: z.string().nullable().optional(),
  ageDisplay: z.string().nullable().optional(),
  fever: z.string().nullable().optional(),
  cough: z.string().nullable().optional(),
  runnyNose: z.string().nullable().optional(),
  weightKg: z
    .number()
    .min(0.5, 'Berat badan anak minimal 0.5 kg')
    .max(150, 'Berat badan anak maksimal 150 kg')
    .nullable()
    .optional(),
  heightCm: z
    .number()
    .min(20, 'Panjang/Tinggi badan minimal 20 cm')
    .max(250, 'Panjang/Tinggi badan maksimal 250 cm')
    .nullable()
    .optional(),
  headCircumferenceCm: z
    .number()
    .min(10, 'Lingkar kepala minimal 10 cm')
    .max(100, 'Lingkar kepala maksimal 100 cm')
    .nullable()
    .optional(),
  temperatureCelsius: z
    .number()
    .min(30, 'Suhu tubuh minimal 30 °C')
    .max(45, 'Suhu tubuh maksimal 45 °C')
    .nullable()
    .optional(),
  planning: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
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
    }),
  entries: z.array(immunizationClinicalEntryZodSchema).optional()
});

export interface ImmunizationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateImmunizationForm(
  data: Partial<EditableImmunizationData>
): ImmunizationValidationResult {
  const parseNumber = (val: unknown): number | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const parsedEntries = Array.isArray(data.entries)
    ? data.entries.map((e: any) => ({
        rowIndex: Number(e.rowIndex) || 0,
        vaccineName: e.vaccineName,
        vaccineCode: e.vaccineCode,
        status: e.status,
        injectionDate: e.injectionDate || null,
        ageDisplay: e.ageDisplay || null,
        fever: e.fever || null,
        cough: e.cough || null,
        runnyNose: e.runnyNose || null,
        weightKg: parseNumber(e.weightKg),
        heightCm: parseNumber(e.heightCm),
        headCircumferenceCm: parseNumber(e.headCircumferenceCm),
        temperatureCelsius: parseNumber(e.temperatureCelsius),
        planning: e.planning || null,
        notes: e.notes || null
      }))
    : undefined;

  const result = immunizationFormZodSchema.safeParse({
    childName: data.childName ?? '',
    childNik: data.childNik ? data.childNik.trim() : '',
    parentPhone: data.parentPhone ? data.parentPhone.trim() : '',
    entries: parsedEntries
  });

  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (field === 'entries' && issue.path.length >= 3) {
      const index = issue.path[1] as number;
      const subfield = issue.path[2] as string;
      errors[`entry_${index}_${subfield}`] = issue.message;
      if (!errors.entries) {
        errors.entries = issue.message;
      }
    } else if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { isValid: false, errors };
}

export type ImmunizationInspectorTab = 'identitas' | 'orang-tua' | 'riwayat' | 'trajektori';

export function getImmunizationTabWithErrors(
  errors: Record<string, string>
): ImmunizationInspectorTab | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;

  const identitasKeys = ['childName', 'childNik', 'childBirthDate', 'childSex'];
  const parentKeys = ['parentPhone', 'fatherName', 'motherName', 'childAddress'];
  const riwayatKeys = ['previousVaccineHistory', 'childAllergyHistory'];

  for (const key of errorKeys) {
    if (identitasKeys.includes(key)) return 'identitas';
  }
  for (const key of errorKeys) {
    if (parentKeys.includes(key)) return 'orang-tua';
  }
  for (const key of errorKeys) {
    if (riwayatKeys.includes(key)) return 'riwayat';
  }

  return 'trajektori';
}
