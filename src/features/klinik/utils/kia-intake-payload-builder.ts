import type { MedicalAppointmentValues } from './medical-appointment';
import type {
  CreateChildImmunizationPayload,
  CreateMaternityIntakePayload
} from '../api/kia-intake-service';
import {
  CONTRACEPTION_CHOICE,
  DEFAULT_INTAKE_VALUES,
  GENDER_CHOICE,
  PREVIOUS_PREGNANCY_CHOICE
} from '../constants/kia-constants';

export function buildMaternityIntakePayload(
  patientId: string,
  submittedValues: MedicalAppointmentValues,
  patientName?: string,
  complaint?: string
): CreateMaternityIntakePayload {
  const previousPregnancies = [];
  for (let i = 1; i <= 4; i += 1) {
    const birthYear = submittedValues[`prevPregnancy${i}BirthYear`];
    if (birthYear) {
      previousPregnancies.push({
        orderNumber: i,
        birthYear,
        birthWeightGrams: Number(submittedValues[`prevPregnancy${i}Weight`]) || undefined,
        birthLengthCm: Number(submittedValues[`prevPregnancy${i}Height`]) || undefined,
        childSex: submittedValues[`prevPregnancy${i}ChildSex`],
        gestationalAgeAtBirth: submittedValues[`prevPregnancy${i}GestationalAge`],
        birthAttendant: submittedValues[`prevPregnancy${i}Attendant`],
        deliveryMethod: submittedValues[`prevPregnancy${i}DeliveryMethod`],
        deliveryPlace: submittedValues[`prevPregnancy${i}Place`],
        complications: submittedValues[`prevPregnancy${i}Complications`]
      });
    }
  }

  const contraceptiveHistories = [];
  for (let i = 1; i <= 4; i += 1) {
    const contraceptiveType = submittedValues[`contraceptive${i}Type`];
    if (contraceptiveType) {
      contraceptiveHistories.push({
        orderNumber: i,
        contraceptiveType,
        startDate: submittedValues[`contraceptive${i}StartDate`],
        durationText: submittedValues[`contraceptive${i}Duration`],
        stopDate: submittedValues[`contraceptive${i}StopDate`],
        problems: submittedValues[`contraceptive${i}Problems`],
        sideEffects: submittedValues[`contraceptive${i}SideEffects`]
      });
    }
  }

  return {
    patientId,
    motherNik: submittedValues.motherNik || DEFAULT_INTAKE_VALUES.DEFAULT_PLACEHOLDER_NIK,
    motherName:
      submittedValues.motherName || patientName || DEFAULT_INTAKE_VALUES.DEFAULT_MOTHER_NAME,
    motherBirthDate: submittedValues.motherBirthDate || null,
    motherAge: Number(submittedValues.motherAge) || null,
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
    partnerAge: Number(submittedValues.partnerAge) || null,
    partnerJob: submittedValues.partnerJob || null,
    partnerEducation: submittedValues.partnerEducation || null,
    partnerBloodType: submittedValues.partnerBloodType || null,
    heightCm: Number(submittedValues.heightCm) || null,
    prePregnancyWeightKg: Number(submittedValues.prePregnancyWeightKg) || null,
    upperArmCircumferenceCm: Number(submittedValues.upperArmCircumferenceCm) || null,
    initialBmi: Number(submittedValues.initialBmi) || null,
    tetanusStatus: submittedValues.tetanusStatus || null,
    motherBloodType: submittedValues.motherBloodType || null,
    hpht: submittedValues.hpht || null,
    currentComplaints: complaint || null,
    gravidaCount: Number(submittedValues.gravidaCount) || 1,
    parityCount: Number(submittedValues.parityCount) || 0,
    abortionCount: Number(submittedValues.abortionCount) || 0,
    livingChildrenCount: Number(submittedValues.livingChildrenCount) || 0,
    hasPreviousPregnancyHistory:
      submittedValues.hasPreviousPregnancyHistory === PREVIOUS_PREGNANCY_CHOICE.YES,
    hasContraceptionHistory: submittedValues.hasContraceptionHistory === CONTRACEPTION_CHOICE.YES,
    smokedBeforePregnancy: submittedValues.smokedBeforePregnancy || null,
    concerningEnvironmentNotes: submittedValues.concerningEnvironmentNotes || null,
    allergyInfo: submittedValues.allergyInfo || null,
    otherNotes: submittedValues.otherNotes || null,
    previousPregnancies,
    contraceptiveHistories
  };
}

export function buildChildImmunizationIntakePayload(
  patientId: string,
  submittedValues: MedicalAppointmentValues,
  patientName?: string,
  patientContact?: string
): CreateChildImmunizationPayload {
  return {
    patientId,
    childName: submittedValues.childName || patientName || DEFAULT_INTAKE_VALUES.DEFAULT_CHILD_NAME,
    childNik: submittedValues.childNik || DEFAULT_INTAKE_VALUES.DEFAULT_PLACEHOLDER_NIK,
    childBirthDate:
      submittedValues.childBirthDate || DEFAULT_INTAKE_VALUES.DEFAULT_CHILD_BIRTH_DATE,
    childSex: submittedValues.childSex || GENDER_CHOICE.MALE,
    childAgeFormatted: submittedValues.childAgeFormatted || null,
    parentPhone:
      submittedValues.parentPhone || patientContact || DEFAULT_INTAKE_VALUES.DEFAULT_PARENT_PHONE,
    fatherName: submittedValues.fatherName || null,
    motherName: submittedValues.motherName || null,
    childAddress: submittedValues.childAddress || null,
    previousVaccineHistory: submittedValues.previousVaccineHistory || null,
    childAllergyHistory: submittedValues.childAllergyHistory || null
  };
}
