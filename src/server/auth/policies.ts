'server-only';

export interface AuthUserDescriptor {
  readonly role?: string;
  readonly isClinical?: boolean;
  readonly permissions?: string[];
  readonly [key: string]: unknown;
}

export const AuthPolicies = {
  isAdmin(user: AuthUserDescriptor): boolean {
    return user.role === 'admin' || (user.permissions?.includes('roles:manage') ?? false);
  },

  isMedicalStaff(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.isClinical);
  },

  isStaff(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.permissions && user.permissions.length > 0);
  },

  isPatient(user: AuthUserDescriptor): boolean {
    return user.role === 'patient';
  },

  canCallQueue(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.permissions?.includes('queue:call') || user.isClinical);
  },

  canEditMedicalRecords(user: AuthUserDescriptor): boolean {
    if (AuthPolicies.isAdmin(user)) return true;
    return Boolean(user.permissions?.includes('records:write') || user.isClinical);
  },

  canAccessBackoffice(user: AuthUserDescriptor): boolean {
    return AuthPolicies.isAdmin(user);
  }
} as const;
