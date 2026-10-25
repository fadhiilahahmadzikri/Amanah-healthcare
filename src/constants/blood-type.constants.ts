/**
 * Konstanta sentral untuk tipe dan nilai khusus golongan darah.
 * Selaras dengan nilai enum PostgreSQL 'public.blood_type'.
 */
export const UNKNOWN_BLOOD_TYPE = 'unknown' as const;

export type PatientBloodType = string;

export function formatBloodTypeDisplay(raw?: string | null): string {
  if (!raw) return '-';
  const clean = raw.trim().toLowerCase();
  if (clean === UNKNOWN_BLOOD_TYPE) return 'Belum Tahu';
  return clean
    .replace(/_positive$/i, '+')
    .replace(/_negative$/i, '-')
    .replace(/_/g, ' ')
    .toUpperCase();
}
