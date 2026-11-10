export interface UserRoleItem {
  id: string;
  code: string;
  name: string;
  audience: string;
  isSystem: boolean;
  isActive: boolean;
  isClinical: boolean;
}

export type RoleItem = UserRoleItem;

export interface UserStaffSummary {
  id: string;
  staffCode: string;
  fullName: string;
  phone?: string | null;
  positionTitle?: string | null;
  departmentName?: string | null;
  hiredAt?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  primaryUnitId?: string | null;
  primaryUnitName?: string | null;
}

export interface UserPatientAddressSummary {
  fullAddress: string;
  provinceName?: string | null;
  regencyName?: string | null;
  districtName?: string | null;
  villageName?: string | null;
}

export interface UserPatientEmergencyContactSummary {
  name: string;
  relationship?: string | null;
  phone: string;
}

export interface UserPatientSummary {
  id: string;
  medicalRecordNumber: string;
  fullName: string;
  phone?: string | null;
  motherName?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  bloodType?: string | null;
  bloodTypeId?: string | null;
  bloodTypeCode?: string | null;
  occupation?: string | null;
  occupationId?: string | null;
  visitCount?: number;
  lastVisitAt?: string | null;
  address?: UserPatientAddressSummary | null;
  emergencyContact?: UserPatientEmergencyContactSummary | null;
}

export interface UserAffiliationItem {
  id: string;
  patientId: string;
  fullName: string;
  medicalRecordNumber: string;
  relationshipName: string;
  relationLabel?: string | null;
  isPrimary: boolean;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: 'active' | 'inactive' | 'pending_verification' | 'suspended';
  preferredLocale?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  authVersion: number;
  authProviders?: string[];
  hasGoogle?: boolean;
  hasPassword?: boolean;
  roles: UserRoleItem[];
  primaryRole?: UserRoleItem | null;
  primaryAudience: string;
  staffProfileId?: string | null;
  staffProfile?: UserStaffSummary | null;
  patientProfileId?: string | null;
  patientProfile?: UserPatientSummary | null;
  patientAffiliations?: UserAffiliationItem[];
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name: string;
  email?: string;
  phone?: string | null;
  status?: string;
  preferredLocale?: string;
  roleIds?: string[];
}

export interface UserListResponse {
  users: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  roleId?: string;
  status?: string;
  audience?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface DriverMetadata {
  format: string;
  displayName: string;
  extension: string;
  mimeType: string;
  supportsRestore: boolean;
  description: string;
}

export interface RestorePreviewResponse {
  valid: boolean;
  totalRecords: number;
  newCount: number;
  duplicateCount: number;
  invalidCount: number;
  errors: string[];
  preview: {
    email: string;
    name: string;
    phone?: string | null;
    roleCodes: string[];
    status: string;
    action: 'create' | 'update' | 'skip';
    reasons: string[];
  }[];
}

export interface RestoreExecuteResponse {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: string[];
  message: string;
}
