import type * as React from 'react';
import { toast } from 'sonner';
import { kiaIntakeService } from '../../../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import type { Appointment } from '../../../api/types';
import type { UnifiedInspectorData, EditableMaternalData, EditableRegularData } from '../types';
import {
  validateMaternalForm,
  validateRegularForm,
  getMaternityTabWithErrors,
  MATERNITY_TAB_LABELS
} from '../../../validations/inspector-form.schema';
import { buildInitialMaternalData, buildInitialRegularData } from './inspector-initial-state';
import { getMaternalPatientDiff, getRegularPatientDiff } from './patient-diff-helper';
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { toNullableString } from './inspector-save-utils';

export interface SaveMaternalParams {
  formData: EditableMaternalData;
  regularFormData?: EditableRegularData;
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export async function saveMaternalAction({
  formData,
  regularFormData,
  parsedData,
  appointment,
  setValidationErrors
}: SaveMaternalParams): Promise<void> {
  if (regularFormData) {
    const regValidation = validateRegularForm(regularFormData);
    if (!regValidation.isValid) {
      setValidationErrors(regValidation.errors);
      toast.error('Periksa kembali isian identitas pasien yang ditandai merah.');
      throw new Error('Validasi identitas pasien gagal');
    }
  }

  const validation = validateMaternalForm(formData);
  if (!validation.isValid) {
    setValidationErrors(validation.errors);
    const firstTab = getMaternityTabWithErrors(validation.errors);
    const firstKey = Object.keys(validation.errors)[0];
    const firstMsg = validation.errors[firstKey];
    const tabLabel = firstTab ? MATERNITY_TAB_LABELS[firstTab] || firstTab : 'Formulir KIA';
    toast.error(`${tabLabel}: ${firstMsg}`);
    throw new Error(`${tabLabel}: ${firstMsg}`);
  }
  setValidationErrors({});

  const targetId = parsedData.maternal?.id;
  if (!targetId) {
    toast.error('Gagal menyimpan: ID formulir KIA & Kehamilan tidak ditemukan.');
    throw new Error('ID formulir KIA & Kehamilan tidak ditemukan');
  }

  const newMotherNik = formData.motherNik?.trim();
  const originalMotherNik = (parsedData.maternal?.motherNik || parsedData.patient?.nik)?.trim();
  if (newMotherNik && newMotherNik !== originalMotherNik && newMotherNik.length === 16) {
    const check = await patientAffiliationService.verifyNikAvailability(newMotherNik);
    if (!check.available) {
      setValidationErrors({ motherNik: 'NIK ini sudah terdaftar pada pasien lain' });
      toast.error('NIK Ibu sudah terdaftar pada pasien lain');
      throw new Error('NIK Ibu sudah terdaftar pada pasien lain');
    }
  }

  const existingConditionsMap = new Map<string, any>();
  if (formData.conditionResponses && Array.isArray(formData.conditionResponses)) {
    formData.conditionResponses.forEach((c) => {
      if (c.conditionCode) {
        existingConditionsMap.set(c.conditionCode.toUpperCase(), c);
      }
    });
  }

  const healthConditionsPayload = CANONICAL_MATERNAL_CONDITIONS.map((condDef) => {
    const resp = existingConditionsMap.get(condDef.code);
    return {
      conditionCode: condDef.code,
      hasCondition: Boolean(resp?.hasCondition),
      diagnosisYear: resp?.diagnosisYear ? Number(resp.diagnosisYear) : null,
      notes: condDef.code === 'OTHER' ? resp?.notes || null : null
    };
  });

  const payload = {
    motherName: formData.motherName?.trim() || '',
    motherNik: formData.motherNik?.trim() || '',
    motherBirthDate: formData.motherBirthDate || null,
    motherAge: formData.motherAge ? Number(formData.motherAge) : null,
    marriageOrder: formData.marriageOrder ? Number(formData.marriageOrder) : 1,
    marriageDate: toNullableString(formData.marriageDate),
    motherJob: toNullableString(formData.motherJob),
    motherEducation: toNullableString(formData.motherEducation),
    religion: toNullableString(formData.religion),
    phoneNumber: toNullableString(formData.phoneNumber),
    domicileAddress: toNullableString(formData.domicileAddress),
    identityCardAddress: toNullableString(formData.identityCardAddress),
    dasawisma: toNullableString(formData.dasawisma),
    posyandu: toNullableString(formData.posyandu),
    puskesmas: toNullableString(formData.puskesmas),

    partnerName: toNullableString(formData.partnerName),
    partnerNik: toNullableString(formData.partnerNik),
    partnerBirthDate: toNullableString(formData.partnerBirthDate),
    partnerAge: formData.partnerAge ? Number(formData.partnerAge) : null,
    partnerJob: toNullableString(formData.partnerJob),
    partnerEducation: toNullableString(formData.partnerEducation),
    partnerBloodType: toNullableString(formData.partnerBloodType),
    husband: formData.partnerName?.trim()
      ? {
          fullName: formData.partnerName.trim(),
          nik: toNullableString(formData.partnerNik),
          birthDate: toNullableString(formData.partnerBirthDate),
          age: formData.partnerAge ? Number(formData.partnerAge) : null,
          job: toNullableString(formData.partnerJob),
          education: toNullableString(formData.partnerEducation),
          bloodType: toNullableString(formData.partnerBloodType),
          phoneNumber: toNullableString(formData.partnerPhone)
        }
      : null,

    heightCm: formData.heightCm ? Number(formData.heightCm) : null,
    prePregnancyWeightKg: formData.prePregnancyWeightKg ? Number(formData.prePregnancyWeightKg) : null,
    upperArmCircumferenceCm: formData.upperArmCircumferenceCm ? Number(formData.upperArmCircumferenceCm) : null,
    initialBmi: formData.initialBmi ? Number(formData.initialBmi) : null,
    tetanusStatus: toNullableString(formData.tetanusStatus),
    motherBloodType: toNullableString(formData.motherBloodType),

    hpht: toNullableString(formData.hpht),
    estimatedDueDate: toNullableString(formData.estimatedDueDate),
    gestationalAgeWeeks: formData.gestationalAgeWeeks ? Number(formData.gestationalAgeWeeks) : null,
    gestationalAgeFormatted: toNullableString(formData.gestationalAgeFormatted),
    currentComplaints: toNullableString(formData.currentComplaints),

    gravidaCount: Number(formData.gravidaCount || 1),
    parityCount: Number(formData.parityCount || 0),
    abortionCount: Number(formData.abortionCount || 0),
    livingChildrenCount: Number(formData.livingChildrenCount || 0),
    hasPreviousPregnancyHistory: Boolean(formData.hasPreviousPregnancyHistory),
    hasContraceptionHistory: Boolean(formData.hasContraceptionHistory),

    smokedBeforePregnancy: formData.smokedBeforePregnancy,
    alcoholBeforePregnancy: formData.alcoholBeforePregnancy,
    irregularDietBeforePregnancy: formData.irregularDietBeforePregnancy,
    reducedPhysicalActivityBeforePregnancy: formData.reducedPhysicalActivityBeforePregnancy,
    unprescribedMedicationBeforePregnancy: formData.unprescribedMedicationBeforePregnancy,
    concerningCosmeticUseBeforePregnancy: formData.concerningCosmeticUseBeforePregnancy,
    pesticideExposureBeforePregnancy: formData.pesticideExposureBeforePregnancy,
    chemicalExposureBeforePregnancy: formData.chemicalExposureBeforePregnancy,
    smokeExposureBeforePregnancy: formData.smokeExposureBeforePregnancy,

    concerningEnvironmentNotes: toNullableString(formData.concerningEnvironmentNotes),
    allergyInfo: toNullableString(formData.allergyInfo),
    otherNotes: toNullableString(formData.otherNotes),

    previousPregnancies: formData.previousPregnancies.map((p, idx) => ({
      orderNumber: p.orderNumber || idx + 1,
      birthYear: p.birthYear ? String(p.birthYear).trim() : undefined,
      birthWeightGrams: p.birthWeightGrams ? Number(p.birthWeightGrams) : undefined,
      birthLengthCm: p.birthLengthCm ? Number(p.birthLengthCm) : undefined,
      childSex: p.childSex || undefined,
      gestationalAgeAtBirth: p.gestationalAgeAtBirth || undefined,
      birthAttendant: p.birthAttendant || undefined,
      deliveryMethod: p.deliveryMethod || undefined,
      deliveryPlace: p.deliveryPlace || undefined,
      complications: p.complications || undefined
    })),

    contraceptiveHistories: formData.contraceptiveHistories.map((c, idx) => ({
      orderNumber: c.orderNumber || idx + 1,
      contraceptiveType: c.contraceptiveType || undefined,
      startDate: c.startDate || undefined,
      stopDate: c.stopDate || undefined,
      durationText: c.durationText || undefined,
      problems: c.problems || undefined,
      sideEffects: c.sideEffects || undefined
    })),

    healthConditions: healthConditionsPayload
  };

  const patientId = parsedData.patient?.id || appointment.patient_id;
  if (patientId) {
    if (regularFormData) {
      const initialRegular = buildInitialRegularData(parsedData, appointment);
      const diffPayload = getRegularPatientDiff(regularFormData, initialRegular);
      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    } else {
      const initialMaternal = buildInitialMaternalData(parsedData);
      const diffPayload = getMaternalPatientDiff(formData, initialMaternal);
      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }
  }

  await kiaIntakeService.updateMaternityIntake(targetId, payload);
  appointment.complaint = regularFormData?.complaint?.trim() || formData.currentComplaints.trim() || '';
}
