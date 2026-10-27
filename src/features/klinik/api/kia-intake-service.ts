import { clientFetch } from '@/lib/client-fetch';
import {
  type FlowName,
  type IntakeType,
  KIA_API_ENDPOINTS,
  type VaccineCatalogItem
} from '../constants/kia-constants';
import type {
  MaternalHistoryItem,
  ImmunizationHistoryItem,
  PaginatedHistoryResponse
} from './history-queries';

export type { VaccineCatalogItem };

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
  deliveryPlaces?: MaternalReferenceOptionItem[];
  childSexes?: MaternalReferenceOptionItem[];
  birthAttendants?: MaternalReferenceOptionItem[];
  contraceptiveTypes?: MaternalReferenceOptionItem[];
  occupations?: MaternalReferenceOptionItem[];
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

export interface ChildImmunizationEntryPayload {
  vaccineCode: string;
  status: 'GIVEN' | 'NOT_GIVEN' | 'UNKNOWN';
  givenDate?: string | null;
  givenMonth?: string | null;
  ageEstimateMonths?: number | null;
  datePrecision?: 'EXACT' | 'MONTH_YEAR' | 'AGE_ESTIMATE' | 'NONE' | null;
  reviewReasons?: any;
  notes?: string | null;
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
  hasVaccineHistory?: string | null;
  previousVaccineHistory?: string | null;
  hasAllergyHistory?: string | null;
  childAllergyHistory?: string | null;
  entries?: ChildImmunizationEntryPayload[];
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
  entries?: (ChildImmunizationEntryPayload & {
    id: string;
    createdAt: string;
    updatedAt: string;
  })[];
  answers?: Record<string, unknown>;
  automatic?: Record<string, unknown>;
}

export interface FormRequirementData {
  flow: 'immunization' | 'pregnancy' | 'general';
  serviceId: string;
  serviceName: string;
  isExistingPatient: boolean;
  patientId: string | null;
  patientName: string | null;
  reusableIdentity: Record<string, any>;
  prefilledValues: Record<string, any>;
  omittedFieldIds: string[];
}

export interface UnifiedIntakeResponse {
  flow: FlowName;
  type: IntakeType;
  data: MaternalIntakeResponse | ChildImmunizationResponse | any;
}

class KiaIntakeService {
  async getFormRequirement(
    serviceId: string,
    patientId?: string
  ): Promise<FormRequirementData | null> {
    try {
      const q = new URLSearchParams({ serviceId });
      if (patientId) {
        q.set('patientId', patientId);
      }
      const res = await clientFetch<
        { success?: boolean; data?: FormRequirementData } | FormRequirementData
      >(`/api/v1/medical-records/intakes/form-requirement?${q.toString()}`, {
        method: 'GET'
      });
      if (res && typeof res === 'object' && 'data' in res && res.data) {
        return res.data as FormRequirementData;
      }
      return res as FormRequirementData;
    } catch {
      return null;
    }
  }
  async createMaternityIntake(
    payload: CreateMaternityIntakePayload
  ): Promise<MaternalIntakeResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: MaternalIntakeResponse } | MaternalIntakeResponse
    >(KIA_API_ENDPOINTS.MATERNITY_INTAKE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as MaternalIntakeResponse;
    }
    return res as MaternalIntakeResponse;
  }

  async createImmunizationIntake(
    payload: CreateChildImmunizationPayload
  ): Promise<ChildImmunizationResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: ChildImmunizationResponse } | ChildImmunizationResponse
    >(KIA_API_ENDPOINTS.IMMUNIZATION_INTAKE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as ChildImmunizationResponse;
    }
    return res as ChildImmunizationResponse;
  }

  async getIntakeByAppointmentId(appointmentId: string): Promise<UnifiedIntakeResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: UnifiedIntakeResponse } | UnifiedIntakeResponse
    >(`${KIA_API_ENDPOINTS.INTAKE_BY_APPOINTMENT}/${appointmentId}`, {
      method: 'GET'
    });
    if (res && typeof res === 'object') {
      if ('flow' in res && 'data' in res) {
        return res as UnifiedIntakeResponse;
      }
      if ('data' in res && res.data && typeof res.data === 'object' && 'flow' in res.data) {
        return res.data as UnifiedIntakeResponse;
      }
    }
    return res as UnifiedIntakeResponse;
  }

  async getLatestIntakeByPatientId(
    patientId: string,
    flow?: string
  ): Promise<UnifiedIntakeResponse | null> {
    try {
      const query = flow ? `?flow=${encodeURIComponent(flow)}` : '';
      const res = await clientFetch<
        { success?: boolean; data?: UnifiedIntakeResponse } | UnifiedIntakeResponse
      >(`/medical-records/intakes/patient/${patientId}/latest${query}`, {
        method: 'GET'
      });
      if (res && typeof res === 'object') {
        if ('flow' in res && 'data' in res) {
          return res as UnifiedIntakeResponse;
        }
        if ('data' in res && res.data && typeof res.data === 'object' && 'flow' in res.data) {
          return res.data as UnifiedIntakeResponse;
        }
      }
      return res as UnifiedIntakeResponse;
    } catch {
      return null;
    }
  }

  async getMaternalIntakeById(id: string): Promise<MaternalIntakeResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: MaternalIntakeResponse } | MaternalIntakeResponse
    >(`${KIA_API_ENDPOINTS.MATERNITY_INTAKE}/${id}`, {
      method: 'GET'
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as MaternalIntakeResponse;
    }
    return res as MaternalIntakeResponse;
  }

  async updateMaternityIntake(
    id: string,
    payload: Partial<CreateMaternityIntakePayload>
  ): Promise<MaternalIntakeResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: MaternalIntakeResponse } | MaternalIntakeResponse
    >(`${KIA_API_ENDPOINTS.MATERNITY_INTAKE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as MaternalIntakeResponse;
    }
    return res as MaternalIntakeResponse;
  }

  async getImmunizationIntakeById(id: string): Promise<ChildImmunizationResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: ChildImmunizationResponse } | ChildImmunizationResponse
    >(`${KIA_API_ENDPOINTS.IMMUNIZATION_INTAKE}/${id}`, {
      method: 'GET'
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as ChildImmunizationResponse;
    }
    return res as ChildImmunizationResponse;
  }

  async updateImmunizationIntake(
    id: string,
    payload: Partial<CreateChildImmunizationPayload>
  ): Promise<ChildImmunizationResponse> {
    const res = await clientFetch<
      { success?: boolean; data?: ChildImmunizationResponse } | ChildImmunizationResponse
    >(`${KIA_API_ENDPOINTS.IMMUNIZATION_INTAKE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as ChildImmunizationResponse;
    }
    return res as ChildImmunizationResponse;
  }

  async updateGenericIntake(id: string, answers: Record<string, any>): Promise<any> {
    const res = await clientFetch<{ success?: boolean; data?: any } | any>(
      `/api/v1/medical-records/intakes/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ answers })
      }
    );
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data;
    }
    return res;
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

  async getVaccineCatalog(): Promise<VaccineCatalogItem[]> {
    const res = await clientFetch<{ success: boolean; data: VaccineCatalogItem[] }>(
      KIA_API_ENDPOINTS.VACCINE_CATALOG
    );
    return res?.data ?? [];
  }

  async getMaternalHistory(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedHistoryResponse<MaternalHistoryItem>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.patientId) q.set('patientId', params.patientId);
    if (params?.search) q.set('search', params.search);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);

    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await clientFetch<
      | { success?: boolean; data?: PaginatedHistoryResponse<MaternalHistoryItem> }
      | PaginatedHistoryResponse<MaternalHistoryItem>
    >(`${KIA_API_ENDPOINTS.MATERNITY_HISTORY}${qs}`);

    if (res && typeof res === 'object' && 'data' in res && res.data && 'total' in res) {
      return res as PaginatedHistoryResponse<MaternalHistoryItem>;
    }
    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      res.data &&
      'totalPages' in (res.data as any)
    ) {
      return res.data as PaginatedHistoryResponse<MaternalHistoryItem>;
    }
    return res as PaginatedHistoryResponse<MaternalHistoryItem>;
  }

  async getImmunizationHistory(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedHistoryResponse<ImmunizationHistoryItem>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.patientId) q.set('patientId', params.patientId);
    if (params?.search) q.set('search', params.search);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);

    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await clientFetch<
      | { success?: boolean; data?: PaginatedHistoryResponse<ImmunizationHistoryItem> }
      | PaginatedHistoryResponse<ImmunizationHistoryItem>
    >(`${KIA_API_ENDPOINTS.IMMUNIZATION_HISTORY}${qs}`);

    if (res && typeof res === 'object' && 'data' in res && res.data && 'total' in res) {
      return res as PaginatedHistoryResponse<ImmunizationHistoryItem>;
    }
    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      res.data &&
      'totalPages' in (res.data as any)
    ) {
      return res.data as PaginatedHistoryResponse<ImmunizationHistoryItem>;
    }
    return res as PaginatedHistoryResponse<ImmunizationHistoryItem>;
  }
}

export type {
  MaternalHistoryItem,
  ImmunizationHistoryItem,
  PaginatedHistoryResponse
} from './history-queries';

export const kiaIntakeService = new KiaIntakeService();
