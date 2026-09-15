/**
 * ACOG-Compliant Obstetric Calculator (Committee Opinion No. 700 & reVITALize Guidelines)
 *
 * Standar Obstetri:
 * - Dasar HPL: 280 hari (40 minggu) dari HPHT (LMP).
 * - Usia Kehamilan (UK) dihitung dinamis dari HPL final dan tanggal referensi pemeriksaan:
 *   UK (hari) = 280 - (HPL - tanggal_pemeriksaan)
 *   minggu = floor(total_hari / 7)
 *   hari   = total_hari % 7
 * - Best Obstetric Estimate Hierarchy & Redating Thresholds:
 *   1. ART / IVF (berdasarkan tanggal transfer embrio dan usia embrio hari ke-3 / ke-5)
 *   2. USG Trimester 1 (pengukuran CRL) - akurasi ±5-7 hari
 *   3. USG Trimester 2 (BPD, HC, AC, FL)
 *   4. HPHT (LMP) jika siklus reguler dan dapat dipercaya
 */

export const GESTATION_DAYS = 280;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type ObstetricDatingMethod =
  | 'LMP'
  | 'FIRST_TRIMESTER_ULTRASOUND'
  | 'SECOND_TRIMESTER_ULTRASOUND'
  | 'ART';

export interface GestationalAgeResult {
  weeks: number;
  days: number;
  totalDays: number;
  formatted: string; // e.g. "17 minggu 5 hari"
  formattedMedical: string; // e.g. "17 5/7 minggu"
}

export interface ObstetricDatingParams {
  lmpDate?: Date | string | null;
  referenceDate?: Date | string | null; // Tanggal pemeriksaan (default: hari ini)
  usgDate?: Date | string | null;
  usgGestationalAge?: {
    weeks: number;
    days?: number;
  } | null;
  crlMm?: number | null; // Crown-Rump Length dalam milimeter
  isArt?: boolean;
  artTransferDate?: Date | string | null;
  artEmbryoAgeDays?: 3 | 5;
}

export interface BestObstetricEstimate {
  eddFinal: Date;
  eddFinalFormatted: string;
  datingMethod: ObstetricDatingMethod;
  isRedated: boolean;
  redatingReason?: string;
  gestationalAgeAtReference: GestationalAgeResult;
  eddLmp?: Date;
  eddUsg?: Date;
  eddArt?: Date;
}

/**
 * Normalizes input date to UTC Midnight to prevent timezone offset bugs.
 */
export function toUtcDateOnly(input: Date | string): Date {
  if (input instanceof Date) {
    return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const slashMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(
      Date.UTC(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
    );
  }

  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${input}`);
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

/**
 * Calculates Estimated Due Date (HPL) from Last Menstrual Period (HPHT).
 * Standard ACOG: HPL = HPHT + 280 hari (40 minggu).
 */
export function calculateEddFromLmp(lmp: Date | string): Date {
  const lmpDate = toUtcDateOnly(lmp);
  return new Date(lmpDate.getTime() + GESTATION_DAYS * DAY_IN_MS);
}

/**
 * Calculates dynamic Gestational Age (UK) from EDD/HPL and a reference date (tanggal pemeriksaan).
 * Formula:
 * UK (hari) = 280 - (HPL - referenceDate)
 * minggu = floor(total_hari / 7)
 * hari   = total_hari % 7
 */
export function calculateGestationalAge(
  edd: Date | string,
  referenceDate: Date | string = new Date()
): GestationalAgeResult {
  const eddDate = toUtcDateOnly(edd);
  const refDate = toUtcDateOnly(referenceDate);

  const daysUntilEdd = Math.round((eddDate.getTime() - refDate.getTime()) / DAY_IN_MS);
  const totalDays = GESTATION_DAYS - daysUntilEdd;

  if (totalDays < 0) {
    return {
      weeks: 0,
      days: 0,
      totalDays: 0,
      formatted: '0 minggu 0 hari',
      formattedMedical: '0 0/7 minggu'
    };
  }

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return {
    weeks,
    days,
    totalDays,
    formatted: `${weeks} minggu ${days} hari`,
    formattedMedical: `${weeks} ${days}/7 minggu`
  };
}

/**
 * Calculates EDD from ultrasound measurement.
 * Remaining days until EDD = 280 - (weeks * 7 + days).
 */
export function calculateEddFromUsg(usgDate: Date | string, gaWeeks: number, gaDays = 0): Date {
  const usgDateNormalized = toUtcDateOnly(usgDate);
  const gaTotalDays = gaWeeks * 7 + gaDays;
  const remainingDays = GESTATION_DAYS - gaTotalDays;

  return new Date(usgDateNormalized.getTime() + remainingDays * DAY_IN_MS);
}

/**
 * Calculates EDD from Crown-Rump Length (CRL in mm) using Hadlock formula approximation.
 * Applicable for CRL 10mm to 84mm (approx 7w0d to 14w0d).
 */
export function calculateEddFromCrl(usgDate: Date | string, crlMm: number): Date {
  // Hadlock formula: GA (days) = 57.06 + (0.74 * CRL) - (0.0006 * CRL^2)
  const gaDays = Math.round(57.06 + 0.74 * crlMm - 0.0006 * Math.pow(crlMm, 2));
  const remainingDays = GESTATION_DAYS - gaDays;
  const usgDateNormalized = toUtcDateOnly(usgDate);

  return new Date(usgDateNormalized.getTime() + remainingDays * DAY_IN_MS);
}

/**
 * Calculates EDD from Assisted Reproductive Technology (ART / IVF).
 * For Day 5 embryo: EDD = transferDate + 261 days (280 - 19)
 * For Day 3 embryo: EDD = transferDate + 263 days (280 - 17)
 */
export function calculateEddFromArt(transferDate: Date | string, embryoAgeDays: 3 | 5 = 5): Date {
  const transfer = toUtcDateOnly(transferDate);
  const daysToAdd = embryoAgeDays === 5 ? 261 : 263;

  return new Date(transfer.getTime() + daysToAdd * DAY_IN_MS);
}

/**
 * Formats a Date object to standard Indonesian date string.
 * Example: "19 Februari 2027"
 */
export function formatIndonesianDateText(date: Date | string): string {
  const normalized = toUtcDateOnly(date);
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  return `${normalized.getUTCDate()} ${months[normalized.getUTCMonth()]} ${normalized.getUTCFullYear()}`;
}

/**
 * Determines the Best Obstetric Estimate (HPL Final) based on ACOG Committee Opinion No. 700 hierarchy.
 */
export function determineBestObstetricEdd(params: ObstetricDatingParams): BestObstetricEstimate {
  const referenceDate = params.referenceDate ? toUtcDateOnly(params.referenceDate) : new Date();

  // 1. Priority 1: ART (IVF)
  if (params.isArt && params.artTransferDate) {
    const eddArt = calculateEddFromArt(params.artTransferDate, params.artEmbryoAgeDays || 5);
    const ga = calculateGestationalAge(eddArt, referenceDate);

    return {
      eddFinal: eddArt,
      eddFinalFormatted: formatIndonesianDateText(eddArt),
      datingMethod: 'ART',
      isRedated: false,
      gestationalAgeAtReference: ga,
      eddArt
    };
  }

  // Calculate LMP EDD if available
  const eddLmp = params.lmpDate ? calculateEddFromLmp(params.lmpDate) : undefined;

  // Calculate USG EDD if available
  let eddUsg: Date | undefined;
  let usgGaTotalDays = 0;

  if (params.usgDate) {
    if (params.crlMm && params.crlMm > 0) {
      eddUsg = calculateEddFromCrl(params.usgDate, params.crlMm);
      // approximate GA at USG
      const usgDateNormalized = toUtcDateOnly(params.usgDate);
      usgGaTotalDays = Math.round((eddUsg.getTime() - usgDateNormalized.getTime()) / DAY_IN_MS);
      usgGaTotalDays = GESTATION_DAYS - usgGaTotalDays;
    } else if (params.usgGestationalAge && params.usgGestationalAge.weeks > 0) {
      const weeks = params.usgGestationalAge.weeks;
      const days = params.usgGestationalAge.days || 0;
      eddUsg = calculateEddFromUsg(params.usgDate, weeks, days);
      usgGaTotalDays = weeks * 7 + days;
    }
  }

  // 2. If LMP is NOT available or unreliable, USG becomes the sole source
  if (!eddLmp) {
    if (eddUsg) {
      const isFirstTrimester = usgGaTotalDays <= 13 * 7 + 6;
      const method: ObstetricDatingMethod = isFirstTrimester
        ? 'FIRST_TRIMESTER_ULTRASOUND'
        : 'SECOND_TRIMESTER_ULTRASOUND';
      const ga = calculateGestationalAge(eddUsg, referenceDate);

      return {
        eddFinal: eddUsg,
        eddFinalFormatted: formatIndonesianDateText(eddUsg),
        datingMethod: method,
        isRedated: false,
        gestationalAgeAtReference: ga,
        eddUsg
      };
    }

    // Default fallback if neither is provided
    const fallbackEdd = new Date();
    return {
      eddFinal: fallbackEdd,
      eddFinalFormatted: formatIndonesianDateText(fallbackEdd),
      datingMethod: 'LMP',
      isRedated: false,
      gestationalAgeAtReference: {
        weeks: 0,
        days: 0,
        totalDays: 0,
        formatted: '0 minggu 0 hari',
        formattedMedical: '0 0/7 minggu'
      }
    };
  }

  // 3. Both LMP and USG available -> Apply ACOG Redating Guidelines
  if (eddUsg) {
    // Difference between LMP EDD and USG EDD in days
    const discrepancyDays = Math.abs(Math.round((eddLmp.getTime() - eddUsg.getTime()) / DAY_IN_MS));

    let redatingThresholdDays = 7; // Default for <= 13 6/7 weeks
    let method: ObstetricDatingMethod = 'FIRST_TRIMESTER_ULTRASOUND';

    if (usgGaTotalDays <= 8 * 7 + 6) {
      redatingThresholdDays = 5;
    } else if (usgGaTotalDays <= 13 * 7 + 6) {
      redatingThresholdDays = 7;
    } else if (usgGaTotalDays <= 15 * 7 + 6) {
      redatingThresholdDays = 7;
      method = 'SECOND_TRIMESTER_ULTRASOUND';
    } else if (usgGaTotalDays <= 21 * 7 + 6) {
      redatingThresholdDays = 10;
      method = 'SECOND_TRIMESTER_ULTRASOUND';
    } else if (usgGaTotalDays <= 27 * 7 + 6) {
      redatingThresholdDays = 14;
      method = 'SECOND_TRIMESTER_ULTRASOUND';
    } else {
      redatingThresholdDays = 21;
      method = 'SECOND_TRIMESTER_ULTRASOUND';
    }

    if (discrepancyDays > redatingThresholdDays) {
      // Redate to USG
      const ga = calculateGestationalAge(eddUsg, referenceDate);
      return {
        eddFinal: eddUsg,
        eddFinalFormatted: formatIndonesianDateText(eddUsg),
        datingMethod: method,
        isRedated: true,
        redatingReason: `Selisih USG dan HPHT (${discrepancyDays} hari) melebihi ambang ACOG (${redatingThresholdDays} hari) pada UK ${Math.floor(usgGaTotalDays / 7)} minggu. HPL disesuaikan ke hasil USG.`,
        gestationalAgeAtReference: ga,
        eddLmp,
        eddUsg
      };
    }
  }

  // Keep LMP as the primary dating method
  const ga = calculateGestationalAge(eddLmp, referenceDate);
  return {
    eddFinal: eddLmp,
    eddFinalFormatted: formatIndonesianDateText(eddLmp),
    datingMethod: 'LMP',
    isRedated: false,
    gestationalAgeAtReference: ga,
    eddLmp,
    eddUsg
  };
}
