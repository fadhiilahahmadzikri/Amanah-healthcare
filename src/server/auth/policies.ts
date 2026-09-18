import 'server-only';

export type SystemRole = 'ADMIN' | 'STAF' | 'PATIENT';
export type ClinicalRole = 'admin' | 'staffDoctor' | 'staffMidwife' | 'staffWorker' | 'patient';

export interface AuthUserDescriptor {
  readonly systemRole?: SystemRole;
  readonly role?: string;
  readonly roleCode?: string;
}

export const AuthPolicies = {
  isAdmin(user: AuthUserDescriptor): boolean {
    return user.systemRole === 'ADMIN' || user.role === 'admin' || user.roleCode === 'admin';
  },

  isMedicalStaff(user: AuthUserDescriptor): boolean {
    if (user.systemRole === 'ADMIN') return true;
    const role = user.role || user.roleCode;
    return role === 'staffDoctor' || role === 'staffMidwife' || role === 'admin';
  },

  isStaff(user: AuthUserDescriptor): boolean {
    return user.systemRole === 'ADMIN' || user.systemRole === 'STAF';
  },

  isPatient(user: AuthUserDescriptor): boolean {
    return user.systemRole === 'PATIENT' || user.role === 'patient';
  },

  canCallQueue(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    const role = user.role || user.roleCode;
    return role === 'staffDoctor' || role === 'staffMidwife';
  },

  canEditMedicalRecords(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    const role = user.role || user.roleCode;
    return role === 'staffDoctor' || role === 'staffMidwife';
  },

  canAccessBackoffice(user: AuthUserDescriptor): boolean {
    return AuthPolicies.isAdmin(user);
  }
} as const;
