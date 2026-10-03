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

export const CORE_VACCINE_LIST: VaccineItem[] = [
  { id: 'HB_0', name: 'HB 0', ageGroup: 'Saat Lahir', description: 'Hepatitis B (< 24 jam)' },
  { id: 'BCG', name: 'BCG', ageGroup: '1 Bulan', description: 'Tuberkulosis (TBC)' },
  {
    id: 'PENTA_1',
    name: 'PENTA 1 / Heksavalen 1',
    ageGroup: '2 Bulan',
    description: 'DPT-HB-Hib 1 atau Kombo 6-in-1'
  },
  { id: 'IPV_1', name: 'IPV 1', ageGroup: '2 Bulan', description: 'Polio suntik 1' },
  { id: 'PCV_1', name: 'PCV 1', ageGroup: '2 Bulan', description: 'Pneumokokus 1' },
  { id: 'RV_1', name: 'RV 1', ageGroup: '2 Bulan', description: 'Rotavirus tetes 1' },
  {
    id: 'PENTA_2',
    name: 'PENTA 2 / Heksavalen 2',
    ageGroup: '3 Bulan',
    description: 'DPT-HB-Hib 2 atau Kombo 6-in-1'
  },
  { id: 'IPV_2', name: 'IPV 2', ageGroup: '3 Bulan', description: 'Polio suntik 2' },
  { id: 'PCV_2', name: 'PCV 2', ageGroup: '3 Bulan', description: 'Pneumokokus 2' },
  { id: 'RV_2', name: 'RV 2', ageGroup: '3 Bulan', description: 'Rotavirus tetes 2' },
  {
    id: 'PENTA_3',
    name: 'PENTA 3 / Heksavalen 3',
    ageGroup: '4 Bulan',
    description: 'DPT-HB-Hib 3 atau Kombo 6-in-1'
  },
  { id: 'IPV_3', name: 'IPV 3', ageGroup: '4 Bulan', description: 'Polio suntik 3' },
  { id: 'RV_3', name: 'RV 3', ageGroup: '4 Bulan', description: 'Rotavirus tetes 3' },
  { id: 'MR', name: 'MR', ageGroup: '9 Bulan', description: 'Campak Rubela' },
  { id: 'JE', name: 'JE', ageGroup: '10 Bulan', description: 'Japanese Encephalitis' },
  { id: 'PCV_B', name: 'PCV-B', ageGroup: '12 Bulan', description: 'Booster Pneumokokus' },
  { id: 'PENTA_B', name: 'PENTA-B', ageGroup: '18 Bulan', description: 'Booster DPT-HB-Hib' },
  { id: 'MR_B', name: 'MR-B', ageGroup: '18 Bulan', description: 'Booster Campak Rubela' }
];

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
  OTHER_VACCINES_NOTE: 'otherVaccinesNote',
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
  INTAKE_BY_APPOINTMENT: '/api/v1/medical-records/intakes/by-appointment',
  MATERNAL_QUESTIONS: '/api/v1/medical-records/maternal/catalogs/questions',
  MATERNAL_CONDITIONS: '/api/v1/medical-records/maternal/catalogs/conditions',
  MATERNAL_REFERENCE_OPTIONS: '/api/v1/medical-records/maternal/catalogs/reference-options',
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
