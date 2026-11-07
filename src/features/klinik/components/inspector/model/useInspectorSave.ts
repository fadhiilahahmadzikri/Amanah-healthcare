import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { klinikKeys } from '../../../api/query-keys';
import { kiaIntakeService } from '../../../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
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
import {
  getMaternalPatientDiff,
  getImmunizationPatientDiff,
  getRegularPatientDiff
} from './patient-diff-helper';
import { CANONICAL_MATERNAL_CONDITIONS } from '@/features/maternity/constants/maternity.constants';
import { appointmentDraftService } from '../../../services/appointment-draft.service';

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

    const targetId = parsedData.maternal?.id;
    if (!targetId) {
      toast.error('Gagal menyimpan: ID formulir KIA & Kehamilan tidak ditemukan.');
      return;
    }

    // Resolve health conditions using canonical uppercase condition codes
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
        notes: condDef.code === 'OTHER' ? (resp?.notes || null) : null
      };
    });

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

      heightCm: formData.heightCm
        ? Math.min(300, Math.max(0, Number(formData.heightCm)))
        : undefined,
      prePregnancyWeightKg: formData.prePregnancyWeightKg
        ? Math.min(500, Math.max(0, Number(formData.prePregnancyWeightKg)))
        : undefined,
      upperArmCircumferenceCm: formData.upperArmCircumferenceCm
        ? Math.min(150, Math.max(0, Number(formData.upperArmCircumferenceCm)))
        : undefined,
      initialBmi: formData.initialBmi
        ? Math.min(150, Math.max(0, Number(formData.initialBmi)))
        : undefined,
      tetanusStatus: formData.tetanusStatus || undefined,
      motherBloodType: formData.motherBloodType || undefined,

      hpht: formData.hpht || undefined,
      estimatedDueDate: formData.estimatedDueDate || undefined,
      gestationalAgeWeeks: formData.gestationalAgeWeeks
        ? Math.min(60, Math.max(0, Number(formData.gestationalAgeWeeks)))
        : undefined,
      gestationalAgeFormatted: formData.gestationalAgeFormatted || undefined,
      currentComplaints: formData.currentComplaints || undefined,

      gravidaCount: Math.min(50, Math.max(1, Number(formData.gravidaCount) || 1)),
      parityCount: Math.min(50, Math.max(0, Number(formData.parityCount) || 0)),
      abortionCount: Math.min(50, Math.max(0, Number(formData.abortionCount) || 0)),
      livingChildrenCount: Math.min(50, Math.max(0, Number(formData.livingChildrenCount) || 0)),
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
        birthYear: p.birthYear ? String(p.birthYear).trim() : undefined,
        birthWeightGrams:
          p.birthWeightGrams !== undefined &&
          p.birthWeightGrams !== null &&
          p.birthWeightGrams !== ('' as any)
            ? Math.min(30000, Math.max(0, Number(p.birthWeightGrams)))
            : undefined,
        birthLengthCm:
          p.birthLengthCm !== undefined &&
          p.birthLengthCm !== null &&
          p.birthLengthCm !== ('' as any)
            ? Math.min(250, Math.max(0, Number(p.birthLengthCm)))
            : undefined,
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
      const initialMaternal = buildInitialMaternalData(parsedData);
      const diffPayload = getMaternalPatientDiff(formData, initialMaternal);
      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateMaternityIntake(targetId, payload);
    if (formData.currentComplaints) {
      appointment.complaint = formData.currentComplaints;
    }
    await invalidateCommonQueries(patientId);
    if (appointment?.id) {
      appointmentDraftService.clearInspectorDraft(appointment.id);
    }
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

    const targetId = parsedData.child?.id;
    if (!targetId) {
      toast.error('Gagal menyimpan: ID formulir imunisasi tidak ditemukan.');
      return;
    }

    // SSOT: Use relational clinical entries directly
    const rawEntries = Array.isArray(immunizationFormData.entries)
      ? immunizationFormData.entries
      : [];

    const finalEntries = rawEntries.map((e: any) => ({
      rowIndex: Number(e.rowIndex) || 0,
      vaccineName: e.vaccineName || undefined,
      vaccineCode: e.vaccineCode || undefined,
      status: e.status || 'NOT_GIVEN',
      injectionDate: e.injectionDate || null,
      ageDisplay: e.ageDisplay || null,
      fever: e.fever || null,
      cough: e.cough || null,
      runnyNose: e.runnyNose || null,
      weightKg:
        e.weightKg !== undefined && e.weightKg !== null && e.weightKg !== ''
          ? Math.min(150, Math.max(0.5, Number(e.weightKg)))
          : null,
      heightCm:
        e.heightCm !== undefined && e.heightCm !== null && e.heightCm !== ''
          ? Math.min(250, Math.max(20, Number(e.heightCm)))
          : null,
      headCircumferenceCm:
        e.headCircumferenceCm !== undefined &&
        e.headCircumferenceCm !== null &&
        e.headCircumferenceCm !== ''
          ? Math.min(100, Math.max(10, Number(e.headCircumferenceCm)))
          : null,
      temperatureCelsius:
        e.temperatureCelsius !== undefined &&
        e.temperatureCelsius !== null &&
        e.temperatureCelsius !== ''
          ? Math.min(45, Math.max(30, Number(e.temperatureCelsius)))
          : null,
      planning: e.planning || null,
      notes: e.notes || null
    }));

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
      previousVaccineHistory: immunizationFormData.previousVaccineHistory || undefined,
      childAllergyHistory: immunizationFormData.childAllergyHistory || undefined,
      entries: finalEntries
    };

    const patientId = parsedData.patient?.id || appointment.patient_id;
    if (patientId) {
      const initialChild = buildInitialImmunizationData(parsedData);
      const diffPayload = getImmunizationPatientDiff(immunizationFormData, initialChild);
      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateImmunizationIntake(targetId, payload);
    await invalidateCommonQueries(patientId);
    if (appointment?.id) {
      appointmentDraftService.clearInspectorDraft(appointment.id);
    }
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
      (serverIntake as any)?.data?.id ?? (serverIntake as any)?.id;

    if (!targetId) {
      toast.error('Gagal menyimpan: ID formulir intake tidak ditemukan.');
      return;
    }

    const answersPayload = {
      ...regularFormData.answers,
      complaint: regularFormData.complaint,
      keluhanUtama: regularFormData.complaint
    };

    const patientId = parsedData.patient?.id || appointment.patient_id;
    if (patientId) {
      const initialRegular = buildInitialRegularData(parsedData, appointment);
      const diffPayload = getRegularPatientDiff(regularFormData, initialRegular);
      if (Object.keys(diffPayload).length > 0) {
        await updatePatient(patientId, diffPayload);
      }
    }

    await kiaIntakeService.updateGenericIntake(targetId, answersPayload);
    if (regularFormData.complaint) {
      appointment.complaint = regularFormData.complaint;
    }
    await invalidateCommonQueries(patientId);
    if (appointment?.id) {
      appointmentDraftService.clearInspectorDraft(appointment.id);
    }
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
