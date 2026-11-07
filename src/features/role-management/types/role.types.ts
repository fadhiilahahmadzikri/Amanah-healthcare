import {
  AUDIENCE,
  CLINICAL_MODULE_INFO,
  type AudienceType,
  type ModuleInfo
} from '@/core/auth/permissions.constants';

export { AUDIENCE, CLINICAL_MODULE_INFO, type ModuleInfo };

export interface Permission {
  id: string;
  code: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type RoleAudience = AudienceType;

export interface ApplicationPage {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  routePath: string;
  customAlias?: string | null;
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
  audience: RoleAudience;
  isClinical: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: Permission[];
  effectivePermissionCodes?: string[];
  userCount?: number;
  staffCount?: number;
}

export interface CreateRolePayload {
  code?: string;
  name: string;
  description?: string | null;
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
  audience?: RoleAudience;
  isClinical?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}
