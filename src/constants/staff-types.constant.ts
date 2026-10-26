export const STAFF_TYPES = {
  DOCTOR: 'doctor',
  MIDWIFE: 'midwife',
  WORKER: 'worker'
} as const;

export type StaffType = (typeof STAFF_TYPES)[keyof typeof STAFF_TYPES];

export const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  [STAFF_TYPES.DOCTOR]: 'Dokter',
  [STAFF_TYPES.MIDWIFE]: 'Bidan',
  [STAFF_TYPES.WORKER]: 'Staf Operasional'
};

/**
 * Canonical system & database roles (mapped 1-to-1 from PostgreSQL `roles` table and backend auth).
 * Single Source of Truth for frontend authorization.
 */
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  STAF: 'STAF',
  PATIENT: 'PATIENT'
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const CANONICAL_ROLES = {
  ADMIN: 'admin',
  PATIENT: 'patient',
  STAFF_DOCTOR: 'staff_doctor',
  STAFF_MIDWIFE: 'staff_midwife',
  STAFF_WORKER: 'staff_worker'
} as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[keyof typeof CANONICAL_ROLES];

export const CLINICAL_PRACTITIONER_ROLES = [
  CANONICAL_ROLES.STAFF_DOCTOR,
  CANONICAL_ROLES.STAFF_MIDWIFE
] as const;

export const CLINICAL_PRACTITIONER_ROLES_SET = new Set<string>(CLINICAL_PRACTITIONER_ROLES);
