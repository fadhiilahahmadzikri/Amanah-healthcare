import 'server-only';
import type { User, MedicalStaffProfile } from './auth.model';
import { AUDIENCE, PERMISSIONS } from '@/core/auth/permissions.constants';

export const AuthRules = {
  isStaffActive(staff?: MedicalStaffProfile | null): boolean {
    return Boolean(staff?.isActive);
  },

  canAccessElectronicMedicalRecords(user: User): boolean {
    if (user.audience === AUDIENCE.INTERNAL) {
      return (
        user.permissions.includes(PERMISSIONS.WILDCARD) ||
        user.permissions.includes(PERMISSIONS.RECORDS.READ)
      );
    }
    return false;
  },

  isPatientEligibleForBooking(user: User): boolean {
    return user.audience === AUDIENCE.EXTERNAL;
  }
} as const;
