import { clientFetch } from '@/lib/client-fetch';
import { type FlowName, type IntakeType, KIA_API_ENDPOINTS } from '../constants/kia-constants';

export interface PreviousPregnancyPayload {
  orderNumber: number;
  birthYear?: string;
  birthWeightGrams?: number;
  birthLengthCm?: number;
  childSex?: string;
  gestationalAgeAtBirth?: string;
  birthAttendant?: string;
  deliveryMethod?: string;
  deliveryPlace?: string;
  complications?: string;
}

export interface ContraceptiveHistoryPayload {
  orderNumber: number;
  startDate?: string;
  contraceptiveType?: string;
  durationText?: string;
  stopDate?: string;
  problems?: string;
  sideEffects?: string;
}

export interface HusbandPayload {
  fullName?: string | null;
  nik?: string | null;
  birthDate?: string | null;
  age?: number | null;
  job?: string | null;
  education?: string | null;
  bloodType?: string | null;
  phoneNumber?: string | null;
}

export interface AnamnesisResponsePayload {
  questionCode: string;
  selectedOptionCode?: string | null;
  answerText?: string | null;
}

export interface HealthConditionResponsePayload {
  conditionCode: string;
  hasCondition: boolean;
  diagnosisYear?: number | null;
  notes?: string | null;
}

export interface MaternalQuestionOption {
  id: string;
  optionCode: string;
  label: string;
  displayOrder: number;
}

export interface MaternalQuestion {
  id: string;
  code: string;
  category: string;
  questionText: string;
  helpText?: string | null;
  inputType: string;
  isRequired: boolean;
  displayOrder: number;
  options: MaternalQuestionOption[];
}

export interface MaternalHealthCondition {
  id: string;
  code: string;
  name: string;
  questionPrompt: string;
  displayOrder: number;
}

export interface MaternalReferenceOptionItem {
  code: string;
  label: string;
  description?: string;
  displayOrder: number;
}

export interface MaternalReferenceOptions {
  educationLevels: MaternalReferenceOptionItem[];
  religions: MaternalReferenceOptionItem[];
  bloodTypes: MaternalReferenceOptionItem[];
  tetanusStatuses: MaternalReferenceOptionItem[];
  deliveryMethods?: MaternalReferenceOptionItem[];
  genders?: MaternalReferenceOptionItem[];
}

export interface OccupationItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

export interface CreateMaternityIntakePayload {
  patientId: string;
  appointmentId?: string | null;
  motherNik: string;
  motherName: string;
  motherBirthDate?: string | null;
  motherAge?: number | null;
  marriageOrder?: number;
  marriageDate?: string | null;
  motherJob?: string | null;
  motherEducation?: string | null;
  religion?: string | null;
  phoneNumber?: string | null;
  domicileAddress?: string | null;
  identityCardAddress?: string | null;
  dasawisma?: string | null;
  posyandu?: string | null;
  puskesmas?: string | null;
  partnerName?: string | null;
  partnerNik?: string | null;
  partnerBirthDate?: string | null;
  partnerAge?: number | null;
  partnerJob?: string | null;
  partnerEducation?: string | null;
  partnerBloodType?: string | null;
  heightCm?: number | null;
  prePregnancyWeightKg?: number | null;
  upperArmCircumferenceCm?: number | null;
  initialBmi?: number | null;
  tetanusStatus?: string | null;
  motherBloodType?: string | null;
  hpht?: string | null;
  currentComplaints?: string | null;
  gravidaCount?: number;
  parityCount?: number;
  abortionCount?: number;
  livingChildrenCount?: number;
  hasPreviousPregnancyHistory?: boolean;
  hasContraceptionHistory?: boolean;
  smokedBeforePregnancy?: string | null;
  alcoholBeforePregnancy?: boolean;
  irregularDietBeforePregnancy?: boolean;
  reducedPhysicalActivityBeforePregnancy?: boolean;
  unprescribedMedicationBeforePregnancy?: boolean;
  concerningCosmeticUseBeforePregnancy?: boolean;
  pesticideExposureBeforePregnancy?: boolean;
  chemicalExposureBeforePregnancy?: boolean;
  smokeExposureBeforePregnancy?: boolean;
  concerningEnvironmentNotes?: string | null;
  allergyInfo?: string | null;
  otherNotes?: string | null;
  diseaseHistory?: Record<string, unknown>;
  husband?: HusbandPayload | null;
  anamnesisResponses?: AnamnesisResponsePayload[];
  healthConditions?: HealthConditionResponsePayload[];
  previousPregnancies?: PreviousPregnancyPayload[];
  contraceptiveHistories?: ContraceptiveHistoryPayload[];
}

export interface CreateChildImmunizationPayload {
  patientId: string;
  appointmentId?: string | null;
  childName: string;
  childNik: string;
  childBirthDate: string;
  childSex: string;
  childAgeFormatted?: string | null;
  parentPhone: string;
  fatherName?: string | null;
  motherName?: string | null;
  childAddress?: string | null;
  previousVaccineHistory?: string | null;
  childAllergyHistory?: string | null;
}

export interface MaternalIntakeResponse extends CreateMaternityIntakePayload {
  id: string;
  intakeSubmissionId: string;
  createdAt: string;
  updatedAt: string;
  estimatedDueDate?: string | null;
  gestationalAgeWeeks?: number | null;
  gestationalAgeFormatted?: string | null;
  answers?: Record<string, unknown>;
  automatic?: Record<string, unknown>;
}

export interface ChildImmunizationResponse extends CreateChildImmunizationPayload {
  id: string;
  intakeSubmissionId: string;
  createdAt: string;
  updatedAt: string;
  answers?: Record<string, unknown>;
}

export interface UnifiedIntakeResponse {
  flow: FlowName;
  type: IntakeType;
  data: MaternalIntakeResponse | ChildImmunizationResponse;
}

class KiaIntakeService {
  async createMaternityIntake(
    payload: CreateMaternityIntakePayload
  ): Promise<MaternalIntakeResponse> {
    return clientFetch<MaternalIntakeResponse>(KIA_API_ENDPOINTS.MATERNITY_INTAKE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createImmunizationIntake(
    payload: CreateChildImmunizationPayload
  ): Promise<ChildImmunizationResponse> {
    return clientFetch<ChildImmunizationResponse>(KIA_API_ENDPOINTS.IMMUNIZATION_INTAKE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getIntakeByAppointmentId(appointmentId: string): Promise<UnifiedIntakeResponse> {
    return clientFetch<UnifiedIntakeResponse>(
      `${KIA_API_ENDPOINTS.INTAKE_BY_APPOINTMENT}/${appointmentId}`,
      {
        method: 'GET'
      }
    );
  }

  async getMaternalIntakeById(id: string): Promise<MaternalIntakeResponse> {
    return clientFetch<MaternalIntakeResponse>(`${KIA_API_ENDPOINTS.MATERNITY_INTAKE}/${id}`, {
      method: 'GET'
    });
  }

  async getImmunizationIntakeById(id: string): Promise<ChildImmunizationResponse> {
    return clientFetch<ChildImmunizationResponse>(
      `${KIA_API_ENDPOINTS.IMMUNIZATION_INTAKE}/${id}`,
      {
        method: 'GET'
      }
    );
  }

  async getMaternalQuestions(): Promise<MaternalQuestion[]> {
    const res = await clientFetch<{ success: boolean; data: MaternalQuestion[] }>(
      KIA_API_ENDPOINTS.MATERNAL_QUESTIONS
    );
    return res?.data ?? [];
  }

  async getMaternalConditions(): Promise<MaternalHealthCondition[]> {
    const res = await clientFetch<{ success: boolean; data: MaternalHealthCondition[] }>(
      KIA_API_ENDPOINTS.MATERNAL_CONDITIONS
    );
    return res?.data ?? [];
  }

  async getMaternalReferenceOptions(): Promise<MaternalReferenceOptions> {
    const res = await clientFetch<{ success: boolean; data: MaternalReferenceOptions }>(
      KIA_API_ENDPOINTS.MATERNAL_REFERENCE_OPTIONS
    );
    return res?.data;
  }

  async getOccupations(): Promise<OccupationItem[]> {
    const res = await clientFetch<{ success: boolean; data: OccupationItem[] }>(
      KIA_API_ENDPOINTS.OCCUPATIONS
    );
    return res?.data ?? [];
  }
}

export const kiaIntakeService = new KiaIntakeService();
