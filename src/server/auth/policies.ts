import 'server-only';
import {
  CANONICAL_ROLES,
  CLINICAL_PRACTITIONER_ROLES_SET,
  SYSTEM_ROLES,
  type CanonicalRole,
  type SystemRole
} from '@/constants/staff-types.constant';

export type { SystemRole, CanonicalRole as ClinicalRole };

export interface AuthUserDescriptor {
  readonly systemRole?: SystemRole;
  readonly role?: string;
}

const MEDICAL_ROLES_SET = new Set<string>([
  CANONICAL_ROLES.ADMIN,
  CANONICAL_ROLES.STAFF_DOCTOR,
  CANONICAL_ROLES.STAFF_MIDWIFE
]);

export const AuthPolicies = {
  isAdmin(user: AuthUserDescriptor): boolean {
    return user.systemRole === SYSTEM_ROLES.ADMIN || user.role === CANONICAL_ROLES.ADMIN;
  },

  isMedicalStaff(user: AuthUserDescriptor): boolean {
    if (user.systemRole === SYSTEM_ROLES.ADMIN) return true;
    return Boolean(user.role && MEDICAL_ROLES_SET.has(user.role));
  },

  isStaff(user: AuthUserDescriptor): boolean {
    return user.systemRole === SYSTEM_ROLES.ADMIN || user.systemRole === SYSTEM_ROLES.STAF;
  },

  isPatient(user: AuthUserDescriptor): boolean {
    return user.systemRole === SYSTEM_ROLES.PATIENT || user.role === CANONICAL_ROLES.PATIENT;
  },

  canCallQueue(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.role && CLINICAL_PRACTITIONER_ROLES_SET.has(user.role));
  },

  canEditMedicalRecords(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.role && CLINICAL_PRACTITIONER_ROLES_SET.has(user.role));
  },

  canAccessBackoffice(user: AuthUserDescriptor): boolean {
    return AuthPolicies.isAdmin(user);
  }
} as const;
