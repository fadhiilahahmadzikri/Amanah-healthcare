import { z } from 'zod';
import type { EditableMaternalData } from '../components/inspector/types';

export const maternalConditionItemZodSchema = z.object({
  conditionCode: z.string(),
  hasCondition: z.boolean(),
  diagnosisYear: z
    .number()
    .int('Tahun diagnosis harus berupa bilangan bulat')
    .min(1900, 'Tahun diagnosis minimal 1900')
    .max(
      new Date().getFullYear(),
      `Tahun diagnosis tidak boleh melebihi tahun ${new Date().getFullYear()}`
    )
    .nullable()
    .optional(),
  notes: z.string().nullable().optional()
});

export const maternalPreviousPregnancyZodSchema = z.object({
  orderNumber: z.number().int().optional(),
  birthYear: z.string().max(16, 'Tahun persalinan maksimal 16 karakter').nullable().optional(),
  birthWeightGrams: z
    .number()
    .int('Berat lahir harus berupa angka bulat dalam gram')
    .min(0, 'Berat lahir minimal 0 gram')
    .max(30000, 'Berat lahir maksimal 30.000 gram')
    .nullable()
    .optional(),
  birthLengthCm: z
    .number()
    .min(0, 'Panjang badan lahir minimal 0 cm')
    .max(250, 'Panjang badan lahir maksimal 250 cm')
    .nullable()
    .optional(),
  childSex: z.string().nullable().optional(),
  gestationalAgeAtBirth: z.string().max(64).nullable().optional(),
  birthAttendant: z.string().max(128).nullable().optional(),
  deliveryMethod: z.string().max(64).nullable().optional(),
  deliveryPlace: z.string().max(128).nullable().optional(),
  complications: z.string().nullable().optional()
});

export const maternalContraceptiveHistoryZodSchema = z.object({
  orderNumber: z.number().int().optional(),
  startDate: z.string().nullable().optional(),
  contraceptiveType: z.string().max(64, 'Jenis KB maksimal 64 karakter').nullable().optional(),
  durationText: z.string().max(64, 'Lama pemakaian maksimal 64 karakter').nullable().optional(),
  stopDate: z.string().nullable().optional(),
  problems: z.string().nullable().optional(),
  sideEffects: z.string().nullable().optional()
});

export function refineObstetricCounts(
  data: {
    gravidaCount?: number | null;
    parityCount?: number | null;
    abortionCount?: number | null;
    livingChildrenCount?: number | null;
    hasPreviousPregnancyHistory?: boolean | null;
  },
  ctx: z.RefinementCtx
) {
  const G =
    data.gravidaCount !== undefined && data.gravidaCount !== null
      ? Number(data.gravidaCount)
      : undefined;
  const P =
    data.parityCount !== undefined && data.parityCount !== null
      ? Number(data.parityCount)
      : undefined;
  const Ab =
    data.abortionCount !== undefined && data.abortionCount !== null
      ? Number(data.abortionCount)
      : undefined;
  const Ah =
    data.livingChildrenCount !== undefined && data.livingChildrenCount !== null
      ? Number(data.livingChildrenCount)
      : undefined;

  // 1. Gravida harus >= 1 untuk kehamilan saat ini
  if (G !== undefined && G < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total kehamilan (Gravida) minimal bernilai 1 karena sedang hamil saat ini',
      path: ['gravidaCount']
    });
  }

  // 2. Batas persalinan dan keguguran terhadap riwayat kehamilan sebelumnya (G - 1)
  if (G !== undefined && G >= 1) {
    const priorPregnancies = G - 1;

    if (P !== undefined && P > priorPregnancies) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Jumlah pernah melahirkan (${P}) tidak boleh melebihi riwayat kehamilan sebelumnya (${priorPregnancies})`,
        path: ['parityCount']
      });
    }

    if (Ab !== undefined && Ab > priorPregnancies) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Jumlah pernah keguguran (${Ab}) tidak boleh melebihi riwayat kehamilan sebelumnya (${priorPregnancies})`,
        path: ['abortionCount']
      });
    }

    if (P !== undefined && Ab !== undefined && P + Ab > priorPregnancies) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total persalinan dan keguguran (${P + Ab}) melebihi riwayat kehamilan sebelumnya (${priorPregnancies})`,
        path: ['abortionCount']
      });
    }

    if (data.hasPreviousPregnancyHistory === true && priorPregnancies === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tidak dapat memiliki riwayat kehamilan sebelumnya pada kehamilan pertama (G1)',
        path: ['hasPreviousPregnancyHistory']
      });
    }
  }

  // 3. Batas anak hidup terhadap jumlah pernah melahirkan
  if (P !== undefined) {
    if (P === 0 && Ah !== undefined && Ah > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Jumlah anak yang masih hidup harus 0 karena belum pernah melahirkan',
        path: ['livingChildrenCount']
      });
    } else if (Ah !== undefined && Ah > P) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Jumlah anak yang masih hidup (${Ah}) tidak boleh melebihi jumlah pernah melahirkan (${P})`,
        path: ['livingChildrenCount']
      });
    }
  }
}

export function refineMarriageDate(
  data: {
    marriageDate?: string | null;
    motherBirthDate?: string | null;
  },
  ctx: z.RefinementCtx
) {
  if (!data.marriageDate || data.marriageDate.trim() === '') return;
  const mDate = new Date(data.marriageDate);
  if (isNaN(mDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Format tanggal menikah tidak valid',
      path: ['marriageDate']
    });
    return;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (mDate > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tanggal menikah tidak boleh di masa depan',
      path: ['marriageDate']
    });
    return;
  }

  if (data.motherBirthDate && data.motherBirthDate.trim() !== '') {
    const bDate = new Date(data.motherBirthDate);
    if (!isNaN(bDate.getTime())) {
      if (mDate <= bDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal menikah tidak boleh lebih awal dari tanggal lahir pasien',
          path: ['marriageDate']
        });
        return;
      }

      const minMarriage = new Date(bDate);
      minMarriage.setFullYear(minMarriage.getFullYear() + 12);
      if (mDate < minMarriage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Usia saat menikah minimal 12 tahun setelah kelahiran',
          path: ['marriageDate']
        });
      }
    }
  }
}

export function refineHphtDate(
  data: {
    hpht?: string | null;
    motherBirthDate?: string | null;
  },
  ctx: z.RefinementCtx
) {
  if (!data.hpht || data.hpht.trim() === '') return;
  const hDate = new Date(data.hpht);
  if (isNaN(hDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Format tanggal HPHT tidak valid',
      path: ['hpht']
    });
    return;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (hDate > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tanggal HPHT tidak boleh di masa depan',
      path: ['hpht']
    });
    return;
  }

  if (data.motherBirthDate && data.motherBirthDate.trim() !== '') {
    const bDate = new Date(data.motherBirthDate);
    if (!isNaN(bDate.getTime())) {
      if (hDate <= bDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal HPHT tidak boleh lebih awal dari tanggal lahir pasien',
          path: ['hpht']
        });
        return;
      }
    }
  }
}

export function refineNikUniqueness(
  data: {
    motherNik?: string | null;
    partnerNik?: string | null;
  },
  ctx: z.RefinementCtx
) {
  const mNik = data.motherNik?.trim();
  const pNik = data.partnerNik?.trim();
  if (mNik && pNik && mNik === pNik) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NIK Suami tidak boleh sama dengan NIK Ibu',
      path: ['partnerNik']
    });
  }
}

export const maternalFormZodSchema = z
  .object({
    motherName: z.string().min(1, 'Nama lengkap ibu wajib diisi'),
    motherNik: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) => !val || val === '' || /^\d{16}$/.test(val),
        { message: 'NIK ibu harus berupa 16 digit angka' }
      ),
    motherBirthDate: z.string().nullable().optional(),
    marriageDate: z.string().nullable().optional(),
    hpht: z.string().nullable().optional(),
    currentComplaints: z.string().trim().min(1, 'Keluhan saat ini wajib diisi'),
    partnerName: z.string().max(255, 'Nama suami maksimal 255 karakter').nullable().optional(),
    partnerNik: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) => !val || val === '' || /^\d{16}$/.test(val),
        { message: 'NIK suami harus berupa 16 digit angka' }
      ),
    phoneNumber: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) => !val || val === '' || /^(\+62|62|0)[0-9]{8,15}$/.test(val.replace(/[\s-]/g, '')),
        { message: 'Nomor telepon tidak valid' }
      ),
    partnerPhone: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine(
        (val) => !val || val === '' || /^(\+62|62|0)[0-9]{8,15}$/.test(val.replace(/[\s-]/g, '')),
        { message: 'Nomor HP suami tidak valid' }
      ),
    heightCm: z
      .number()
      .min(0, 'Tinggi badan minimal 0 cm')
      .max(300, 'Tinggi badan maksimal 300 cm')
      .nullable()
      .optional(),
    prePregnancyWeightKg: z
      .number()
      .min(0, 'Berat badan minimal 0 kg')
      .max(500, 'Berat badan maksimal 500 kg')
      .nullable()
      .optional(),
    upperArmCircumferenceCm: z
      .number()
      .min(0, 'Lingkar lengan atas minimal 0 cm')
      .max(150, 'Lingkar lengan atas maksimal 150 cm')
      .nullable()
      .optional(),
    initialBmi: z
      .number()
      .min(0, 'BMI minimal 0')
      .max(150, 'BMI maksimal 150')
      .nullable()
      .optional(),
    gestationalAgeWeeks: z
      .number()
      .nullable()
      .optional(),
    gravidaCount: z
      .number()
      .int()
      .min(1, 'Gravida minimal 1')
      .max(50, 'Gravida maksimal 50')
      .nullable()
      .optional(),
    parityCount: z
      .number()
      .int()
      .min(0, 'Paritas minimal 0')
      .max(50, 'Paritas maksimal 50')
      .nullable()
      .optional(),
    abortionCount: z
      .number()
      .int()
      .min(0, 'Abortus minimal 0')
      .max(50, 'Abortus maksimal 50')
      .nullable()
      .optional(),
    livingChildrenCount: z
      .number()
      .int()
      .min(0, 'Jumlah anak hidup minimal 0')
      .max(50, 'Jumlah anak hidup maksimal 50')
      .nullable()
      .optional(),
    previousPregnancies: z.array(maternalPreviousPregnancyZodSchema).optional(),
    contraceptiveHistories: z.array(maternalContraceptiveHistoryZodSchema).optional(),
    conditionResponses: z.array(maternalConditionItemZodSchema).optional()
  })
  .superRefine(refineObstetricCounts)
  .superRefine(refineMarriageDate)
  .superRefine(refineHphtDate)
  .superRefine(refineNikUniqueness);

export interface MaternalValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMaternalForm(data: Partial<EditableMaternalData>): MaternalValidationResult {
  let birthYear: number | null = null;
  if (data.motherBirthDate) {
    const parsed = new Date(data.motherBirthDate).getFullYear();
    if (!Number.isNaN(parsed)) birthYear = parsed;
  }
  const currentYear = new Date().getFullYear();

  const parseNumber = (val: unknown): number | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const normalized = typeof val === 'string' ? val.trim().replace(',', '.') : val;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : undefined;
  };

  const parsedPreviousPregnancies = data.previousPregnancies?.map((p) => ({
    orderNumber: p.orderNumber,
    birthYear: p.birthYear ? String(p.birthYear).trim() : null,
    birthWeightGrams: parseNumber(p.birthWeightGrams),
    birthLengthCm: parseNumber(p.birthLengthCm),
    childSex: p.childSex || null,
    gestationalAgeAtBirth: p.gestationalAgeAtBirth || null,
    birthAttendant: p.birthAttendant || null,
    deliveryMethod: p.deliveryMethod || null,
    deliveryPlace: p.deliveryPlace || null,
    complications: p.complications || null
  }));

  const parsedContraceptiveHistories = data.contraceptiveHistories?.map((c) => ({
    orderNumber: c.orderNumber,
    startDate: c.startDate || null,
    contraceptiveType: c.contraceptiveType || null,
    durationText: c.durationText || null,
    stopDate: c.stopDate || null,
    problems: c.problems || null,
    sideEffects: c.sideEffects || null
  }));

  const result = maternalFormZodSchema.safeParse({
    motherName: data.motherName ?? '',
    motherNik: data.motherNik ? data.motherNik.trim() : null,
    motherBirthDate: data.motherBirthDate ? data.motherBirthDate.trim() : null,
    marriageDate: data.marriageDate ? data.marriageDate.trim() : null,
    hpht: data.hpht ? data.hpht.trim() : null,
    currentComplaints: data.currentComplaints ? data.currentComplaints.trim() : '',
    partnerName: data.partnerName ? data.partnerName.trim() : null,
    partnerNik: data.partnerNik ? data.partnerNik.trim() : null,
    phoneNumber: data.phoneNumber ? data.phoneNumber.trim().replace(/[\s-]/g, '') : null,
    partnerPhone: data.partnerPhone ? data.partnerPhone.trim().replace(/[\s-]/g, '') : null,
    heightCm: parseNumber(data.heightCm),
    prePregnancyWeightKg: parseNumber(data.prePregnancyWeightKg),
    upperArmCircumferenceCm: parseNumber(data.upperArmCircumferenceCm),
    initialBmi: parseNumber(data.initialBmi),
    gestationalAgeWeeks: parseNumber(data.gestationalAgeWeeks),
    gravidaCount: parseNumber(data.gravidaCount),
    parityCount: parseNumber(data.parityCount),
    abortionCount: parseNumber(data.abortionCount),
    livingChildrenCount: parseNumber(data.livingChildrenCount),
    previousPregnancies: parsedPreviousPregnancies,
    contraceptiveHistories: parsedContraceptiveHistories,
    conditionResponses: data.conditionResponses
  });

  const errors: Record<string, string> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field === 'conditionResponses' && issue.path.length >= 3) {
        const index = issue.path[1] as number;
        const subfield = issue.path[2] as string;
        const conditionItem = data.conditionResponses?.[index];
        if (conditionItem?.conditionCode && subfield === 'diagnosisYear') {
          const specificKey = `condition_${conditionItem.conditionCode}_year`;
          errors[specificKey] = issue.message;
        }
      } else if (field === 'previousPregnancies' && issue.path.length >= 3) {
        const index = issue.path[1] as number;
        const subfield = issue.path[2] as string;
        errors[`prev_preg_${index}_${subfield}`] = issue.message;
        if (!errors.previousPregnancies) {
          errors.previousPregnancies = issue.message;
        }
      } else if (field === 'contraceptiveHistories' && issue.path.length >= 3) {
        const index = issue.path[1] as number;
        const subfield = issue.path[2] as string;
        errors[`contra_${index}_${subfield}`] = issue.message;
        if (!errors.contraceptiveHistories) {
          errors.contraceptiveHistories = issue.message;
        }
      } else if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    });
  }

  // Cross-field validation: motherNik vs partnerNik uniqueness
  if (
    data.motherNik &&
    data.partnerNik &&
    data.motherNik.trim() !== '' &&
    data.motherNik.trim() === data.partnerNik.trim()
  ) {
    errors.partnerNik = 'NIK Suami tidak boleh sama dengan NIK Ibu';
  }

  // Cross-field validation: diagnosisYear must not precede mother's birth year
  if (data.conditionResponses && Array.isArray(data.conditionResponses)) {
    for (const c of data.conditionResponses) {
      if (c.hasCondition && c.diagnosisYear) {
        if (birthYear && c.diagnosisYear < birthYear) {
          const msg = `Tahun diagnosis (${c.diagnosisYear}) tidak boleh lebih awal dari tahun kelahiran ibu (${birthYear})`;
          errors[`condition_${c.conditionCode}_year`] = msg;
          if (!errors.conditionResponses) {
            errors.conditionResponses = msg;
          }
        } else if (c.diagnosisYear > currentYear) {
          const msg = `Tahun diagnosis (${c.diagnosisYear}) tidak boleh melebihi tahun ${currentYear}`;
          errors[`condition_${c.conditionCode}_year`] = msg;
          if (!errors.conditionResponses) {
            errors.conditionResponses = msg;
          }
        }
      }
    }
  }

  // Cross-field validation: contraceptiveHistories dates
  if (data.contraceptiveHistories && Array.isArray(data.contraceptiveHistories)) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    data.contraceptiveHistories.forEach((c, index) => {
      let startObj: Date | null = null;
      let stopObj: Date | null = null;

      if (c.startDate && c.startDate.trim() !== '') {
        const d = new Date(c.startDate);
        if (isNaN(d.getTime())) {
          errors[`contra_${index}_startDate`] = 'Format tanggal mulai KB tidak valid';
          if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_startDate`];
        } else {
          startObj = d;
          if (d > today) {
            errors[`contra_${index}_startDate`] = 'Tanggal mulai KB tidak boleh di masa depan';
            if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_startDate`];
          } else if (data.motherBirthDate && data.motherBirthDate.trim() !== '') {
            const bDate = new Date(data.motherBirthDate);
            if (!isNaN(bDate.getTime())) {
              if (d <= bDate) {
                errors[`contra_${index}_startDate`] =
                  'Tanggal mulai KB tidak boleh lebih awal dari tanggal lahir pasien';
                if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_startDate`];
              } else {
                const minStart = new Date(bDate);
                minStart.setFullYear(minStart.getFullYear() + 10);
                if (d < minStart) {
                  errors[`contra_${index}_startDate`] =
                    'Usia saat mulai menggunakan KB minimal 10 tahun';
                  if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_startDate`];
                }
              }
            }
          } else if (birthYear && d.getFullYear() < birthYear + 10) {
            errors[`contra_${index}_startDate`] = 'Usia saat mulai menggunakan KB minimal 10 tahun';
            if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_startDate`];
          }
        }
      }

      if (c.stopDate && c.stopDate.trim() !== '') {
        const d = new Date(c.stopDate);
        if (isNaN(d.getTime())) {
          errors[`contra_${index}_stopDate`] = 'Format tanggal lepas KB tidak valid';
          if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_stopDate`];
        } else {
          stopObj = d;
          if (d > today) {
            errors[`contra_${index}_stopDate`] = 'Tanggal lepas KB tidak boleh di masa depan';
            if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_stopDate`];
          } else if (data.motherBirthDate && data.motherBirthDate.trim() !== '') {
            const bDate = new Date(data.motherBirthDate);
            if (!isNaN(bDate.getTime()) && d <= bDate) {
              errors[`contra_${index}_stopDate`] =
                'Tanggal lepas KB tidak boleh lebih awal dari tanggal lahir pasien';
              if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_stopDate`];
            }
          }
        }
      }

      if (startObj && stopObj && stopObj < startObj) {
        errors[`contra_${index}_stopDate`] =
          'Tanggal lepas KB tidak boleh lebih awal dari tanggal mulai pemakaian';
        if (!errors.contraceptiveHistories) errors.contraceptiveHistories = errors[`contra_${index}_stopDate`];
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

export type MaternityInspectorTab = 'identitas' | 'obstetri' | 'klinis' | 'skrining';

export const MATERNITY_TAB_LABELS: Record<MaternityInspectorTab, string> = {
  identitas: 'Identitas',
  obstetri: 'Riwayat Kehamilan',
  klinis: 'Pemeriksaan Fisik & KB',
  skrining: 'Skrining Penyakit'
};

export const MATERNITY_FIELD_TAB_MAP: Record<string, MaternityInspectorTab> = {
  // Tab 1: Identitas
  motherName: 'identitas',
  motherNik: 'identitas',
  motherBirthDate: 'identitas',
  phoneNumber: 'identitas',
  religion: 'identitas',
  motherEducation: 'identitas',
  motherJob: 'identitas',
  marriageOrder: 'identitas',
  marriageDate: 'identitas',
  domicileAddress: 'identitas',
  identityCardAddress: 'identitas',
  partnerName: 'identitas',
  partnerNik: 'identitas',
  partnerBirthDate: 'identitas',
  partnerAge: 'identitas',
  partnerJob: 'identitas',
  partnerEducation: 'identitas',
  partnerBloodType: 'identitas',
  partnerPhone: 'identitas',
  husband: 'identitas',
  'husband.fullName': 'identitas',
  'husband.nik': 'identitas',
  'husband.birthDate': 'identitas',
  'husband.age': 'identitas',
  'husband.job': 'identitas',
  'husband.education': 'identitas',
  'husband.bloodType': 'identitas',
  'husband.phoneNumber': 'identitas',
  dasawisma: 'identitas',
  posyandu: 'identitas',
  puskesmas: 'identitas',

  // Tab 2: Obstetri
  hpht: 'obstetri',
  estimatedDueDate: 'obstetri',
  gestationalAgeWeeks: 'obstetri',
  gravidaCount: 'obstetri',
  parityCount: 'obstetri',
  abortionCount: 'obstetri',
  livingChildrenCount: 'obstetri',
  hasPreviousPregnancyHistory: 'obstetri',
  previousPregnancies: 'obstetri',
  currentComplaints: 'obstetri',

  // Tab 3: Klinis & KB
  heightCm: 'klinis',
  prePregnancyWeightKg: 'klinis',
  upperArmCircumferenceCm: 'klinis',
  initialBmi: 'klinis',
  tetanusStatus: 'klinis',
  motherBloodType: 'klinis',
  contraceptiveHistories: 'klinis',

  // Tab 4: Skrining
  conditionResponses: 'skrining',
  smokedBeforePregnancy: 'skrining',
  alcoholBeforePregnancy: 'skrining',
  irregularDietBeforePregnancy: 'skrining',
  reducedPhysicalActivityBeforePregnancy: 'skrining',
  unprescribedMedicationBeforePregnancy: 'skrining',
  concerningCosmeticUseBeforePregnancy: 'skrining',
  pesticideExposureBeforePregnancy: 'skrining',
  chemicalExposureBeforePregnancy: 'skrining',
  smokeExposureBeforePregnancy: 'skrining',
  concerningEnvironmentNotes: 'skrining',
  allergyInfo: 'skrining',
  otherNotes: 'skrining'
};

export const MATERNITY_FIELD_DOM_ID_MAP: Record<string, string> = {
  motherName: 'maternity-mother-name',
  motherNik: 'maternity-mother-nik',
  motherBirthDate: 'maternity-mother-birthdate',
  phoneNumber: 'maternity-phone-number',
  religion: 'maternity-religion',
  motherEducation: 'maternity-mother-education',
  motherJob: 'maternity-mother-job',
  marriageOrder: 'maternity-marriage-order',
  marriageDate: 'maternity-marriage-date',
  domicileAddress: 'maternity-domicile-address',
  identityCardAddress: 'maternity-ktp-address',
  partnerName: 'maternity-husband-name',
  partnerNik: 'maternity-husband-nik',
  partnerBirthDate: 'maternity-husband-birthdate',
  partnerPhone: 'maternity-husband-phone',
  partnerBloodType: 'maternity-husband-bloodtype',
  partnerEducation: 'maternity-husband-education',
  partnerJob: 'maternity-husband-job',
  husband: 'maternity-husband-name',
  'husband.fullName': 'maternity-husband-name',
  'husband.nik': 'maternity-husband-nik',
  'husband.birthDate': 'maternity-husband-birthdate',
  'husband.phoneNumber': 'maternity-husband-phone',
  'husband.bloodType': 'maternity-husband-bloodtype',
  'husband.education': 'maternity-husband-education',
  'husband.job': 'maternity-husband-job',
  dasawisma: 'maternity-dasawisma',
  posyandu: 'maternity-posyandu',
  puskesmas: 'maternity-puskesmas',

  hpht: 'maternity-hpht',
  estimatedDueDate: 'maternity-hpl',
  gestationalAgeWeeks: 'maternity-gestational-age',
  gravidaCount: 'maternity-gravida',
  parityCount: 'maternity-parity',
  abortionCount: 'maternity-abortion',
  livingChildrenCount: 'maternity-living-children',
  currentComplaints: 'maternity-current-complaints',

  heightCm: 'maternity-height',
  prePregnancyWeightKg: 'maternity-weight',
  upperArmCircumferenceCm: 'maternity-lila',
  initialBmi: 'maternity-bmi',
  tetanusStatus: 'maternity-tetanus-status',
  motherBloodType: 'maternity-mother-bloodtype'
};

export function getTabForErrorKey(key: string): MaternityInspectorTab {
  if (MATERNITY_FIELD_TAB_MAP[key]) return MATERNITY_FIELD_TAB_MAP[key];
  if (key.startsWith('husband.') || key === 'husband') return 'identitas';
  if (key.startsWith('prev_preg_')) return 'obstetri';
  if (key.startsWith('contra_')) return 'klinis';
  if (key.startsWith('condition_')) return 'skrining';
  return 'identitas';
}

export function getMaternityTabErrorCounts(
  errors: Record<string, string>
): Record<MaternityInspectorTab, number> {
  const counts: Record<MaternityInspectorTab, number> = {
    identitas: 0,
    obstetri: 0,
    klinis: 0,
    skrining: 0
  };

  for (const [key, msg] of Object.entries(errors)) {
    if (!msg) continue;
    const tab = getTabForErrorKey(key);
    counts[tab]++;
  }

  return counts;
}

export function getMaternityTabWithErrors(
  errors: Record<string, string>
): MaternityInspectorTab | null {
  const errorKeys = Object.keys(errors).filter((k) => Boolean(errors[k]));
  if (errorKeys.length === 0) return null;

  const counts = getMaternityTabErrorCounts(errors);
  const tabsInOrder: MaternityInspectorTab[] = ['identitas', 'obstetri', 'klinis', 'skrining'];
  for (const tab of tabsInOrder) {
    if (counts[tab] > 0) return tab;
  }

  return 'identitas';
}
