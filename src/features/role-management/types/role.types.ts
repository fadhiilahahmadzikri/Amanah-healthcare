export interface Permission {
  id: string;
  code: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type RoleTier = 'macro' | 'micro';
export type RoleAudience = 'internal' | 'external';

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  parentRoleId?: string | null;
  tier: RoleTier;
  audience: RoleAudience;
  isClinical: boolean;
  createdAt?: string;
  updatedAt?: string;
  parentRole?: Role | null;
  permissions?: Permission[];
  effectivePermissionCodes?: string[];
  staffCount?: number;
  children?: Role[];
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string | null;
  parentRoleId?: string | null;
  tier?: RoleTier;
  audience?: RoleAudience;
  isClinical?: boolean;
  permissionIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string | null;
  parentRoleId?: string | null;
  tier?: RoleTier;
  audience?: RoleAudience;
  isClinical?: boolean;
}
