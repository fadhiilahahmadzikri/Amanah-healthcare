export const FLOW_NAMES = {
  PREGNANCY: 'pregnancy',
  IMMUNIZATION: 'immunization'
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
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan'
} as const;

export const DEFAULT_INTAKE_VALUES = {
  FALLBACK_COMPLAINT: 'Intake medis awal sudah diisi pasien.',
  DEFAULT_MOTHER_NAME: 'Pasien',
  DEFAULT_CHILD_NAME: 'Ananda',
  DEFAULT_PLACEHOLDER_NIK: '3200000000000000',
  DEFAULT_CHILD_BIRTH_DATE: '2025-01-01',
  DEFAULT_CHILD_SEX: 'Laki-laki',
  DEFAULT_PARENT_PHONE: '081234567890'
} as const;

export const SECTION_IDS = {
  MOTHER_IDENTITY: 'motherIdentity',
  PARTNER_IDENTITY: 'partnerIdentity',
  BASELINE_MEASUREMENTS: 'baselineMeasurements',
  OBSTETRIC_SUMMARY: 'obstetricSummary',
  PREVIOUS_PREGNANCY_1: 'previousPregnancy1Details',
  PREVIOUS_PREGNANCY_2: 'previousPregnancy2Details',
  PREVIOUS_PREGNANCY_3: 'previousPregnancy3Details',
  PREVIOUS_PREGNANCY_4: 'previousPregnancy4Details',
  CONTRACEPTION_GATEWAY: 'contraceptionGateway',
  CONTRACEPTION_1: 'contraception1Details',
  CONTRACEPTION_2: 'contraception2Details',
  CONTRACEPTION_3: 'contraception3Details',
  CONTRACEPTION_4: 'contraception4Details',
  DISEASE_HISTORY: 'diseaseHistory',
  LIFESTYLE: 'lifestyle',
  IMMUNIZATION_PATIENT_IDENTITY: 'immunizationPatientIdentity',
  IMMUNIZATION_PARENT_IDENTITY: 'immunizationParentIdentity',
  IMMUNIZATION_MEDICAL_HISTORY: 'immunizationMedicalHistory'
} as const;

export const FIELD_IDS = {
  HAS_PREVIOUS_PREGNANCY_HISTORY: 'hasPreviousPregnancyHistory',
  HAS_CONTRACEPTION_HISTORY: 'hasContraceptionHistory',
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

export const INTAKE_TYPES = {
  MATERNAL: 'maternal',
  IMMUNIZATION: 'immunization'
} as const;

export type IntakeType = (typeof INTAKE_TYPES)[keyof typeof INTAKE_TYPES];

export const KIA_API_ENDPOINTS = {
  MATERNITY_INTAKE: '/api/v1/medical-records/intakes/maternity',
  IMMUNIZATION_INTAKE: '/api/v1/medical-records/intakes/immunization',
  INTAKE_BY_APPOINTMENT: '/api/v1/medical-records/intakes/by-appointment'
} as const;
