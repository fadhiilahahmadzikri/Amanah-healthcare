export interface FacilityUnitType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  isActive: boolean;
  unitCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityUnit {
  id: string;
  name: string;
  code: string;
  unitTypeId: string;
  unitType?: FacilityUnitType | null;
  unitTypeName?: string | null;
  queuePrefix?: string | null;
  iconName?: string | null;
  location?: string | null;
  floor?: string | null;
  isActive: boolean;
  roomCount?: number;
  categoryCount?: number;
  categoryIds?: string[];
  categories?: Array<{
    id: string;
    name: string;
    code: string;
    iconName?: string;
    isPrimary?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityRoom {
  id: string;
  unitId: string;
  unitName?: string | null;
  name: string;
  code: string;
  location?: string | null;
  floor?: string | null;
  isActive: boolean;
  unit?: FacilityUnit;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCategory {
  id: string;
  unitId?: string | null;
  unitName?: string | null;
  unitIds?: string[];
  units?: Array<{ id: string; name: string }>;
  name: string;
  code: string;
  codePrefix?: string | null;
  iconName?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  unit?: FacilityUnit;
  serviceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicalIntakeForm {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  isActive: boolean;
  schema?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientRelationshipTypeItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  displayOrder: number;
  isActive: boolean;
  isSystem?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicService {
  id: string;
  serviceCategoryId: string;
  categoryIds?: string[];
  categories?: ServiceCategory[];
  categoryName?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  specialtyId?: string | null;
  intakeFormId?: string | null;
  intakeFormCode?: string | null;
  intakeFormName?: string | null;
  name: string;
  code: string;
  shortName?: string | null;
  description?: string | null;
  codePrefix: string;
  iconName?: string | null;
  displayOrder: number;
  isBookable: boolean;
  isActive: boolean;
  complaints?: string[];
  category?: ServiceCategory;
  intakeForm?: ClinicalIntakeForm | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUnitTypePayload {
  name: string;
  code?: string;
  description?: string;
  iconName?: string;
  isActive?: boolean;
}

export interface CreateUnitPayload {
  name: string;
  code?: string;
  unitTypeId: string;
  queuePrefix?: string;
  iconName?: string;
  location?: string;
  floor?: string;
  isActive?: boolean;
}

export interface CreateRoomPayload {
  unitId: string;
  name: string;
  code?: string;
  location?: string;
  floor?: string;
  isActive?: boolean;
}

export interface CreateCategoryPayload {
  unitId?: string;
  unitIds?: string[];
  name: string;
  code?: string;
  codePrefix?: string;
  iconName?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateServicePayload {
  serviceCategoryId: string;
  categoryIds?: string[];
  intakeFormId?: string | null;
  name: string;
  code?: string;
  shortName?: string;
  description?: string;
  codePrefix?: string;
  iconName?: string;
  displayOrder?: number;
  isBookable?: boolean;
  isActive?: boolean;
  complaints?: string[];
}

export interface CreateIntakeFormPayload {
  name: string;
  code?: string;
  description?: string;
  iconName?: string;
  isActive?: boolean;
  schema?: Record<string, any>;
}

export interface CreateRelationshipPayload {
  name: string;
  code?: string;
  description?: string;
  iconName?: string;
  displayOrder?: number;
  isActive?: boolean;
  isSystem?: boolean;
}

export type UpdateUnitTypePayload = Partial<CreateUnitTypePayload>;
export type UpdateUnitPayload = Partial<CreateUnitPayload>;
export type UpdateRoomPayload = Partial<CreateRoomPayload>;
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
export type UpdateServicePayload = Partial<CreateServicePayload>;
export type UpdateIntakeFormPayload = Partial<CreateIntakeFormPayload>;
export type UpdateRelationshipPayload = Partial<CreateRelationshipPayload>;

export type FacilityResource =
  | 'unit-types'
  | 'units'
  | 'rooms'
  | 'categories'
  | 'services'
  | 'forms'
  | 'relationships';

export type FacilityBulkAction = 'activate' | 'deactivate' | 'delete';

export interface BulkFacilityActionPayload {
  resource: FacilityResource;
  action: FacilityBulkAction;
  ids: string[];
}

export interface BulkFacilityActionResult {
  success: boolean;
  affectedCount: number;
  message: string;
}
