export interface MaternalHusbandProfile {
  id?: string;
  maternalIntakeId?: string;
  fullName: string;
  nik?: string | null;
  birthDate?: string | null;
  age?: number | null;
  job?: string | null;
  education?: string | null;
  bloodType?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaternalPreviousPregnancy {
  id?: string;
  maternalIntakeId?: string;
  orderNumber: number;
  birthYear?: string | null;
  birthWeightGrams?: number | null;
  birthLengthCm?: number | string | null;
  childSex?: string | null;
  gestationalAgeAtBirth?: string | null;
  birthAttendant?: string | null;
  deliveryMethod?: string | null;
  deliveryPlace?: string | null;
  complications?: string | null;
  createdAt?: string;
}

export interface MaternalContraceptiveHistory {
  id?: string;
  maternalIntakeId?: string;
  orderNumber: number;
  startDate?: string | null;
  contraceptiveType?: string | null;
  durationText?: string | null;
  stopDate?: string | null;
  problems?: string | null;
  sideEffects?: string | null;
  createdAt?: string;
}

export interface MaternalConditionResponse {
  id?: string;
  maternalIntakeId?: string;
  conditionCode: string;
  hasCondition: boolean;
  diagnosisYear?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export interface MaternityIntake {
  id: string;
  intakeSubmissionId?: string | null;
  patientId: string;
  appointmentId?: string | null;
  motherNik: string;
  motherName: string;
  motherBirthDate?: string | null;
  motherAge?: number | null;
  marriageOrder?: number | null;
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

  heightCm?: string | number | null;
  prePregnancyWeightKg?: string | number | null;
  upperArmCircumferenceCm?: string | number | null;
  initialBmi?: string | number | null;
  tetanusStatus?: string | null;
  motherBloodType?: string | null;

  hpht?: string | null;
  estimatedDueDate?: string | null;
  gestationalAgeWeeks?: string | number | null;
  gestationalAgeFormatted?: string | null;
  currentComplaints: string;

  gravidaCount: number;
  parityCount: number;
  abortionCount: number;
  livingChildrenCount: number;

  hasPreviousPregnancyHistory: boolean;
  hasContraceptionHistory: boolean;

  smokedBeforePregnancy?: string | null;
  alcoholBeforePregnancy?: boolean | null;
  irregularDietBeforePregnancy?: boolean | null;
  reducedPhysicalActivityBeforePregnancy?: boolean | null;
  unprescribedMedicationBeforePregnancy?: boolean | null;
  concerningCosmeticUseBeforePregnancy?: boolean | null;
  pesticideExposureBeforePregnancy?: boolean | null;
  chemicalExposureBeforePregnancy?: boolean | null;
  smokeExposureBeforePregnancy?: boolean | null;
  concerningEnvironmentNotes?: string | null;
  allergyInfo?: string | null;
  otherNotes?: string | null;

  createdAt: string;
  updatedAt: string;

  husbandProfile?: MaternalHusbandProfile | null;
  previousPregnancies: MaternalPreviousPregnancy[];
  contraceptiveHistories: MaternalContraceptiveHistory[];
  conditionResponses: MaternalConditionResponse[];
}

export interface CreateMaternityIntakePayload {
  patientId: string;
  appointmentId?: string;
  motherName?: string;
  motherNik?: string;
  motherBirthDate?: string;
  motherAge?: number;
  marriageOrder?: number;
  marriageDate?: string;
  motherJob?: string;
  motherEducation?: string;
  religion?: string;
  phoneNumber?: string;
  domicileAddress?: string;
  identityCardAddress?: string;
  dasawisma?: string;
  posyandu?: string;
  puskesmas?: string;

  partnerName?: string;
  partnerNik?: string;
  partnerBirthDate?: string;
  partnerAge?: number;
  partnerJob?: string;
  partnerEducation?: string;
  partnerBloodType?: string;

  heightCm?: number;
  prePregnancyWeightKg?: number;
  upperArmCircumferenceCm?: number;
  initialBmi?: number;
  tetanusStatus?: string;
  motherBloodType?: string;

  hpht?: string;
  currentComplaints: string;
  gravidaCount: number;
  parityCount: number;
  abortionCount: number;
  livingChildrenCount: number;

  hasPreviousPregnancyHistory?: boolean;
  hasContraceptionHistory?: boolean;

  smokedBeforePregnancy?: string;
  alcoholBeforePregnancy?: boolean;
  irregularDietBeforePregnancy?: boolean;
  reducedPhysicalActivityBeforePregnancy?: boolean;
  unprescribedMedicationBeforePregnancy?: boolean;
  concerningCosmeticUseBeforePregnancy?: boolean;
  pesticideExposureBeforePregnancy?: boolean;
  chemicalExposureBeforePregnancy?: boolean;
  smokeExposureBeforePregnancy?: boolean;
  concerningEnvironmentNotes?: string;
  allergyInfo?: string;
  otherNotes?: string;

  husband?: MaternalHusbandProfile;
  previousPregnancies?: MaternalPreviousPregnancy[];
  contraceptiveHistories?: MaternalContraceptiveHistory[];
  healthConditions?: MaternalConditionResponse[];
}

export type UpdateMaternityIntakePayload = Partial<CreateMaternityIntakePayload>;

export interface MaternityHistoryQuery {
  page?: number;
  limit?: number;
  patientId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaternityHistoryResponse {
  data: MaternityIntake[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
