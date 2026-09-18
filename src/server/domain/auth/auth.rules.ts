import 'server-only';
import type { User, MedicalStaffProfile } from './auth.model';

export const AuthRules = {
  isStaffActive(staff?: MedicalStaffProfile | null): boolean {
    return Boolean(staff?.isActive);
  },

  canAccessElectronicMedicalRecords(user: User): boolean {
    if (user.systemRole === 'ADMIN') return true;
    if (user.systemRole === 'STAF' && user.staff && user.staff.isActive) {
      return true;
    }
    return false;
  },

  isPatientEligibleForBooking(user: User): boolean {
    return user.systemRole === 'PATIENT' && Boolean(user.patient);
  }
} as const;
