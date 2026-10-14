export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

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

export function getRelationshipLabel(type?: string | null, label?: string | null): string {
  if (label) return label;
  const normType = (type || '').toLowerCase();
  switch (normType) {
    case 'child':
      return 'Anak';
    case 'spouse':
      return 'Pasangan';
    case 'parent':
      return 'Orang Tua';
    case 'relative':
      return 'Kerabat';
    default:
      return 'Keluarga';
  }
}

// Deprecated alias for backwards compatibility
export function getRelationshipBadge(type?: string | null, label?: string | null) {
  const statusKey = getRelationshipStatusKey(type);
  const displayLabel = getRelationshipLabel(type, label);
  return { label: displayLabel, statusKey };
}

export const GENDER_LABEL_MAP: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
};

export function getGenderLabel(gender?: string | null): string {
  if (!gender) return '-';
  return GENDER_LABEL_MAP[gender] || gender;
}

export const PROFILE_TYPE_OPTIONS = [
  { label: 'Akun Utama', value: 'master' },
  { label: 'Afiliasi', value: 'affiliate' },
];

export const BLOOD_TYPE_OPTIONS = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
  { label: 'Belum Tahu', value: 'Belum Tahu' },
];

export const profileTypeFilterFn = (
  row: { depth: number; subRows?: any[] },
  _columnId: string,
  filterValue: string | string[]
): boolean => {
  const selected = Array.isArray(filterValue) ? filterValue : [filterValue];
  if (selected.length === 0) return true;
  const isSubRow = row.depth > 0;

  return selected.some((val) => {
    if (val === 'master') return !isSubRow;
    if (val === 'affiliate') return isSubRow || Boolean(row.subRows && row.subRows.length > 0);
    return false;
  });
};

export const genderFilterFn = (
  row: {
    original: { gender?: string | null };
    subRows?: Array<{ original: { gender?: string | null } }>;
  },
  _columnId: string,
  filterValue: string | string[]
): boolean => {
  const selected = Array.isArray(filterValue) ? filterValue : [filterValue];
  if (selected.length === 0) return true;
  const target = row.original.gender;
  if (target && selected.includes(target)) {
    return true;
  }
  if (row.subRows && row.subRows.length > 0) {
    return row.subRows.some((sub) => {
      const subG = sub.original.gender;
      return Boolean(subG && selected.includes(subG));
    });
  }
  return false;
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
      phone_number?: string | null;
    };
    subRows?: Array<{
      original: {
        name?: string | null;
        patient_id?: string | null;
        masked_nik?: string | null;
        nik?: string | null;
        email?: string | null;
        phone_number?: string | null;
      };
    }>;
  },
  _columnId: string,
  filterValue: unknown
): boolean => {
  const rawVal = Array.isArray(filterValue) ? filterValue[0] : filterValue;
  const str = String(rawVal ?? '').trim();
  if (!str) return true;
  const q = str.toLowerCase();

  const matchItem = (item: {
    name?: string | null;
    patient_id?: string | null;
    masked_nik?: string | null;
    nik?: string | null;
    email?: string | null;
    phone_number?: string | null;
  }) =>
    Boolean(
      item.name?.toLowerCase().includes(q) ||
      item.patient_id?.toLowerCase().includes(q) ||
      item.masked_nik?.toLowerCase().includes(q) ||
      item.nik?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone_number?.toLowerCase().includes(q)
    );

  if (matchItem(row.original)) return true;
  if (row.subRows && row.subRows.length > 0) {
    return row.subRows.some((sub) => matchItem(sub.original));
  }
  return false;
};

