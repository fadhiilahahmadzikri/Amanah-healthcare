/**
 * Konstanta sentral untuk kode golongan darah.
 * Selaras dengan kolom 'code' di database PostgreSQL tabel 'public.blood_types'.
 */
export const UNKNOWN_BLOOD_TYPE = 'unknown' as const;

export type PatientBloodType = string;

export function formatBloodTypeDisplay(raw?: string | null): string {
  return raw || '-';
}
