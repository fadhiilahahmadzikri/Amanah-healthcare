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
    .custom<number>((val) => typeof val === 'number' && !Number.isNaN(val), {
      message: 'Berat badan harus berupa angka valid'
    })
    .nullable()
    .optional(),
  heightCm: z
    .custom<number>((val) => typeof val === 'number' && !Number.isNaN(val), {
      message: 'Panjang/Tinggi badan harus berupa angka valid'
    })
    .nullable()
    .optional(),
  headCircumferenceCm: z
    .custom<number>((val) => typeof val === 'number' && !Number.isNaN(val), {
      message: 'Lingkar kepala harus berupa angka valid'
    })
    .nullable()
    .optional(),
  temperatureCelsius: z
    .custom<number>((val) => typeof val === 'number' && !Number.isNaN(val), {
      message: 'Suhu tubuh harus berupa angka valid'
    })
    .nullable()
    .optional(),
  planning: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export const immunizationFormZodSchema = z.object({
  childName: z.string().min(1, 'Nama lengkap anak wajib diisi'),
  childNik: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => !val || val === '' || /^\d{16}$/.test(val), {
      message: 'NIK anak harus berupa 16 digit angka'
    }),
  parentPhone: z
    .string()
    .trim()
    .min(1, 'Nomor HP orang tua wajib diisi')
    .refine((val) => /^(\+62|62|0)[0-9]{8,15}$/.test(val), {
      message: 'Nomor HP orang tua tidak valid'
    }),
  entries: z.array(immunizationClinicalEntryZodSchema).optional()
});

export interface ImmunizationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function parseAgeDisplayToDays(raw?: string | null): number | null {
  if (!raw || !raw.trim()) return null;
  const match = raw.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;
  const num = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(num)) return null;

  const unit = match[2]?.trim().toLowerCase() || 'bln';
  if (unit.startsWith('hari')) return num;
  if (unit.startsWith('minggu') || unit.startsWith('mgg')) return num * 7;
  if (unit.startsWith('bln') || unit.startsWith('bulan')) return num * 30.4375;
  if (unit.startsWith('thn') || unit.startsWith('tahun')) return num * 365.25;
  return num * 30.4375;
}

export function validateImmunizationForm(
  data: Partial<EditableImmunizationData>
): ImmunizationValidationResult {
  const parseNumber = (val: unknown): number | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const normalized = typeof val === 'string' ? val.trim().replace(',', '.') : val;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : Number.NaN;
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
    childNik: data.childNik ? data.childNik.trim() : null,
    parentPhone: data.parentPhone ? data.parentPhone.trim() : '',
    entries: parsedEntries
  });

  const errors: Record<string, string> = {};
  if (!result.success) {
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
  }

  // Validate umur saat suntik against child birth date and current date
  if (parsedEntries) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthDateObj = data.childBirthDate ? new Date(data.childBirthDate) : null;
    const isValidBirth = Boolean(birthDateObj && !Number.isNaN(birthDateObj.getTime()));

    parsedEntries.forEach((entry) => {
      if (entry.ageDisplay && entry.ageDisplay.trim()) {
        const match = entry.ageDisplay.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
        if (match) {
          const num = Number(match[1].replace(',', '.'));
          if (num < 0) {
            errors[`entry_${entry.rowIndex}_ageDisplay`] = 'Umur saat suntik tidak boleh negatif';
          } else if (isValidBirth && birthDateObj) {
            const diffMs = today.getTime() - birthDateObj.getTime();
            const childAgeDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            const inputDays = parseAgeDisplayToDays(entry.ageDisplay);
            if (inputDays !== null && inputDays > childAgeDays + 7) {
              errors[`entry_${entry.rowIndex}_ageDisplay`] =
                'Umur saat suntik melebihi usia anak dari tanggal lahir hingga saat ini';
            }
          } else {
            const unit = match[2]?.trim().toLowerCase() || 'bln';
            if (unit.startsWith('thn') || unit.startsWith('tahun')) {
              if (num > currentYear - 1900) {
                errors[`entry_${entry.rowIndex}_ageDisplay`] = 'Umur saat suntik tidak valid';
              }
            } else if (num > 100000) {
              errors[`entry_${entry.rowIndex}_ageDisplay`] = 'Umur saat suntik tidak valid';
            }
          }
        }
      }
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export type ImmunizationInspectorTab = 'identitas' | 'orang-tua' | 'riwayat' | 'trajektori';

export const IMMUNIZATION_FIELD_TAB_MAP: Record<string, ImmunizationInspectorTab> = {
  // Tab 1: Identitas Anak
  childName: 'identitas',
  childNik: 'identitas',
  childBirthDate: 'identitas',
  childSex: 'identitas',
  childAgeFormatted: 'identitas',

  // Tab 2: Orang Tua & Alamat
  fatherName: 'orang-tua',
  motherName: 'orang-tua',
  parentPhone: 'orang-tua',
  childAddress: 'orang-tua',
  line1: 'orang-tua',
  provinceName: 'orang-tua',
  provinceCode: 'orang-tua',
  regencyName: 'orang-tua',
  regencyCode: 'orang-tua',
  districtName: 'orang-tua',
  districtCode: 'orang-tua',
  villageName: 'orang-tua',
  villageCode: 'orang-tua',

  // Tab 3: Riwayat Pasien
  previousVaccineHistory: 'riwayat',
  childAllergyHistory: 'riwayat'
};

export const IMMUNIZATION_FIELD_DOM_ID_MAP: Record<string, string> = {
  childName: 'admin-child-name-input',
  childNik: 'admin-child-nik-input',
  childBirthDate: 'admin-child-birthdate',
  childSex: 'admin-child-sex-select',

  fatherName: 'admin-father-name',
  motherName: 'admin-mother-name',
  parentPhone: 'admin-parent-phone',
  childAddress: 'admin-child-address',
  line1: 'admin-child-line1',
  provinceName: 'patient-region-dropdown',
  regencyName: 'patient-region-dropdown',
  districtName: 'patient-region-dropdown',
  villageName: 'patient-region-dropdown',

  previousVaccineHistory: 'admin-previous-vaccines',
  childAllergyHistory: 'admin-child-allergy'
};

export function getTabForImmunizationErrorKey(key: string): ImmunizationInspectorTab {
  if (IMMUNIZATION_FIELD_TAB_MAP[key]) return IMMUNIZATION_FIELD_TAB_MAP[key];
  if (key.startsWith('entry_') || key === 'entries') return 'trajektori';
  return 'identitas';
}

export function getImmunizationDomIdForErrorKey(key: string): string {
  if (IMMUNIZATION_FIELD_DOM_ID_MAP[key]) {
    return IMMUNIZATION_FIELD_DOM_ID_MAP[key];
  }

  // Handle entry dynamic keys, e.g. entry_0_weightKg
  if (key.startsWith('entry_')) {
    const match = key.match(/^entry_(\d+)_(.+)$/);
    if (match) {
      const idx = match[1];
      const field = match[2];
      switch (field) {
        case 'injectionDate':
          return `edit-injection-date-${idx}`;
        case 'ageDisplay':
          return `edit-age-val-${idx}`;
        case 'weightKg':
          return `edit-weight-${idx}`;
        case 'heightCm':
          return `edit-height-${idx}`;
        case 'headCircumferenceCm':
          return `edit-head-${idx}`;
        case 'temperatureCelsius':
          return `edit-temp-${idx}`;
        case 'fever':
          return `edit-fever-${idx}`;
        case 'cough':
          return `edit-cough-${idx}`;
        case 'runnyNose':
          return `edit-runny-nose-${idx}`;
        case 'planning':
          return `edit-planning-${idx}`;
        case 'status':
          return `edit-status-${idx}`;
        default:
          return `edit-injection-date-${idx}`;
      }
    }
  }

  return `admin-${key}`;
}

export function getImmunizationTabErrorCounts(
  errors: Record<string, string>
): Record<ImmunizationInspectorTab, number> {
  const counts: Record<ImmunizationInspectorTab, number> = {
    identitas: 0,
    'orang-tua': 0,
    riwayat: 0,
    trajektori: 0
  };

  const hasSpecificEntryErrors = Object.keys(errors).some((k) => k.startsWith('entry_'));

  for (const [key, msg] of Object.entries(errors)) {
    if (!msg) continue;
    if (key === 'entries' && hasSpecificEntryErrors) continue;

    const tab = getTabForImmunizationErrorKey(key);
    counts[tab]++;
  }

  return counts;
}

export function getImmunizationTabWithErrors(
  errors: Record<string, string>
): ImmunizationInspectorTab | null {
  const errorKeys = Object.keys(errors).filter((k) => Boolean(errors[k]));
  if (errorKeys.length === 0) return null;

  for (const key of errorKeys) {
    return getTabForImmunizationErrorKey(key);
  }

  return null;
}
