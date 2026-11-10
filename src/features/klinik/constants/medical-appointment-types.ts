import type { MedicalAppointmentFlow } from '../api/types';
import type { CanonicalVisitType } from '@/constants/visit-type.constants';

export type MedicalFieldType =
  | 'TEXT'
  | 'PARAGRAPH'
  | 'DATE'
  | 'MULTIPLE_CHOICE'
  | 'LIST'
  | 'CHECKBOX'
  | 'ACCORDION'
  | 'TABLE';

export const FIELD_TYPES = {
  TEXT: 'TEXT',
  PARAGRAPH: 'PARAGRAPH',
  DATE: 'DATE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  LIST: 'LIST',
  CHECKBOX: 'CHECKBOX',
  ACCORDION: 'ACCORDION',
  TABLE: 'TABLE'
} as const;

export type TableColumnType = 'label' | 'option' | 'checkbox' | 'text' | 'year' | 'date' | 'select';

export interface TableColumnCondition {
  dependsOnColumnId: string;
  triggerValue: string;
  action: 'show' | 'enable' | 'require';
}

export interface TableColumnDefinition {
  id: string;
  label: string;
  header?: string;
  type: TableColumnType;
  width?: string;
  align?: 'left' | 'center' | 'right';
  conditional?: TableColumnCondition;
  dataSourceKey?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface TableConfig {
  mainHeader?: string;
  subtitle?: string;
  enableAccordionGroup?: boolean;
  columns: TableColumnDefinition[];
}

export const STEP_DESCRIPTOR_TYPES = {
  MEDICAL: 'medical',
  HISTORY_CATALOG: 'history-catalog',
  DOCTOR: 'doctor',
  DATE: 'date',
  TIME: 'time',
  REVIEW: 'review'
} as const;

export const CATALOG_ACTION_TYPES = {
  ADD: 'add',
  EDIT: 'edit'
} as const;

export const REPEATABLE_GROUP_KEYS = {
  PREGNANCY: 'pregnancy',
  CONTRACEPTION: 'contraception'
} as const;

export interface FormFieldDataSource {
  type: 'catalog' | 'static';
  key?: string;
  endpoint?: string;
  valueField?: string;
  labelField?: string;
}

export type MedicalChoiceOption = string | { label: string; value: string };

export interface MedicalFormField {
  id: string;
  type: MedicalFieldType;
  title: string;
  label: string;
  helpText: string;
  placeholder?: string;
  required: boolean;
  choices: MedicalChoiceOption[];
  dataSource?: FormFieldDataSource;
  goToSectionIdByChoice: Record<string, string> | null;
  colSpan?: 1 | 2 | 'full';
  yearFieldId?: string;
  notesFieldId?: string;
  disabled?: boolean;
  isActive?: boolean;
  visibleIf?: (values: Record<string, string>) => boolean;
  format?: 'nik' | 'phone' | 'count' | 'year' | 'text';
  allowCustomInput?: boolean;
}

export interface MedicalFormSection {
  id: string;
  title: string;
  description: string;
  fields: MedicalFormField[];
  layout?: 'grid' | 'stack' | 'questionnaire' | 'table' | 'region';
  repeatableGroup?: string;
  tableConfig?: TableConfig;
}

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

export const GENDER_CHOICE = {
  MALE: 'Laki-laki'
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

export const INTAKE_TYPES = {
  MATERNAL: 'maternal',
  IMMUNIZATION: 'immunization',
  REGULAR: 'regular'
} as const;

export type IntakeType = (typeof INTAKE_TYPES)[keyof typeof INTAKE_TYPES];

export const KIA_API_ENDPOINTS = {
  MATERNITY_INTAKE: '/api/v1/maternity/intakes',
  MATERNITY_HISTORY: '/api/v1/maternity/history',
  IMMUNIZATION_INTAKE: '/api/v1/immunization/intakes',
  IMMUNIZATION_HISTORY: '/api/v1/immunization/history',
  FORM_REQUIREMENT: '/api/v1/medical-records/intakes/form-requirement',
  INTAKE_BY_APPOINTMENT: '/api/v1/medical-records/intakes/by-appointment',
  MATERNAL_QUESTIONS: '/api/v1/medical-records/maternal/catalogs/questions',
  MATERNAL_CONDITIONS: '/api/v1/medical-records/maternal/catalogs/conditions',
  MATERNAL_REFERENCE_OPTIONS: '/api/v1/medical-records/maternal/catalogs/reference-options',
  VACCINE_CATALOG: '/api/v1/medical-records/immunization/catalogs/vaccines',
  OCCUPATIONS: '/api/v1/occupations'
} as const;

export const SECTION_IDS = {
  MOTHER_IDENTITY: 'motherIdentity',
  DOMICILE_HEALTH_COVERAGE: 'domicileHealthCoverage',
  PARTNER_IDENTITY: 'partnerIdentity',
  BASELINE_MEASUREMENTS: 'baselineMeasurements',
  CURRENT_PREGNANCY: 'currentPregnancy',
  RISK_FACTORS_SMOKING: 'riskFactorsSmoking',
  RISK_FACTORS_BEHAVIOR: 'riskFactorsBehavior',
  RISK_FACTORS_NOTES: 'riskFactorsNotes',
  DISEASE_HISTORY: 'diseaseHistory',
  OBSTETRIC_SUMMARY: 'obstetricSummary',
  OBSTETRIC_GATEWAY: 'obstetricGateway',
  PREVIOUS_PREGNANCY_1: 'previousPregnancy1Details',
  PREVIOUS_PREGNANCY_2: 'previousPregnancy2Details',
  PREVIOUS_PREGNANCY_3: 'previousPregnancy3Details',
  PREVIOUS_PREGNANCY_4: 'previousPregnancy4Details',
  CONTRACEPTION_GATEWAY: 'contraceptionGateway',
  CONTRACEPTION_1: 'contraception1Details',
  CONTRACEPTION_2: 'contraception2Details',
  CONTRACEPTION_3: 'contraception3Details',
  CONTRACEPTION_4: 'contraception4Details',
  LIFESTYLE: 'lifestyle',
  CHILD_IDENTITY: 'childIdentity',
  PARENT_IDENTITY: 'parentIdentity',
  VACCINE_GATEWAY: 'vaccineGateway',
  VACCINE_HISTORY: 'vaccineHistory',
  ALLERGY_HISTORY: 'allergyHistory',
  IMMUNIZATION_PATIENT_IDENTITY: 'immunizationPatientIdentity',
  IMMUNIZATION_PARENT_IDENTITY: 'immunizationParentIdentity',
  IMMUNIZATION_MEDICAL_HISTORY: 'immunizationMedicalHistory'
} as const;

export const FIELD_IDS = {
  HAS_PREVIOUS_PREGNANCY_HISTORY: 'hasPreviousPregnancyHistory',
  HAS_CONTRACEPTION_HISTORY: 'hasContraceptionHistory',
  HAS_VACCINE_HISTORY: 'hasVaccineHistory',
  HAS_ALLERGY_HISTORY: 'hasAllergyHistory',
  PRE_PREGNANCY_WEIGHT: 'prePregnancyWeightKg',
  HEIGHT_CM: 'heightCm',
  INITIAL_BMI: 'initialBmi',
  MOTHER_BIRTH_DATE: 'motherBirthDate',
  MOTHER_AGE: 'motherAge',
  PARTNER_BIRTH_DATE: 'partnerBirthDate',
  PARTNER_AGE: 'partnerAge',
  HPHT: 'hpht',
  ESTIMATED_DUE_DATE: 'estimatedDueDate',
  GESTATIONAL_AGE: 'gestationalAge',
  GESTATIONAL_AGE_WEEKS: 'gestationalAgeWeeks'
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

export interface MedicalFlowDefinition {
  flow: MedicalAppointmentFlow;
  formTitle: string;
  formDescription: string;
  serviceName: string;
  visitType: CanonicalVisitType;
  patientNameFieldId: string;
  patientContactFieldId: string;
  complaintFieldId: string;
  sections: MedicalFormSection[];
}

export interface FormJsonField {
  id: string;
  type?: MedicalFieldType;
  component?: string;
  title: string;
  label?: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  isActive?: boolean;
  choices?: string[];
  dataSource?: FormFieldDataSource;
  colSpan?: 1 | 2 | 'full';
  disabled?: boolean;
  yearFieldId?: string;
  notesFieldId?: string;
  goToSectionIdByChoice?: Record<string, string> | null;
}

export interface FormJsonStep {
  id: string;
  title: string;
  description?: string;
  layout?: 'grid' | 'stack' | 'questionnaire' | 'table' | 'region';
  repeatableGroup?: string;
  tableConfig?: TableConfig;
  fields: FormJsonField[];
}

export interface FormJsonSchema {
  version: number;
  title?: string;
  description?: string;
  steps: FormJsonStep[];
}

