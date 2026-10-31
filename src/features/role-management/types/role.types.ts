import {
  AUDIENCE,
  ROLE_TIER,
  type AudienceType,
  type RoleTierType
} from '@/core/auth/permissions.constants';

export { AUDIENCE, ROLE_TIER };

export interface Permission {
  id: string;
  code: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type RoleTier = RoleTierType;
export type RoleAudience = AudienceType;

export const NO_PARENT_ROLE_SENTINEL = 'none';

export interface ApplicationPage {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  routePath: string;
  parentPageId?: string | null;
  audience: RoleAudience;
  isEnabled: boolean;
  icon?: string | null;
  displayOrder: number;
  isSystem: boolean;
  effectiveEnabled?: boolean;
  children?: ApplicationPage[];
}

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
  isActive?: boolean;
  isDefault?: boolean;
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
  isActive?: boolean;
  isDefault?: boolean;
  permissionIds?: string[];
  pageIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string | null;
  parentRoleId?: string | null;
  tier?: RoleTier;
  audience?: RoleAudience;
  isClinical?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}
