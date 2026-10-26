export function getRelationshipStatusKey(type?: string | null): string {
  const normType = (type || '').toLowerCase();
  switch (normType) {
    case 'child':
      return 'AFILIASI_ANAK';
    case 'spouse':
      return 'AFILIASI_PASANGAN';
    case 'parent':
      return 'AFILIASI_ORANG_TUA';
    case 'relative':
      return 'AFILIASI_KERABAT';
    default:
      return 'AFILIASI_KELUARGA';
  }
}

import { getRelationshipLabel } from '@/constants/relationship.constants';
export { getRelationshipLabel };

// Deprecated alias for backwards compatibility
export function getRelationshipBadge(type?: string | null, label?: string | null) {
  const statusKey = getRelationshipStatusKey(type);
  const displayLabel = getRelationshipLabel(type, label);
  return { label: displayLabel, statusKey };
}

export { getGenderLabel } from '@/constants/gender.constants';

export const PROFILE_TYPE_OPTIONS = [
  { label: 'Akun Utama', value: 'master' },
  { label: 'Afiliasi', value: 'affiliate' }
];

export const profileTypeFilterFn = (
  row: { original: { is_master?: boolean; master_patient_id?: string | null } },
  _columnId: string,
  filterValue: string | string[]
): boolean => {
  const selected = Array.isArray(filterValue) ? filterValue : [filterValue];
  if (selected.length === 0) return true;
  const isMaster = Boolean(row.original.is_master);

  return selected.some((val) => {
    if (val === 'master') return isMaster;
    if (val === 'affiliate') return !isMaster;
    return false;
  });
};

export const genderFilterFn = (
  row: {
    original: { gender?: string | null };
  },
  _columnId: string,
  filterValue: string | string[]
): boolean => {
  const selected = Array.isArray(filterValue) ? filterValue : [filterValue];
  if (selected.length === 0) return true;
  const target = row.original.gender;
  return Boolean(target && selected.includes(target));
};

export const nikFilterFn = (
  row: { original: { nik?: string | null; masked_nik?: string | null } },
  _columnId: string,
  filterValue: unknown
): boolean => {
  const rawVal = Array.isArray(filterValue) ? filterValue[0] : filterValue;
  const str = String(rawVal ?? '').trim();
  if (!str) return true;
  const q = str.toLowerCase();
  const raw = String(row.original.nik || '').toLowerCase();
  const masked = String(row.original.masked_nik || '').toLowerCase();
  return raw.includes(q) || masked.includes(q);
};

export const patientGlobalFilterFn = (
  row: {
    original: {
      name?: string | null;
      patient_id?: string | null;
      masked_nik?: string | null;
      nik?: string | null;
      email?: string | null;
      phone?: string | null;
    };
  },
  _columnId: string,
  filterValue: unknown
): boolean => {
  const rawVal = Array.isArray(filterValue) ? filterValue[0] : filterValue;
  const str = String(rawVal ?? '').trim();
  if (!str) return true;
  const q = str.toLowerCase();

  const item = row.original;
  const searchableFields = [
    item.name,
    item.patient_id,
    item.masked_nik,
    item.nik,
    item.email,
    item.phone
  ];

  return searchableFields.some((field) => Boolean(field?.toLowerCase().includes(q)));
};
