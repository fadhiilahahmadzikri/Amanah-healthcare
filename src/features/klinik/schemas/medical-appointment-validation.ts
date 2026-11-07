import { z } from 'zod';

import type {
  MedicalFormField,
  MedicalFormSection
} from '../constants/medical-appointment-schemas';
import type { MedicalAppointmentValues } from '../utils/medical-appointment';

const nikFieldIds = new Set(['motherNik', 'partnerNik', 'childNik']);
const phoneFieldIds = new Set(['phoneNumber', 'parentPhone']);
const countFieldIds = new Set([
  'marriageOrder',
  'gravidaCount',
  'parityCount',
  'abortionCount',
  'livingChildrenCount'
]);
const yearFieldIds = new Set([
  'previousPregnancy1BirthYear',
  'previousPregnancy2BirthYear',
  'previousPregnancy3BirthYear',
  'previousPregnancy4BirthYear',
  'otherDiseaseHistoryYear',
  'hypertensionHistoryNotes',
  'heartDiseaseHistoryNotes',
  'thyroidDiseaseHistoryNotes',
  'autoimmuneHistoryNotes',
  'diabetesHistoryNotes',
  'asthmaHistoryNotes',
  'tuberculosisHistoryNotes',
  'hepatitisBHistoryNotes',
  'hivOrSyphilisHistoryNotes',
  'mentalHealthHistoryNotes',
  'twinPregnancyHistoryNotes',
  'cystMyomaTumorHistoryNotes',
  'surgeryHistoryNotes',
]);

export function getMedicalFieldFormat(
  field: MedicalFormField
): 'nik' | 'phone' | 'count' | 'year' | 'text' {
  if (field.format) return field.format;
  if (nikFieldIds.has(field.id)) return 'nik';
  if (phoneFieldIds.has(field.id)) return 'phone';
  if (countFieldIds.has(field.id)) return 'count';
  if (yearFieldIds.has(field.id) || field.id.endsWith('BirthYear') || field.id.endsWith('Year')) return 'year';
  return 'text';
}

export function validateQuestionnaireYear(
  yearValue: string,
  birthYear?: number | null
): string | undefined {
  const trimmed = yearValue.trim();
  if (!trimmed) return undefined;

  const currentYear = new Date().getFullYear();

  if (!/^\d{4}$/.test(trimmed)) {
    return 'Tahun harus berupa 4 digit angka (contoh: 2021)';
  }

  const year = Number(trimmed);
  if (year < 1900) {
    return 'Tahun tidak boleh lebih awal dari 1900';
  }

  if (year > currentYear) {
    return `Tahun tidak boleh melebihi tahun saat ini (${currentYear})`;
  }

  if (birthYear && !Number.isNaN(birthYear) && year < birthYear) {
    return `Tahun tidak boleh lebih awal dari tahun kelahiran pasien (${birthYear})`;
  }

  return undefined;
}

export function getMedicalFieldValidationSchema(
  field: MedicalFormField,
  birthYear?: number | null,
  allValues?: MedicalAppointmentValues
) {
  return z.string().superRefine((value, context) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      if (field.required) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Wajib diisi'
        });
      }
      return;
    }

    const format = getMedicalFieldFormat(field);

    if (format === 'nik' && !/^\d{16}$/.test(trimmedValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NIK harus 16 digit angka'
      });
      return;
    }

    if (format === 'phone') {
      const digits = trimmedValue.replace(/\D/g, '');

      if (digits.length < 8 || digits.length > 15) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor telepon harus 8-15 digit'
        });
        return;
      }
    }

    if (format === 'count') {
      if (!/^\d+$/.test(trimmedValue)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Isi dengan angka'
        });
        return;
      }

      if (allValues) {
        const countVal = parseInt(trimmedValue, 10);
        const gVal = allValues['gravidaCount']
          ? parseInt(allValues['gravidaCount'], 10)
          : undefined;
        const pVal = allValues['parityCount']
          ? parseInt(allValues['parityCount'], 10)
          : undefined;
        const abVal = allValues['abortionCount']
          ? parseInt(allValues['abortionCount'], 10)
          : undefined;

        if (field.id === 'gravidaCount') {
          if (countVal < 1) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Total kehamilan minimal 1'
            });
            return;
          }
          const prior = countVal - 1;
          if (pVal !== undefined && !isNaN(pVal) && pVal > prior) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Total kehamilan (${countVal}) tidak mencukupi untuk riwayat persalinan (${pVal})`
            });
            return;
          }
          if (abVal !== undefined && !isNaN(abVal) && abVal > prior) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Total kehamilan (${countVal}) tidak mencukupi untuk riwayat keguguran (${abVal})`
            });
            return;
          }
          if (
            pVal !== undefined &&
            abVal !== undefined &&
            !isNaN(pVal) &&
            !isNaN(abVal) &&
            pVal + abVal > prior
          ) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Total kehamilan (${countVal}) tidak mencukupi untuk persalinan (${pVal}) dan keguguran (${abVal})`
            });
            return;
          }
        }

        if (gVal !== undefined && !isNaN(gVal) && gVal >= 1) {
          const prior = gVal - 1;

          if (field.id === 'parityCount') {
            if (countVal > prior) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Tidak boleh melebihi kehamilan sebelumnya (maks. ${prior})`
              });
              return;
            }
            if (abVal !== undefined && !isNaN(abVal) && countVal + abVal > prior) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Total persalinan dan keguguran melebihi kehamilan sebelumnya (maks. ${prior})`
              });
              return;
            }
          }

          if (field.id === 'abortionCount') {
            if (countVal > prior) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Tidak boleh melebihi kehamilan sebelumnya (maks. ${prior})`
              });
              return;
            }
            if (pVal !== undefined && !isNaN(pVal) && countVal + pVal > prior) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Total persalinan dan keguguran melebihi kehamilan sebelumnya (maks. ${prior})`
              });
              return;
            }
          }
        }

        if (field.id === 'livingChildrenCount') {
          const effectiveP = pVal !== undefined && !isNaN(pVal) ? pVal : undefined;
          if (effectiveP === 0 && countVal > 0) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Jumlah anak hidup harus 0 karena belum pernah melahirkan'
            });
            return;
          }
          if (effectiveP !== undefined && countVal > effectiveP) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tidak boleh melebihi jumlah pernah melahirkan (maks. ${effectiveP})`
            });
            return;
          }
        }
      }
    }

    let effectiveBirthYear = birthYear;
    if ((effectiveBirthYear === undefined || effectiveBirthYear === null) && allValues) {
      const bDateStr = allValues['motherBirthDate'] || allValues['birthDate'];
      if (bDateStr) {
        const parsed = new Date(bDateStr).getFullYear();
        if (!Number.isNaN(parsed)) {
          effectiveBirthYear = parsed;
        }
      }
    }

    if (format === 'year') {
      const errorMsg = validateQuestionnaireYear(trimmedValue, effectiveBirthYear);
      if (errorMsg) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMsg
        });
        return;
      }
    }

    if (field.type === 'DATE') {
      if (!isValidIsoDate(trimmedValue)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pilih tanggal yang valid'
        });
        return;
      }

      const dateObj = new Date(trimmedValue);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (field.id === 'marriageDate') {
        if (dateObj > today) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tanggal menikah tidak boleh di masa depan'
          });
          return;
        }

        const motherBirth = allValues?.['motherBirthDate'] || allValues?.['birthDate'];
        if (motherBirth && isValidIsoDate(motherBirth)) {
          const birthObj = new Date(motherBirth);
          if (dateObj <= birthObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal menikah tidak boleh lebih awal dari tanggal lahir pasien'
            });
            return;
          }

          const minMarriageDate = new Date(birthObj);
          minMarriageDate.setFullYear(minMarriageDate.getFullYear() + 12);
          if (dateObj < minMarriageDate) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Usia saat menikah minimal 12 tahun'
            });
            return;
          }
        } else if (birthYear && !Number.isNaN(birthYear)) {
          if (dateObj.getFullYear() < birthYear) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tahun menikah tidak boleh lebih awal dari tahun kelahiran pasien (${birthYear})`
            });
            return;
          }
        }
      }

      if (
        field.id === 'motherBirthDate' ||
        field.id === 'partnerBirthDate' ||
        field.id === 'childBirthDate' ||
        field.id === 'birthDate'
      ) {
        if (dateObj > today) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tanggal lahir tidak boleh di masa depan'
          });
          return;
        }
      }

      if (field.id === 'hphtDate' || field.id === 'hpht') {
        if (dateObj > today) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tanggal HPHT tidak boleh di masa depan'
          });
          return;
        }

        const motherBirth = allValues?.['motherBirthDate'] || allValues?.['birthDate'];
        if (motherBirth && isValidIsoDate(motherBirth)) {
          const birthObj = new Date(motherBirth);
          if (dateObj <= birthObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal HPHT tidak boleh lebih awal dari tanggal lahir pasien'
            });
            return;
          }
        } else if (birthYear && !Number.isNaN(birthYear)) {
          if (dateObj.getFullYear() < birthYear) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tahun HPHT tidak boleh lebih awal dari tahun kelahiran pasien (${birthYear})`
            });
            return;
          }
        }
      }

      const isContraceptionStartDate =
        /^contracepti(?:on|ve)\d*StartDate$/i.test(field.id) ||
        (field.id.endsWith('StartDate') && field.id.toLowerCase().includes('contra'));

      if (isContraceptionStartDate) {
        if (dateObj > today) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tanggal mulai KB tidak boleh di masa depan'
          });
          return;
        }

        const motherBirth = allValues?.['motherBirthDate'] || allValues?.['birthDate'];
        if (motherBirth && isValidIsoDate(motherBirth)) {
          const birthObj = new Date(motherBirth);
          if (dateObj <= birthObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal mulai KB tidak boleh lebih awal dari tanggal lahir pasien'
            });
            return;
          }

          const minContraceptionDate = new Date(birthObj);
          minContraceptionDate.setFullYear(minContraceptionDate.getFullYear() + 10);
          if (dateObj < minContraceptionDate) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Usia saat mulai menggunakan KB minimal 10 tahun'
            });
            return;
          }
        } else if (effectiveBirthYear && !Number.isNaN(effectiveBirthYear)) {
          if (dateObj.getFullYear() < effectiveBirthYear) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tahun mulai KB tidak boleh lebih awal dari tahun kelahiran pasien (${effectiveBirthYear})`
            });
            return;
          }
          if (dateObj.getFullYear() < effectiveBirthYear + 10) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Usia saat mulai menggunakan KB minimal 10 tahun'
            });
            return;
          }
        }

        const correspondingStopFieldId = field.id.replace(/StartDate$/i, 'StopDate');
        const stopDateStr = allValues?.[correspondingStopFieldId];
        if (stopDateStr && isValidIsoDate(stopDateStr)) {
          const stopObj = new Date(stopDateStr);
          if (dateObj > stopObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal mulai KB tidak boleh melebihi tanggal lepas atau berhenti'
            });
            return;
          }
        }
      }

      const isContraceptionStopDate =
        /^contracepti(?:on|ve)\d*StopDate$/i.test(field.id) ||
        (field.id.endsWith('StopDate') && field.id.toLowerCase().includes('contra'));

      if (isContraceptionStopDate) {
        if (dateObj > today) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tanggal lepas KB tidak boleh di masa depan'
          });
          return;
        }

        const motherBirth = allValues?.['motherBirthDate'] || allValues?.['birthDate'];
        if (motherBirth && isValidIsoDate(motherBirth)) {
          const birthObj = new Date(motherBirth);
          if (dateObj <= birthObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal lepas KB tidak boleh lebih awal dari tanggal lahir pasien'
            });
            return;
          }
        } else if (effectiveBirthYear && !Number.isNaN(effectiveBirthYear)) {
          if (dateObj.getFullYear() < effectiveBirthYear) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tahun lepas KB tidak boleh lebih awal dari tahun kelahiran pasien (${effectiveBirthYear})`
            });
            return;
          }
        }

        const correspondingStartFieldId = field.id.replace(/StopDate$/i, 'StartDate');
        const startDateStr = allValues?.[correspondingStartFieldId];
        if (startDateStr && isValidIsoDate(startDateStr)) {
          const startObj = new Date(startDateStr);
          if (dateObj < startObj) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tanggal lepas KB tidak boleh lebih awal dari tanggal mulai pemakaian'
            });
            return;
          }
        }
      }
    }

    if (
      (field.type === 'LIST' || field.type === 'MULTIPLE_CHOICE') &&
      field.choices.length > 0
    ) {
      const isAllowed = field.choices.some((c) =>
        typeof c === 'string'
          ? c === trimmedValue
          : c.value === trimmedValue || c.label === trimmedValue
      );
      if (!isAllowed) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pilih salah satu opsi'
        });
      }
    }
  });
}

export function isMedicalSectionValid(
  section: MedicalFormSection | undefined,
  values: MedicalAppointmentValues
): boolean {
  if (!section) {
    return false;
  }

  const birthDateVal = values['motherBirthDate'] || values['birthDate'] || '';
  let birthYear: number | null = null;
  if (birthDateVal) {
    const parsed = new Date(birthDateVal).getFullYear();
    if (!Number.isNaN(parsed)) {
      birthYear = parsed;
    }
  }

  return section.fields.every((field) => {
    if (field.visibleIf && !field.visibleIf(values)) {
      return true;
    }

    const isFieldValid = getMedicalFieldValidationSchema(
      field,
      birthYear,
      values
    ).safeParse(values[field.id] || '').success;
    if (!isFieldValid) {
      return false;
    }

    return true;
  });
}

const measurementFieldIds = new Set([
  'heightCm',
  'prePregnancyWeightKg',
  'upperArmCircumferenceCm',
  'initialBmi',
  'birthWeightGrams',
  'birthLengthCm',
  'weightKg'
]);

export function normalizeMedicalFieldInput(field: MedicalFormField, value: string): string {
  if (
    measurementFieldIds.has(field.id) ||
    field.id.endsWith('BirthWeight') ||
    field.id.endsWith('BirthLength') ||
    field.id.endsWith('GestationalAgeAtBirth')
  ) {
    return value.replace(/[^\d.,]/g, '');
  }

  const format = getMedicalFieldFormat(field);
  switch (format) {
    case 'nik':
      return value.replace(/\D/g, '').slice(0, 16);
    case 'phone':
      return value.replace(/\D/g, '').slice(0, 15);
    case 'count':
      return value.replace(/\D/g, '').slice(0, 2);
    case 'year':
      return value.replace(/\D/g, '').slice(0, 4);
    default:
      return value;
  }
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export interface ContraceptiveValidationInput {
  startDate?: string | null;
  stopDate?: string | null;
  contraceptiveType?: string | null;
}

export function validateContraceptiveEntry(
  entry: ContraceptiveValidationInput,
  motherBirthDate?: string | null
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let startObj: Date | null = null;
  let stopObj: Date | null = null;

  let birthDateObj: Date | null = null;
  if (motherBirthDate && isValidIsoDate(motherBirthDate)) {
    birthDateObj = new Date(motherBirthDate);
  }

  if (entry.startDate && entry.startDate.trim() !== '') {
    if (!isValidIsoDate(entry.startDate)) {
      errors.startDate = 'Format tanggal mulai KB tidak valid';
    } else {
      const d = new Date(entry.startDate);
      startObj = d;
      if (d > today) {
        errors.startDate = 'Tanggal mulai KB tidak boleh di masa depan';
      } else if (birthDateObj) {
        if (d <= birthDateObj) {
          errors.startDate = 'Tanggal mulai KB tidak boleh lebih awal dari tanggal lahir pasien';
        } else {
          const minStart = new Date(birthDateObj);
          minStart.setFullYear(minStart.getFullYear() + 10);
          if (d < minStart) {
            errors.startDate = 'Usia saat mulai menggunakan KB minimal 10 tahun';
          }
        }
      }
    }
  }

  if (entry.stopDate && entry.stopDate.trim() !== '') {
    if (!isValidIsoDate(entry.stopDate)) {
      errors.stopDate = 'Format tanggal lepas KB tidak valid';
    } else {
      const d = new Date(entry.stopDate);
      stopObj = d;
      if (d > today) {
        errors.stopDate = 'Tanggal lepas KB tidak boleh di masa depan';
      } else if (birthDateObj && d <= birthDateObj) {
        errors.stopDate = 'Tanggal lepas KB tidak boleh lebih awal dari tanggal lahir pasien';
      }
    }
  }

  if (startObj && stopObj && stopObj < startObj) {
    errors.stopDate = 'Tanggal lepas KB tidak boleh lebih awal dari tanggal mulai pemakaian';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export interface PreviousPregnancyValidationInput {
  birthYear?: string | null;
  birthWeightGrams?: string | number | null;
  birthLengthCm?: string | number | null;
}

export function validatePregnancyHistoryEntry(
  entry: PreviousPregnancyValidationInput,
  motherBirthDate?: string | null
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  let birthYearNum: number | null = null;
  if (motherBirthDate) {
    const parsed = new Date(motherBirthDate).getFullYear();
    if (!Number.isNaN(parsed)) {
      birthYearNum = parsed;
    }
  }

  if (entry.birthYear && entry.birthYear.trim() !== '') {
    const yearError = validateQuestionnaireYear(entry.birthYear, birthYearNum);
    if (yearError) {
      errors.birthYear = yearError;
    }
  }

  if (entry.birthWeightGrams !== undefined && entry.birthWeightGrams !== null && entry.birthWeightGrams !== '') {
    const w = Number(String(entry.birthWeightGrams).replace(',', '.'));
    if (Number.isNaN(w) || w < 0 || w > 30000) {
      errors.birthWeightGrams = 'Berat lahir harus antara 0 - 30.000 gram';
    }
  }

  if (entry.birthLengthCm !== undefined && entry.birthLengthCm !== null && entry.birthLengthCm !== '') {
    const l = Number(String(entry.birthLengthCm).replace(',', '.'));
    if (Number.isNaN(l) || l < 0 || l > 150) {
      errors.birthLengthCm = 'Panjang lahir harus antara 0 - 150 cm';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateImmunizationDateEntry(
  injectionDate?: string | null,
  childBirthDate?: string | null
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (injectionDate && injectionDate.trim() !== '') {
    if (!isValidIsoDate(injectionDate)) {
      errors.injectionDate = 'Format tanggal suntik tidak valid';
    } else {
      const d = new Date(injectionDate);
      if (d > today) {
        errors.injectionDate = 'Tanggal suntik tidak boleh di masa depan';
      } else if (childBirthDate && isValidIsoDate(childBirthDate)) {
        const birthObj = new Date(childBirthDate);
        if (d < birthObj) {
          errors.injectionDate = 'Tanggal suntik tidak boleh lebih awal dari tanggal lahir anak';
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
