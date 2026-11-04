import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { klinikKeys } from '../../../api/query-keys';
import { kiaIntakeService } from '../../../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import type { PatientMutationPayload } from '@/features/data-pasien/api/types';
import type { Appointment } from '../../../api/types';
import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';
import {
  validateMaternalForm,
  validateImmunizationForm,
  validateRegularForm
} from '../../../validations/inspector-form.schema';
import {
  buildInitialMaternalData,
  buildInitialImmunizationData,
  buildInitialRegularData
} from './inspector-initial-state';

interface UseInspectorSaveParams {
  appointment: Appointment;
  parsedData: UnifiedInspectorData;
  serverIntake: any;
  isPregnancy: boolean;
  isImmunization: boolean;
  formData: EditableMaternalData;
  immunizationFormData: EditableImmunizationData;
  regularFormData: EditableRegularData;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setIsEditing: (val: boolean) => void;
}

const MATERNAL_CONDITION_CODES_MAP: Record<string, string> = {
  hasHypertensionHistory: 'hypertension',
  hasHeartDiseaseHistory: 'heart_disease',
  hasThyroidDiseaseHistory: 'thyroid_disease',
  hasAutoimmuneHistory: 'autoimmune',
  hasDiabetesHistory: 'diabetes',
  hasAsthmaHistory: 'asthma',
  hasTuberculosisHistory: 'tuberculosis',
  hasHepatitisBHistory: 'hepatitis_b',
  hasHivOrSyphilisHistory: 'hiv_syphilis',
  hasMentalHealthHistory: 'mental_health',
  hasTwinPregnancyHistory: 'twin_pregnancy',
  hasCystMyomaTumorHistory: 'cyst_myoma_tumor',
  hasSurgeryHistory: 'surgery',
  hasOtherDiseaseHistory: 'other'
};

export function useInspectorSave({
  appointment,
  parsedData,
  serverIntake,
  isPregnancy,
  isImmunization,
  formData,
  immunizationFormData,
  regularFormData,
  setValidationErrors,
  setIsEditing
}: UseInspectorSaveParams) {
  const [isSaving, setIsSaving] = React.useState(false);
  const queryClient = useQueryClient();

  const invalidateCommonQueries = React.useCallback(
    async (patientId?: string) => {
      await queryClient.invalidateQueries({
        queryKey: klinikKeys.appointmentIntake(appointment.id)
      });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['appointment', appointment.id] });
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });
      if (patientId) {
        await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      }
    },
    [queryClient, appointment.id]
  );

  const saveMaternal = React.useCallback(async () => {
    const validation = validateMaternalForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Periksa kembali isian formulir KIA & Kehamilan yang ditandai merah.');
      return;
    }
    setValidationErrors({});
    const targetId = parsedData.maternal?.id || appointment.id;

    const healthConditionsPayload = Object.entries(MATERNAL_CONDITION_CODES_MAP).map(
      ([fieldKey, code]) => {
        const has = Boolean(formData.diseaseHistory[fieldKey]);
        const rawYearStr =
          fieldKey === 'hasOtherDiseaseHistory'
            ? formData.diseaseHistory.otherDiseaseHistoryYear
            : formData.diseaseHistory[`${fieldKey}Notes`] || formData.diseaseHistory[fieldKey];
        const year = rawYearStr ? parseInt(String(rawYearStr), 10) : NaN;
        const notes =
          fieldKey === 'hasOtherDiseaseHistory'
            ? formData.diseaseHistory.otherDiseaseHistoryNotes || null
            : null;
        return {
          conditionCode: code,
          hasCondition: has,
          diagnosisYear: !isNaN(year) ? year : null,
          notes
        };
      }
    );

    const payload = {
      motherName: formData.motherName || undefined,
      motherNik: formData.motherNik || undefined,
      motherBirthDate: formData.motherBirthDate || undefined,
      motherAge: formData.motherAge ? Number(formData.motherAge) : undefined,
      marriageOrder: formData.marriageOrder ? Number(formData.marriageOrder) : 1,
      marriageDate: formData.marriageDate || undefined,
      motherJob: formData.motherJob || undefined,
      motherEducation: formData.motherEducation || undefined,
      religion: formData.religion || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      domicileAddress: formData.domicileAddress || undefined,
      identityCardAddress: formData.identityCardAddress || undefined,
      dasawisma: formData.dasawisma || undefined,
      posyandu: formData.posyandu || undefined,
      puskesmas: formData.puskesmas || undefined,

      partnerName: formData.partnerName || undefined,
      partnerNik: formData.partnerNik || undefined,
      partnerBirthDate: formData.partnerBirthDate || undefined,
      partnerAge: formData.partnerAge ? Number(formData.partnerAge) : undefined,
      partnerJob: formData.partnerJob || undefined,
      partnerEducation: formData.partnerEducation || undefined,
      partnerBloodType: formData.partnerBloodType || undefined,
      husband: {
        fullName: formData.partnerName || undefined,
        nik: formData.partnerNik || undefined,
        birthDate: formData.partnerBirthDate || undefined,
        age: formData.partnerAge ? Number(formData.partnerAge) : undefined,
        job: formData.partnerJob || undefined,
        education: formData.partnerEducation || undefined,
        bloodType: formData.partnerBloodType || undefined,
        phoneNumber: formData.partnerPhone || undefined
      },

      heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
      prePregnancyWeightKg: formData.prePregnancyWeightKg
        ? Number(formData.prePregnancyWeightKg)
        : undefined,
      upperArmCircumferenceCm: formData.upperArmCircumferenceCm
        ? Number(formData.upperArmCircumferenceCm)
        : undefined,
      initialBmi: formData.initialBmi ? Number(formData.initialBmi) : undefined,
      tetanusStatus: formData.tetanusStatus || undefined,
      motherBloodType: formData.motherBloodType || undefined,

      hpht: formData.hpht || undefined,
      estimatedDueDate: formData.estimatedDueDate || undefined,
      gestationalAgeWeeks: formData.gestationalAgeWeeks
        ? Number(formData.gestationalAgeWeeks)
        : undefined,
      gestationalAgeFormatted: formData.gestationalAgeFormatted || undefined,
      currentComplaints: formData.currentComplaints || undefined,

      gravidaCount: Number(formData.gravidaCount) || 1,
      parityCount: Number(formData.parityCount) || 0,
      abortionCount: Number(formData.abortionCount) || 0,
      livingChildrenCount: Number(formData.livingChildrenCount) || 0,
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

      concerningEnvironmentNotes: formData.concerningEnvironmentNotes,
      allergyInfo: formData.allergyInfo,
      otherNotes: formData.otherNotes,

      previousPregnancies: formData.previousPregnancies.map((p, idx) => ({
        orderNumber: p.orderNumber || idx + 1,
        birthYear: p.birthYear || undefined,
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

      healthConditions: healthConditionsPayload,
      answers: {
        ...formData,
        ...formData.diseaseHistory
      }
    };

    const patientId = parsedData.patient?.id || appointment.patient_id;
    if (patientId) {
      const initialMaternal = buildInitialMaternalData(parsedData);
      const diffPayload: Partial<PatientMutationPayload> = {};

      if (formData.motherName !== initialMaternal.motherName) {
        diffPayload.name = formData.motherName?.trim() || undefined;
      }
      if (formData.motherNik !== initialMaternal.motherNik) {
        diffPayload.nik = formData.motherNik?.trim() || undefined;
      }
      if (formData.medicalRecordNumber !== initialMaternal.medicalRecordNumber) {
        diffPayload.medical_record_number = formData.medicalRecordNumber?.trim() || undefined;
      }
      if (formData.birthPlace !== initialMaternal.birthPlace) {
        diffPayload.birth_place = formData.birthPlace?.trim() || undefined;
      }
      if (formData.motherBirthDate !== initialMaternal.motherBirthDate) {
        diffPayload.birth_date = formData.motherBirthDate || undefined;
      }
      if (formData.motherBloodType !== initialMaternal.motherBloodType) {
        diffPayload.blood_type = (formData.motherBloodType as any) || undefined;
      }
      if (formData.motherJob !== initialMaternal.motherJob) {
        diffPayload.occupation = formData.motherJob?.trim() || undefined;
      }
      if (formData.phoneNumber !== initialMaternal.phoneNumber) {
        diffPayload.phone = formData.phoneNumber?.trim() || undefined;
      }
      if (formData.domicileAddress !== initialMaternal.domicileAddress) {
        diffPayload.line1 = formData.domicileAddress?.trim() || undefined;
      }

      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateMaternityIntake(targetId, payload);
    if (formData.currentComplaints) {
      appointment.complaint = formData.currentComplaints;
    }
    await invalidateCommonQueries(patientId);
    toast.success('Perubahan formulir KIA & Kehamilan berhasil disimpan!');
    setIsEditing(false);
  }, [formData, parsedData, appointment, invalidateCommonQueries, setIsEditing, setValidationErrors]);

  const saveImmunization = React.useCallback(async () => {
    const validation = validateImmunizationForm(immunizationFormData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Periksa kembali isian formulir imunisasi yang ditandai merah.');
      return;
    }
    setValidationErrors({});
    const targetId = parsedData.child?.id || appointment.id;

    const entries: any[] = [];
    const processedCodes = new Set<string>();

    Object.keys(immunizationFormData.vaccineValues || {}).forEach((key) => {
      if (key.startsWith('vaccine_') && key.endsWith('_status')) {
        const code = key.replace('vaccine_', '').replace('_status', '');
        if (!processedCodes.has(code)) {
          processedCodes.add(code);
          const statusVal = immunizationFormData.vaccineValues[key];
          const dateVal = immunizationFormData.vaccineValues[`vaccine_${code}_date`];

          let status: 'GIVEN' | 'NOT_GIVEN' | 'UNKNOWN' = 'UNKNOWN';
          if (statusVal === 'Sudah') status = 'GIVEN';
          else if (statusVal === 'Belum') status = 'NOT_GIVEN';

          entries.push({
            vaccineCode: code,
            status,
            givenDate: status === 'GIVEN' && dateVal ? dateVal : null
          });
        }
      }
    });

    const finalEntries =
      immunizationFormData.entries && immunizationFormData.entries.length > 0
        ? immunizationFormData.entries
        : entries;

    const payload = {
      childName: immunizationFormData.childName,
      childNik: immunizationFormData.childNik || undefined,
      childBirthDate: immunizationFormData.childBirthDate || undefined,
      childSex: immunizationFormData.childSex || undefined,
      childAgeFormatted: immunizationFormData.childAgeFormatted || undefined,
      parentPhone: immunizationFormData.parentPhone,
      fatherName: immunizationFormData.fatherName || undefined,
      motherName: immunizationFormData.motherName || undefined,
      childAddress: immunizationFormData.childAddress || undefined,
      hasVaccineHistory: immunizationFormData.hasVaccineHistory,
      previousVaccineHistory: immunizationFormData.previousVaccineHistory,
      hasAllergyHistory: immunizationFormData.hasAllergyHistory,
      childAllergyHistory: immunizationFormData.childAllergyHistory,
      entries: finalEntries
    };

    const patientId = parsedData.patient?.id || appointment.patient_id;
    if (patientId) {
      const initialChild = buildInitialImmunizationData(parsedData);
      const diffPayload: Partial<PatientMutationPayload> = {};

      if (immunizationFormData.childName !== initialChild.childName) {
        diffPayload.name = immunizationFormData.childName?.trim() || undefined;
      }
      if (immunizationFormData.childNik !== initialChild.childNik) {
        diffPayload.nik = immunizationFormData.childNik?.trim() || undefined;
      }
      if (immunizationFormData.medicalRecordNumber !== initialChild.medicalRecordNumber) {
        diffPayload.medical_record_number =
          immunizationFormData.medicalRecordNumber?.trim() || undefined;
      }
      if (immunizationFormData.birthPlace !== initialChild.birthPlace) {
        diffPayload.birth_place = immunizationFormData.birthPlace?.trim() || undefined;
      }
      if (immunizationFormData.childBirthDate !== initialChild.childBirthDate) {
        diffPayload.birth_date = immunizationFormData.childBirthDate || undefined;
      }
      if (immunizationFormData.childSex !== initialChild.childSex) {
        diffPayload.gender = immunizationFormData.childSex === 'Perempuan' ? 'female' : 'male';
      }
      if (immunizationFormData.motherName !== initialChild.motherName) {
        diffPayload.mother_name = immunizationFormData.motherName?.trim() || undefined;
      }
      if (immunizationFormData.parentPhone !== initialChild.parentPhone) {
        diffPayload.phone = immunizationFormData.parentPhone?.trim() || undefined;
      }
      if (immunizationFormData.childAddress !== initialChild.childAddress) {
        diffPayload.line1 = immunizationFormData.childAddress?.trim() || undefined;
      }

      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateImmunizationIntake(targetId, payload);
    await invalidateCommonQueries(patientId);
    toast.success('Perubahan formulir imunisasi anak berhasil disimpan!');
    setIsEditing(false);
  }, [immunizationFormData, parsedData, appointment, invalidateCommonQueries, setIsEditing, setValidationErrors]);

  const saveRegular = React.useCallback(async () => {
    const validation = validateRegularForm(regularFormData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Periksa kembali isian formulir pasien yang ditandai merah.');
      return;
    }
    setValidationErrors({});

    const targetId =
      (serverIntake as any)?.data?.id || (serverIntake as any)?.id || appointment.id;

    const answersPayload = {
      ...regularFormData.answers,
      complaint: regularFormData.complaint,
      keluhanUtama: regularFormData.complaint
    };

    const patientId = parsedData.patient?.id || appointment.patient_id;
    if (patientId) {
      const initialRegular = buildInitialRegularData(parsedData, appointment);
      const diffPayload: Partial<PatientMutationPayload> = {};

      if (regularFormData.fullName !== initialRegular.fullName) {
        diffPayload.name = regularFormData.fullName?.trim() || undefined;
      }
      if (regularFormData.nik !== initialRegular.nik) {
        diffPayload.nik = regularFormData.nik?.trim() || undefined;
      }
      if (regularFormData.medicalRecordNumber !== initialRegular.medicalRecordNumber) {
        diffPayload.medical_record_number =
          regularFormData.medicalRecordNumber?.trim() || undefined;
      }
      if (regularFormData.birthPlace !== initialRegular.birthPlace) {
        diffPayload.birth_place = regularFormData.birthPlace?.trim() || undefined;
      }
      if (regularFormData.birthDate !== initialRegular.birthDate) {
        diffPayload.birth_date = regularFormData.birthDate || undefined;
      }
      if (regularFormData.gender !== initialRegular.gender) {
        diffPayload.gender = (regularFormData.gender as any) || undefined;
      }
      if (regularFormData.bloodType !== initialRegular.bloodType) {
        diffPayload.blood_type = (regularFormData.bloodType as any) || undefined;
      }
      if (regularFormData.motherName !== initialRegular.motherName) {
        diffPayload.mother_name = regularFormData.motherName?.trim() || undefined;
      }
      if (regularFormData.occupation !== initialRegular.occupation) {
        diffPayload.occupation = regularFormData.occupation?.trim() || undefined;
      }
      if (regularFormData.phone !== initialRegular.phone) {
        diffPayload.phone = regularFormData.phone?.trim() || undefined;
      }
      if (regularFormData.email !== initialRegular.email) {
        diffPayload.email = regularFormData.email ? regularFormData.email.trim() : '';
      }
      if (regularFormData.line1 !== initialRegular.line1) {
        diffPayload.line1 = regularFormData.line1 ? regularFormData.line1.trim() : '';
      }
      if (regularFormData.provinceName !== initialRegular.provinceName) {
        diffPayload.province_name = regularFormData.provinceName || undefined;
      }
      if (regularFormData.provinceCode !== initialRegular.provinceCode) {
        diffPayload.province_code = regularFormData.provinceCode || undefined;
      }
      if (regularFormData.regencyName !== initialRegular.regencyName) {
        diffPayload.regency_name = regularFormData.regencyName || undefined;
      }
      if (regularFormData.regencyCode !== initialRegular.regencyCode) {
        diffPayload.regency_code = regularFormData.regencyCode || undefined;
      }
      if (regularFormData.districtName !== initialRegular.districtName) {
        diffPayload.district_name = regularFormData.districtName || undefined;
      }
      if (regularFormData.districtCode !== initialRegular.districtCode) {
        diffPayload.district_code = regularFormData.districtCode || undefined;
      }
      if (regularFormData.villageName !== initialRegular.villageName) {
        diffPayload.village_name = regularFormData.villageName || undefined;
      }
      if (regularFormData.villageCode !== initialRegular.villageCode) {
        diffPayload.village_code = regularFormData.villageCode || undefined;
      }
      if (regularFormData.emergencyContactPhone !== initialRegular.emergencyContactPhone) {
        diffPayload.emergency_contact =
          regularFormData.emergencyContactPhone?.trim() || undefined;
        diffPayload.emergencyContactPhone =
          regularFormData.emergencyContactPhone?.trim() || undefined;
      }
      if (regularFormData.emergencyContactName !== initialRegular.emergencyContactName) {
        diffPayload.emergencyContactName =
          regularFormData.emergencyContactName?.trim() || undefined;
      }
      if (
        regularFormData.emergencyContactRelationship !==
        initialRegular.emergencyContactRelationship
      ) {
        diffPayload.emergencyContactRelationship =
          regularFormData.emergencyContactRelationship?.trim() || undefined;
      }

      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateGenericIntake(targetId, answersPayload);
    if (regularFormData.complaint) {
      appointment.complaint = regularFormData.complaint;
    }
    await invalidateCommonQueries(patientId);
    toast.success('Perubahan formulir intake pasien berhasil disimpan!');
    setIsEditing(false);
  }, [regularFormData, serverIntake, appointment, parsedData, invalidateCommonQueries, setIsEditing, setValidationErrors]);

  const handleSaveEdit = React.useCallback(async () => {
    try {
      setIsSaving(true);
      if (isPregnancy) {
        await saveMaternal();
      } else if (isImmunization) {
        await saveImmunization();
      } else {
        await saveRegular();
      }
    } catch (err: any) {
      console.error('Failed to update intake:', err);
      toast.error(err?.message || 'Gagal menyimpan perubahan formulir');
    } finally {
      setIsSaving(false);
    }
  }, [isPregnancy, isImmunization, saveMaternal, saveImmunization, saveRegular]);

  return {
    isSaving,
    handleSaveEdit
  };
}
