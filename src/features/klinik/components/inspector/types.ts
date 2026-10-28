import type { Appointment } from '../../api/types';
import type {
  MaternalIntakeResponse,
  ChildImmunizationResponse
} from '../../api/kia-intake-service';

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
  villageName?: string;
  districtName?: string;
  regencyName?: string;
  provinceName?: string;
  relationshipType?: string;
  relationLabel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface UnifiedInspectorData {
  flow?: string;
  answers: Record<string, any>;
  automatic: Record<string, any>;
  maternal?: MaternalIntakeResponse;
  child?: ChildImmunizationResponse;
  patient?: UnifiedInspectorPatient;
  appointmentId?: string;
  bookingCode?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  complaint?: string;
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

  gravidaCount: number;
  parityCount: number;
  abortionCount: number;
  livingChildrenCount: number;
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
  hasVaccineHistory: string;
  previousVaccineHistory: string;
  hasAllergyHistory: string;
  childAllergyHistory: string;
  vaccineValues: Record<string, string>;
}

export interface EditableRegularData {
  complaint: string;
  allergyHistory: string;
  heightCm: string | number;
  weightKg: string | number;
  bloodPressure: string;
  notes: string;
  answers: Record<string, any>;

  // Patient Identity & Demographic (Full Editability)
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
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface InspectorTabProps {
  appointment: Appointment;
  data: UnifiedInspectorData;
  isEditing?: boolean;

  // Maternal form
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

  // Immunization form
  immunizationFormData?: EditableImmunizationData;
  onImmunizationFieldChange?: (field: keyof EditableImmunizationData, value: any) => void;
  onVaccineValueChange?: (fieldId: string, value: string) => void;

  // Regular form
  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, value: any) => void;
}
