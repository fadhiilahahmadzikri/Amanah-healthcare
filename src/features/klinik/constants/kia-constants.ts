export const FLOW_NAMES = {
  PREGNANCY: 'pregnancy',
  IMMUNIZATION: 'immunization',
  REGULAR: 'regular'
} as const;

export type FlowName = (typeof FLOW_NAMES)[keyof typeof FLOW_NAMES];

export const PREVIOUS_PREGNANCY_CHOICE = {
  YES: 'Ya, ada',
  NO: 'Belum/tidak ada'
} as const;

export const CONTRACEPTION_CHOICE = {
  YES: 'Ya, pernah',
  NO: 'Belum pernah'
} as const;

export const VACCINE_GATEWAY_CHOICE = {
  YES: 'Ya, pernah',
  NO: 'Belum pernah sama sekali'
} as const;

export const ALLERGY_GATEWAY_CHOICE = {
  YES: 'Ada riwayat alergi',
  NO: 'Tidak ada alergi'
} as const;

export interface VaccineItem {
  id: string;
  name: string;
  ageGroup: string;
  description: string;
}

export interface VaccineCatalogItem {
  id: string;
  code: string;
  name: string;
  ageMilestone: string;
  scheduleMonths?: number | null;
  altGroup?: string | null;
  description?: string | null;
  sortOrder: number;
}

export const REPEATABLE_GROUP_KEYS = {
  PREGNANCY: 'pregnancy',
  CONTRACEPTION: 'contraception'
} as const;

export const CATALOG_ACTION_TYPES = {
  ADD: 'add',
  EDIT: 'edit'
} as const;

export const STEP_DESCRIPTOR_TYPES = {
  MEDICAL: 'medical',
  HISTORY_CATALOG: 'history-catalog',
  DOCTOR: 'doctor',
  DATE: 'date',
  TIME: 'time',
  REVIEW: 'review'
} as const;

export const GENDER_CHOICE = {
  MALE: 'Laki-laki'
} as const;

export const INTAKE_TYPES = {
  MATERNAL: 'maternal',
  IMMUNIZATION: 'immunization'
} as const;

export type IntakeType = (typeof INTAKE_TYPES)[keyof typeof INTAKE_TYPES];

export const KIA_API_ENDPOINTS = {
  MATERNITY_INTAKE: '/api/v1/medical-records/intakes/maternity',
  MATERNITY_HISTORY: '/api/v1/medical-records/intakes/maternity/history',
  IMMUNIZATION_INTAKE: '/api/v1/medical-records/intakes/immunization',
  IMMUNIZATION_HISTORY: '/api/v1/medical-records/intakes/immunization/history',
  FORM_REQUIREMENT: '/api/v1/medical-records/intakes/form-requirement',
  INTAKE_BY_APPOINTMENT: '/api/v1/medical-records/intakes/by-appointment',
  MATERNAL_QUESTIONS: '/api/v1/medical-records/maternal/catalogs/questions',
  MATERNAL_CONDITIONS: '/api/v1/medical-records/maternal/catalogs/conditions',
  MATERNAL_REFERENCE_OPTIONS: '/api/v1/medical-records/maternal/catalogs/reference-options',
  VACCINE_CATALOG: '/api/v1/medical-records/immunization/catalogs/vaccines',
  OCCUPATIONS: '/api/v1/occupations'
} as const;

export const MATERNAL_QUESTION_CODES = {
  SMOKING_HABIT: 'SMOKING_HABIT',
  ALCOHOL_CONSUMPTION: 'ALCOHOL_CONSUMPTION',
  IRREGULAR_DIET: 'IRREGULAR_DIET',
  REDUCED_PHYSICAL_ACTIVITY: 'REDUCED_PHYSICAL_ACTIVITY',
  UNPRESCRIBED_MEDICATION: 'UNPRESCRIBED_MEDICATION',
  CONCERNING_COSMETIC_USE: 'CONCERNING_COSMETIC_USE',
  PESTICIDE_EXPOSURE: 'PESTICIDE_EXPOSURE',
  CHEMICAL_EXPOSURE: 'CHEMICAL_EXPOSURE',
  SMOKE_EXPOSURE: 'SMOKE_EXPOSURE',
  CONCERNING_ENVIRONMENT_NOTES: 'CONCERNING_ENVIRONMENT_NOTES',
  ALLERGY_INFO: 'ALLERGY_INFO',
  OTHER_NOTES: 'OTHER_NOTES'
} as const;

export const MATERNAL_CONDITION_CODES = {
  HYPERTENSION: 'HYPERTENSION',
  HEART_DISEASE: 'HEART_DISEASE',
  THYROID_DISEASE: 'THYROID_DISEASE',
  AUTOIMMUNE: 'AUTOIMMUNE',
  DIABETES: 'DIABETES',
  ASTHMA: 'ASTHMA',
  TUBERCULOSIS: 'TUBERCULOSIS',
  HEPATITIS_B: 'HEPATITIS_B',
  HIV_SYPHILIS: 'HIV_SYPHILIS',
  MENTAL_HEALTH: 'MENTAL_HEALTH',
  TWIN_PREGNANCY: 'TWIN_PREGNANCY',
  CYST_MYOMA_TUMOR: 'CYST_MYOMA_TUMOR',
  SURGERY: 'SURGERY',
  OTHER: 'OTHER'
} as const;
