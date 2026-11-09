import type { Appointment } from '../../api/types';
import type {
  MaternalIntakeResponse,
  ChildImmunizationResponse
} from '../../api/kia-intake-service';
import type { MaternalConditionResponse } from '@/features/maternity/types/maternity.types';

export interface UnifiedInspectorPatient {
  id?: string;
  medicalRecordNumber?: string;
  nik?: string;
  fullName?: string;
  motherName?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  line1?: string;
  villageName?: string;
  villageCode?: string;
  districtName?: string;
  districtCode?: string;
  regencyName?: string;
  regencyCode?: string;
  provinceName?: string;
  provinceCode?: string;
  relationshipTypeId?: string;
  relationshipType?: string;
  relationLabel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface UnifiedInspectorData {
  flow?: string | null;
  maternal?: MaternalIntakeResponse;
  child?: ChildImmunizationResponse;
  patient?: UnifiedInspectorPatient;
  appointmentId?: string;
  bookingCode?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  complaint?: string;
  poliklinikId?: string;
  poliklinikName?: string;
  categoryId?: string;
  categoryName?: string;
  serviceId?: string;
  serviceName?: string;
}

export interface PreviousPregnancyEntry {
  orderNumber: number;
  birthYear?: string;
  birthWeightGrams?: number | string;
  birthLengthCm?: number | string;
  childSex?: string;
  gestationalAgeAtBirth?: string;
  birthAttendant?: string;
  deliveryMethod?: string;
  deliveryPlace?: string;
  complications?: string;
}

export interface ContraceptiveHistoryEntry {
  orderNumber: number;
  contraceptiveType?: string;
  startDate?: string;
  stopDate?: string;
  durationText?: string;
  problems?: string;
  sideEffects?: string;
}

export interface DiseaseHistoryMap {
  hasHypertensionHistory: boolean;
  hypertensionHistoryNotes?: string;
  hasHeartDiseaseHistory: boolean;
  heartDiseaseHistoryNotes?: string;
  hasThyroidDiseaseHistory: boolean;
  thyroidDiseaseHistoryNotes?: string;
  hasAutoimmuneHistory: boolean;
  autoimmuneHistoryNotes?: string;
  hasDiabetesHistory: boolean;
  diabetesHistoryNotes?: string;
  hasAsthmaHistory: boolean;
  asthmaHistoryNotes?: string;
  hasTuberculosisHistory: boolean;
  tuberculosisHistoryNotes?: string;
  hasHepatitisBHistory: boolean;
  hepatitisBHistoryNotes?: string;
  hasHivOrSyphilisHistory: boolean;
  hivOrSyphilisHistoryNotes?: string;
  hasMentalHealthHistory: boolean;
  mentalHealthHistoryNotes?: string;
  hasTwinPregnancyHistory: boolean;
  twinPregnancyHistoryNotes?: string;
  hasCystMyomaTumorHistory: boolean;
  cystMyomaTumorHistoryNotes?: string;
  hasSurgeryHistory: boolean;
  surgeryHistoryNotes?: string;
  hasOtherDiseaseHistory: boolean;
  otherDiseaseHistoryNotes?: string;
  otherDiseaseHistoryYear?: string;
  [key: string]: any;
}

export interface EditableMaternalData {
  medicalRecordNumber?: string;
  birthPlace?: string;
  motherName: string;
  motherNik: string;
  motherBirthDate: string;
  motherAge: number | string;
  marriageOrder: number | string;
  marriageDate: string;
  motherJob: string;
  motherEducation: string;
  religion: string;
  phoneNumber: string;
  domicileAddress: string;
  identityCardAddress: string;
  line1?: string;
  villageName?: string;
  villageCode?: string;
  districtName?: string;
  districtCode?: string;
  regencyName?: string;
  regencyCode?: string;
  provinceName?: string;
  provinceCode?: string;
  dasawisma: string;
  posyandu: string;
  puskesmas: string;

  partnerName: string;
  partnerNik: string;
  partnerBirthDate: string;
  partnerAge: number | string;
  partnerJob: string;
  partnerEducation: string;
  partnerBloodType: string;
  partnerPhone: string;

  heightCm: number | string;
  prePregnancyWeightKg: number | string;
  upperArmCircumferenceCm: number | string;
  initialBmi: number | string;
  tetanusStatus: string;
  motherBloodType: string;

  hpht: string;
  estimatedDueDate: string;
  gestationalAgeWeeks: number | string;
  gestationalAgeFormatted: string;
  currentComplaints: string;

  gravidaCount: number | string;
  parityCount: number | string;
  abortionCount: number | string;
  livingChildrenCount: number | string;
  hasPreviousPregnancyHistory: boolean;
  hasContraceptionHistory: boolean;

  smokedBeforePregnancy: string;
  alcoholBeforePregnancy: boolean;
  irregularDietBeforePregnancy: boolean;
  reducedPhysicalActivityBeforePregnancy: boolean;
  unprescribedMedicationBeforePregnancy: boolean;
  concerningCosmeticUseBeforePregnancy: boolean;
  pesticideExposureBeforePregnancy: boolean;
  chemicalExposureBeforePregnancy: boolean;
  smokeExposureBeforePregnancy: boolean;

  concerningEnvironmentNotes: string;
  allergyInfo: string;
  otherNotes: string;

  diseaseHistory: DiseaseHistoryMap;
  previousPregnancies: PreviousPregnancyEntry[];
  contraceptiveHistories: ContraceptiveHistoryEntry[];
  conditionResponses?: MaternalConditionResponse[];
}

export interface EditableImmunizationData {
  medicalRecordNumber?: string;
  birthPlace?: string;
  childName: string;
  childNik: string;
  childBirthDate: string;
  childSex: string;
  childAgeFormatted: string;
  parentPhone: string;
  fatherName: string;
  motherName: string;
  childAddress: string;
  line1?: string;
  provinceCode?: string;
  provinceName?: string;
  regencyCode?: string;
  regencyName?: string;
  districtCode?: string;
  districtName?: string;
  villageCode?: string;
  villageName?: string;
  hasVaccineHistory: string;
  previousVaccineHistory: string;
  hasAllergyHistory: string;
  childAllergyHistory: string;
  vaccineValues: Record<string, string>;
  entries?: any[];
}

export interface EditableRegularData {
  complaint: string;
  unitId?: string;
  unitName?: string;
  categoryId?: string;
  categoryName?: string;
  serviceId?: string;
  serviceName?: string;
  allergyHistory?: string;
  heightCm?: string | number;
  weightKg?: string | number;
  bloodPressure?: string;
  notes?: string;

  medicalRecordNumber?: string;
  nik?: string;
  fullName?: string;
  motherName?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  line1?: string;
  provinceName?: string;
  provinceCode?: string;
  regencyName?: string;
  regencyCode?: string;
  districtName?: string;
  districtCode?: string;
  villageName?: string;
  villageCode?: string;
  relationshipTypeId?: string;
  relationshipType?: string;
  relationLabel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface InspectorTabProps {
  appointment: Appointment;
  data: UnifiedInspectorData;
  isEditing?: boolean;

  formData?: EditableMaternalData;
  onFieldChange?: (field: keyof EditableMaternalData, value: any) => void;
  onDiseaseChange?: (key: string, value: any, yearOrNotes?: string) => void;
  onNestedArrayChange?: (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    index: number,
    field: string,
    value: any
  ) => void;
  onAddNestedItem?: (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    defaultItem: any
  ) => void;
  onRemoveNestedItem?: (
    key: 'previousPregnancies' | 'contraceptiveHistories',
    index: number
  ) => void;

  immunizationFormData?: EditableImmunizationData;
  onImmunizationFieldChange?: (field: keyof EditableImmunizationData, value: any) => void;
  onVaccineValueChange?: (fieldId: string, value: string) => void;

  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, value: any) => void;

  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}
