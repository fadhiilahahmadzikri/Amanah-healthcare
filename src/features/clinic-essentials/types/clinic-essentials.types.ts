export interface FacilityUnit {
  id: string;
  name: string;
  code: string;
  unitType?: string;
  queuePrefix?: string | null;
  iconName?: string | null;
  location?: string | null;
  floor?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityRoom {
  id: string;
  unitId: string;
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
  name: string;
  code: string;
  codePrefix?: string | null;
  iconName?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  unit?: FacilityUnit;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicService {
  id: string;
  serviceCategoryId: string;
  specialtyId?: string | null;
  intakeFormId?: string | null;
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

export interface CreateUnitPayload {
  name: string;
  code: string;
  unitType?: 'department' | 'polyclinic' | 'ward' | 'emergency' | 'support' | 'other';
  queuePrefix?: string;
  iconName?: string;
  location?: string;
  floor?: string;
  isActive?: boolean;
}

export interface CreateRoomPayload {
  unitId: string;
  name: string;
  code: string;
  location?: string;
  floor?: string;
  isActive?: boolean;
}

export interface CreateCategoryPayload {
  unitId?: string;
  name: string;
  code: string;
  codePrefix?: string;
  iconName?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateServicePayload {
  serviceCategoryId: string;
  intakeFormId?: string | null;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  codePrefix: string;
  iconName?: string;
  displayOrder?: number;
  isBookable?: boolean;
  isActive?: boolean;
  complaints?: string[];
}

export interface CreateIntakeFormPayload {
  code: string;
  name: string;
  description?: string;
  iconName?: string;
  isActive?: boolean;
}
