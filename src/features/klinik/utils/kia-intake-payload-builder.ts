import type { MedicalAppointmentValues } from './medical-appointment';
import type {
  AnamnesisResponsePayload,
  ChildImmunizationEntryPayload,
  CreateChildImmunizationPayload,
  CreateMaternityIntakePayload,
  HealthConditionResponsePayload,
  HusbandPayload,
  VaccineCatalogItem
} from '../api/kia-intake-service';
import {
  ALLERGY_GATEWAY_CHOICE,
  CONTRACEPTION_CHOICE,
  MATERNAL_CONDITION_CODES,
  MATERNAL_QUESTION_CODES,
  PREVIOUS_PREGNANCY_CHOICE,
  VACCINE_GATEWAY_CHOICE
} from '../constants/kia-constants';
import { parsePureInteger, parsePureNumeric } from './numeric-parser';

export function buildMaternityIntakePayload(
  patientId: string,
  submittedValues: MedicalAppointmentValues,
  patientName?: string,
  complaint?: string
): CreateMaternityIntakePayload {
  const previousPregnancies = [];
  for (let i = 1; i <= 4; i += 1) {
    const prefix = `previousPregnancy${i}`;
    const birthYear = submittedValues[`${prefix}BirthYear`];
    if (birthYear) {
      previousPregnancies.push({
        orderNumber: i,
        birthYear,
        birthWeightGrams: parsePureInteger(submittedValues[`${prefix}BirthWeight`]) ?? undefined,
        birthLengthCm: parsePureNumeric(submittedValues[`${prefix}BirthLength`]) ?? undefined,
        childSex: submittedValues[`${prefix}ChildSex`],
        gestationalAgeAtBirth: submittedValues[`${prefix}GestationalAgeAtBirth`],
        birthAttendant: submittedValues[`${prefix}BirthAttendant`],
        deliveryMethod: submittedValues[`${prefix}DeliveryMethod`],
        deliveryPlace: submittedValues[`${prefix}DeliveryPlace`],
        complications: submittedValues[`${prefix}Complications`]
      });
    }
  }

  const contraceptiveHistories = [];
  for (let i = 1; i <= 4; i += 1) {
    const contraceptiveType =
      submittedValues[`contraception${i}Type`] || submittedValues[`contraceptive${i}Type`];
    if (contraceptiveType) {
      contraceptiveHistories.push({
        orderNumber: i,
        contraceptiveType,
        startDate:
          submittedValues[`contraception${i}StartDate`] ||
          submittedValues[`contraceptive${i}StartDate`],
        durationText:
          submittedValues[`contraception${i}Duration`] ||
          submittedValues[`contraceptive${i}Duration`],
        stopDate:
          submittedValues[`contraception${i}StopDate`] ||
          submittedValues[`contraceptive${i}StopDate`],
        problems:
          submittedValues[`contraception${i}Problems`] ||
          submittedValues[`contraceptive${i}Problems`],
        sideEffects:
          submittedValues[`contraception${i}SideEffects`] ||
          submittedValues[`contraceptive${i}SideEffects`]
      });
    }
  }

  const husband: HusbandPayload = {
    fullName: submittedValues.partnerName || null,
    nik: submittedValues.partnerNik || null,
    birthDate: submittedValues.partnerBirthDate || null,
    age: parsePureInteger(submittedValues.partnerAge),
    job: submittedValues.partnerJob || null,
    education: submittedValues.partnerEducation || null,
    bloodType: submittedValues.partnerBloodType || null,
    phoneNumber: null
  };

  const anamnesisResponses: AnamnesisResponsePayload[] = [
    {
      questionCode: MATERNAL_QUESTION_CODES.SMOKING_HABIT,
      selectedOptionCode: submittedValues.smokedBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.ALCOHOL_CONSUMPTION,
      selectedOptionCode: submittedValues.alcoholBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.IRREGULAR_DIET,
      selectedOptionCode: submittedValues.irregularDietBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.REDUCED_PHYSICAL_ACTIVITY,
      selectedOptionCode:
        submittedValues.reducedPhysicalActivityBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.UNPRESCRIBED_MEDICATION,
      selectedOptionCode:
        submittedValues.unprescribedMedicationBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.CONCERNING_COSMETIC_USE,
      selectedOptionCode:
        submittedValues.concerningCosmeticUseBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.PESTICIDE_EXPOSURE,
      selectedOptionCode: submittedValues.pesticideExposureBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.CHEMICAL_EXPOSURE,
      selectedOptionCode: submittedValues.chemicalExposureBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.SMOKE_EXPOSURE,
      selectedOptionCode: submittedValues.smokeExposureBeforePregnancy?.toLowerCase() || 'tidak'
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.CONCERNING_ENVIRONMENT_NOTES,
      answerText: submittedValues.concerningEnvironmentNotes || null
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.ALLERGY_INFO,
      answerText: submittedValues.allergyInfo || null
    },
    {
      questionCode: MATERNAL_QUESTION_CODES.OTHER_NOTES,
      answerText: submittedValues.otherNotes || null
    }
  ];

  const healthConditions: HealthConditionResponsePayload[] = [
    {
      conditionCode: MATERNAL_CONDITION_CODES.HYPERTENSION,
      hasCondition: submittedValues.hasHypertensionHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.hypertensionHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.HEART_DISEASE,
      hasCondition: submittedValues.hasHeartDiseaseHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.heartDiseaseHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.THYROID_DISEASE,
      hasCondition: submittedValues.hasThyroidDiseaseHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.thyroidDiseaseHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.AUTOIMMUNE,
      hasCondition: submittedValues.hasAutoimmuneHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.autoimmuneHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.DIABETES,
      hasCondition: submittedValues.hasDiabetesHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.diabetesHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.ASTHMA,
      hasCondition: submittedValues.hasAsthmaHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.asthmaHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.TUBERCULOSIS,
      hasCondition: submittedValues.hasTuberculosisHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.tuberculosisHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.HEPATITIS_B,
      hasCondition: submittedValues.hasHepatitisBHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.hepatitisBHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.HIV_SYPHILIS,
      hasCondition: submittedValues.hasHivOrSyphilisHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.hivOrSyphilisHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.MENTAL_HEALTH,
      hasCondition: submittedValues.hasMentalHealthHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.mentalHealthHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.TWIN_PREGNANCY,
      hasCondition: submittedValues.hasTwinPregnancyHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.twinPregnancyHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.CYST_MYOMA_TUMOR,
      hasCondition: submittedValues.hasCystMyomaTumorHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.cystMyomaTumorHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.SURGERY,
      hasCondition: submittedValues.hasSurgeryHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.surgeryHistoryNotes)
    },
    {
      conditionCode: MATERNAL_CONDITION_CODES.OTHER,
      hasCondition: submittedValues.hasOtherDiseaseHistory === 'Ya',
      diagnosisYear: parsePureInteger(submittedValues.otherDiseaseHistoryYear),
      notes: submittedValues.otherDiseaseHistoryNotes || null
    }
  ];

  const diseaseHistory: Record<string, unknown> = {
    hasHypertensionHistory: submittedValues.hasHypertensionHistory || 'Tidak',
    hypertensionHistoryNotes: submittedValues.hypertensionHistoryNotes || null,
    hasHeartDiseaseHistory: submittedValues.hasHeartDiseaseHistory || 'Tidak',
    heartDiseaseHistoryNotes: submittedValues.heartDiseaseHistoryNotes || null,
    hasThyroidDiseaseHistory: submittedValues.hasThyroidDiseaseHistory || 'Tidak',
    thyroidDiseaseHistoryNotes: submittedValues.thyroidDiseaseHistoryNotes || null,
    hasAutoimmuneHistory: submittedValues.hasAutoimmuneHistory || 'Tidak',
    autoimmuneHistoryNotes: submittedValues.autoimmuneHistoryNotes || null,
    hasDiabetesHistory: submittedValues.hasDiabetesHistory || 'Tidak',
    diabetesHistoryNotes: submittedValues.diabetesHistoryNotes || null,
    hasAsthmaHistory: submittedValues.hasAsthmaHistory || 'Tidak',
    asthmaHistoryNotes: submittedValues.asthmaHistoryNotes || null,
    hasTuberculosisHistory: submittedValues.hasTuberculosisHistory || 'Tidak',
    tuberculosisHistoryNotes: submittedValues.tuberculosisHistoryNotes || null,
    hasHepatitisBHistory: submittedValues.hasHepatitisBHistory || 'Tidak',
    hepatitisBHistoryNotes: submittedValues.hepatitisBHistoryNotes || null,
    hasHivOrSyphilisHistory: submittedValues.hasHivOrSyphilisHistory || 'Tidak',
    hivOrSyphilisHistoryNotes: submittedValues.hivOrSyphilisHistoryNotes || null,
    hasMentalHealthHistory: submittedValues.hasMentalHealthHistory || 'Tidak',
    mentalHealthHistoryNotes: submittedValues.mentalHealthHistoryNotes || null,
    hasTwinPregnancyHistory: submittedValues.hasTwinPregnancyHistory || 'Tidak',
    twinPregnancyHistoryNotes: submittedValues.twinPregnancyHistoryNotes || null,
    hasCystMyomaTumorHistory: submittedValues.hasCystMyomaTumorHistory || 'Tidak',
    cystMyomaTumorHistoryNotes: submittedValues.cystMyomaTumorHistoryNotes || null,
    hasSurgeryHistory: submittedValues.hasSurgeryHistory || 'Tidak',
    surgeryHistoryNotes: submittedValues.surgeryHistoryNotes || null,
    hasOtherDiseaseHistory: submittedValues.hasOtherDiseaseHistory || 'Tidak',
    otherDiseaseHistoryNotes: submittedValues.otherDiseaseHistoryNotes || null,
    otherDiseaseHistoryYear: submittedValues.otherDiseaseHistoryYear || null
  };

  return {
    patientId,
    motherNik: submittedValues.motherNik || '',
    motherName: submittedValues.motherName ? submittedValues.motherName : (patientName ?? ''),
    motherBirthDate: submittedValues.motherBirthDate || null,
    motherAge: parsePureInteger(submittedValues.motherAge),
    marriageOrder: parsePureInteger(submittedValues.marriageOrder) || 1,
    marriageDate: submittedValues.marriageDate || null,
    motherJob: submittedValues.motherJob || null,
    motherEducation: submittedValues.motherEducation || null,
    religion: submittedValues.religion || null,
    phoneNumber: submittedValues.phoneNumber || null,
    domicileAddress: submittedValues.domicileAddress || null,
    identityCardAddress: submittedValues.identityCardAddress || null,
    dasawisma: submittedValues.dasawisma || null,
    posyandu: submittedValues.posyandu || null,
    puskesmas: submittedValues.puskesmas || null,
    partnerName: submittedValues.partnerName || null,
    partnerNik: submittedValues.partnerNik || null,
    partnerBirthDate: submittedValues.partnerBirthDate || null,
    partnerAge: parsePureInteger(submittedValues.partnerAge),
    partnerJob: submittedValues.partnerJob || null,
    partnerEducation: submittedValues.partnerEducation || null,
    partnerBloodType: submittedValues.partnerBloodType || null,
    heightCm: parsePureNumeric(submittedValues.heightCm),
    prePregnancyWeightKg: parsePureNumeric(submittedValues.prePregnancyWeightKg),
    upperArmCircumferenceCm: parsePureNumeric(submittedValues.upperArmCircumferenceCm),
    initialBmi: parsePureNumeric(submittedValues.initialBmi),
    tetanusStatus: submittedValues.tetanusStatus || null,
    motherBloodType: submittedValues.motherBloodType || null,
    hpht: submittedValues.hpht || null,
    currentComplaints: complaint || null,
    gravidaCount: parsePureInteger(submittedValues.gravidaCount) || 1,
    parityCount: parsePureInteger(submittedValues.parityCount) || 0,
    abortionCount: parsePureInteger(submittedValues.abortionCount) || 0,
    livingChildrenCount: parsePureInteger(submittedValues.livingChildrenCount) || 0,
    hasPreviousPregnancyHistory:
      submittedValues.hasPreviousPregnancyHistory === PREVIOUS_PREGNANCY_CHOICE.YES,
    hasContraceptionHistory: submittedValues.hasContraceptionHistory === CONTRACEPTION_CHOICE.YES,
    smokedBeforePregnancy: submittedValues.smokedBeforePregnancy || null,
    alcoholBeforePregnancy: submittedValues.alcoholBeforePregnancy === 'Ya',
    irregularDietBeforePregnancy: submittedValues.irregularDietBeforePregnancy === 'Ya',
    reducedPhysicalActivityBeforePregnancy:
      submittedValues.reducedPhysicalActivityBeforePregnancy === 'Ya',
    unprescribedMedicationBeforePregnancy:
      submittedValues.unprescribedMedicationBeforePregnancy === 'Ya',
    concerningCosmeticUseBeforePregnancy:
      submittedValues.concerningCosmeticUseBeforePregnancy === 'Ya',
    pesticideExposureBeforePregnancy: submittedValues.pesticideExposureBeforePregnancy === 'Ya',
    chemicalExposureBeforePregnancy: submittedValues.chemicalExposureBeforePregnancy === 'Ya',
    smokeExposureBeforePregnancy: submittedValues.smokeExposureBeforePregnancy === 'Ya',
    concerningEnvironmentNotes: submittedValues.concerningEnvironmentNotes || null,
    allergyInfo: submittedValues.allergyInfo || null,
    otherNotes: submittedValues.otherNotes || null,
    diseaseHistory,
    husband,
    anamnesisResponses,
    healthConditions,
    previousPregnancies,
    contraceptiveHistories
  };
}

export function buildChildImmunizationIntakePayload(
  patientId: string,
  submittedValues: MedicalAppointmentValues,
  patientName?: string,
  patientContact?: string,
  vaccineCatalog?: VaccineCatalogItem[]
): CreateChildImmunizationPayload {
  const entries: ChildImmunizationEntryPayload[] = [];
  const summaryItems: string[] = [];

  const hasVaccineEntries = Object.keys(submittedValues).some(
    (k) => k.startsWith('vaccine_') && k.endsWith('_status') && Boolean(submittedValues[k])
  );

  if (submittedValues.hasVaccineHistory === VACCINE_GATEWAY_CHOICE.YES || hasVaccineEntries) {
    const knownCodes = new Set<string>();

    if (Array.isArray(vaccineCatalog) && vaccineCatalog.length > 0) {
      for (const v of vaccineCatalog) {
        knownCodes.add(v.code || (v as any).id);
      }
    } else {
      for (const k of Object.keys(submittedValues)) {
        if (k.startsWith('vaccine_') && k.endsWith('_status')) {
          const code = k.replace(/^vaccine_/, '').replace(/_status$/, '');
          knownCodes.add(code);
        }
      }
    }

    for (const code of knownCodes) {
      const statusRaw = submittedValues[`vaccine_${code}_status`];
      const date = submittedValues[`vaccine_${code}_date`];
      if (statusRaw) {
        const status: 'GIVEN' | 'NOT_GIVEN' | 'UNKNOWN' =
          statusRaw === 'Sudah' ? 'GIVEN' : statusRaw === 'Belum' ? 'NOT_GIVEN' : 'UNKNOWN';

        const givenDate = status === 'GIVEN' && date ? date : null;
        const datePrecision = date ? 'EXACT' : 'NONE';
        const reviewReasons =
          status === 'UNKNOWN'
            ? [{ code: 'UNKNOWN_STATUS', vaccine_code: code }]
            : status === 'GIVEN' && !date
              ? [{ code: 'DATE_MISSING', vaccine_code: code }]
              : null;

        entries.push({
          vaccineCode: code,
          status,
          givenDate,
          datePrecision,
          reviewReasons
        });

        if (status === 'GIVEN' && date) {
          summaryItems.push(`${code}: Sudah (${date})`);
        } else {
          summaryItems.push(`${code}: ${statusRaw}`);
        }
      }
    }
  }

  let previousVaccineHistory = submittedValues.previousVaccineHistory || null;
  if (!previousVaccineHistory) {
    if (submittedValues.hasVaccineHistory === VACCINE_GATEWAY_CHOICE.NO) {
      previousVaccineHistory = 'Belum pernah imunisasi sama sekali';
    } else if (summaryItems.length > 0) {
      previousVaccineHistory = summaryItems.join('; ');
    }
  }

  let childAllergyHistory = submittedValues.childAllergyHistory || null;
  if (!childAllergyHistory) {
    if (submittedValues.hasAllergyHistory === ALLERGY_GATEWAY_CHOICE.NO) {
      childAllergyHistory = 'Tidak ada riwayat alergi.';
    } else if (submittedValues.hasAllergyHistory === ALLERGY_GATEWAY_CHOICE.YES) {
      childAllergyHistory = 'Ada riwayat alergi.';
    }
  }

  const resolvedHasVaccineHistory =
    submittedValues.hasVaccineHistory || (entries.length > 0 ? VACCINE_GATEWAY_CHOICE.YES : null);

  return {
    patientId,
    childName: submittedValues.childName ? submittedValues.childName : (patientName ?? ''),
    childNik: submittedValues.childNik || '',
    childBirthDate: submittedValues.childBirthDate || '',
    childSex: submittedValues.childSex || '',
    childAgeFormatted: submittedValues.childAgeFormatted || null,
    parentPhone: submittedValues.parentPhone ? submittedValues.parentPhone : (patientContact ?? ''),
    fatherName: submittedValues.fatherName || null,
    motherName: submittedValues.motherName || null,
    childAddress: submittedValues.childAddress || null,
    hasVaccineHistory: resolvedHasVaccineHistory,
    previousVaccineHistory,
    hasAllergyHistory: submittedValues.hasAllergyHistory || null,
    childAllergyHistory,
    entries: entries.length > 0 ? entries : undefined
  };
}
