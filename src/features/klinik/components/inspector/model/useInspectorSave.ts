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
  validateRegularForm,
  getMaternityTabWithErrors,
  MATERNITY_TAB_LABELS
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

function parseSafeClampedNumber(
  val: unknown,
  min: number,
  max: number
): number | null {
  if (val === undefined || val === null || val === '') return null;
  const normalized = typeof val === 'string' ? val.trim().replace(',', '.') : val;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

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
      const firstTab = getMaternityTabWithErrors(validation.errors);
      const firstKey = Object.keys(validation.errors)[0];
      const firstMsg = validation.errors[firstKey];
      const tabLabel = firstTab ? MATERNITY_TAB_LABELS[firstTab] || firstTab : 'Formulir KIA';
      toast.error(`${tabLabel}: ${firstMsg}`);
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
      motherAge: formData.motherAge !== '' && formData.motherAge !== undefined && formData.motherAge !== null ? Number(formData.motherAge) : undefined,
      marriageOrder: formData.marriageOrder !== '' && formData.marriageOrder !== undefined && formData.marriageOrder !== null ? Number(formData.marriageOrder) : undefined,
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

      partnerName: formData.partnerName !== undefined ? (formData.partnerName || null) : undefined,
      partnerNik: formData.partnerNik !== undefined ? (formData.partnerNik.trim() || null) : undefined,
      partnerBirthDate: formData.partnerBirthDate !== undefined ? (formData.partnerBirthDate || null) : undefined,
      partnerAge: formData.partnerAge ? Number(formData.partnerAge) : null,
      partnerJob: formData.partnerJob !== undefined ? (formData.partnerJob || null) : undefined,
      partnerEducation: formData.partnerEducation !== undefined ? (formData.partnerEducation || null) : undefined,
      partnerBloodType: formData.partnerBloodType !== undefined ? (formData.partnerBloodType || null) : undefined,
      husband: {
        fullName: formData.partnerName || '',
        nik: formData.partnerNik !== undefined ? (formData.partnerNik.trim() || null) : undefined,
        birthDate: formData.partnerBirthDate !== undefined ? (formData.partnerBirthDate || null) : undefined,
        age: formData.partnerAge ? Number(formData.partnerAge) : null,
        job: formData.partnerJob !== undefined ? (formData.partnerJob || null) : undefined,
        education: formData.partnerEducation !== undefined ? (formData.partnerEducation || null) : undefined,
        bloodType: formData.partnerBloodType !== undefined ? (formData.partnerBloodType || null) : undefined,
        phoneNumber: formData.partnerPhone !== undefined ? (formData.partnerPhone.trim() || null) : undefined
      },

      heightCm: parseSafeClampedNumber(formData.heightCm, 0, 300) ?? undefined,
      prePregnancyWeightKg: parseSafeClampedNumber(formData.prePregnancyWeightKg, 0, 500) ?? undefined,
      upperArmCircumferenceCm: parseSafeClampedNumber(formData.upperArmCircumferenceCm, 0, 150) ?? undefined,
      initialBmi: parseSafeClampedNumber(formData.initialBmi, 0, 150) ?? undefined,
      tetanusStatus: formData.tetanusStatus || undefined,
      motherBloodType: formData.motherBloodType || undefined,

      hpht: formData.hpht || undefined,
      estimatedDueDate: formData.estimatedDueDate || undefined,
      gestationalAgeWeeks: formData.gestationalAgeWeeks
        ? Math.min(60, Math.max(0, Number(formData.gestationalAgeWeeks)))
        : undefined,
      gestationalAgeFormatted: formData.gestationalAgeFormatted || undefined,
      currentComplaints: formData.currentComplaints || undefined,

      gravidaCount: formData.gravidaCount !== '' && formData.gravidaCount !== undefined && formData.gravidaCount !== null ? Number(formData.gravidaCount) : undefined,
      parityCount: formData.parityCount !== '' && formData.parityCount !== undefined && formData.parityCount !== null ? Number(formData.parityCount) : undefined,
      abortionCount: formData.abortionCount !== '' && formData.abortionCount !== undefined && formData.abortionCount !== null ? Number(formData.abortionCount) : undefined,
      livingChildrenCount: formData.livingChildrenCount !== '' && formData.livingChildrenCount !== undefined && formData.livingChildrenCount !== null ? Number(formData.livingChildrenCount) : undefined,
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
      weightKg: parseSafeClampedNumber(e.weightKg, 0.5, 150),
      heightCm: parseSafeClampedNumber(e.heightCm, 20, 250),
      headCircumferenceCm: parseSafeClampedNumber(e.headCircumferenceCm, 10, 100),
      temperatureCelsius: parseSafeClampedNumber(e.temperatureCelsius, 30, 45),
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
