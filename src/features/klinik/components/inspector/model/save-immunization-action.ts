import type * as React from 'react';
import { toast } from 'sonner';
import { kiaIntakeService } from '../../../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import type { Appointment } from '../../../api/types';
import type { UnifiedInspectorData, EditableImmunizationData } from '../types';
import { validateImmunizationForm } from '../../../validations/inspector-form.schema';
import { buildInitialImmunizationData } from './inspector-initial-state';
import { getImmunizationPatientDiff } from './patient-diff-helper';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { toNullableString } from './inspector-save-utils';

export interface SaveImmunizationParams {
  immunizationFormData: EditableImmunizationData;
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export async function saveImmunizationAction({
  immunizationFormData,
  parsedData,
  appointment,
  setValidationErrors
}: SaveImmunizationParams): Promise<void> {
  const validation = validateImmunizationForm(immunizationFormData);
  if (!validation.isValid) {
    setValidationErrors(validation.errors);
    toast.error('Periksa kembali isian formulir imunisasi yang ditandai merah.');
    throw new Error('Validasi formulir imunisasi gagal');
  }
  setValidationErrors({});

  const targetId = parsedData.child?.id;
  if (!targetId) {
    toast.error('Gagal menyimpan: ID formulir imunisasi tidak ditemukan.');
    throw new Error('ID formulir imunisasi tidak ditemukan');
  }

  const newChildNik = immunizationFormData.childNik?.trim();
  const originalChildNik = (parsedData.child?.childNik || parsedData.patient?.nik)?.trim();
  if (newChildNik && newChildNik !== originalChildNik && newChildNik.length === 16) {
    const check = await patientAffiliationService.verifyNikAvailability(newChildNik);
    if (!check.available) {
      setValidationErrors({ childNik: 'NIK ini sudah terdaftar pada pasien lain' });
      toast.error('NIK Anak sudah terdaftar pada pasien lain');
      throw new Error('NIK Anak sudah terdaftar pada pasien lain');
    }
  }

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
    weightKg: e.weightKg ? Number(e.weightKg) : null,
    heightCm: e.heightCm ? Number(e.heightCm) : null,
    headCircumferenceCm: e.headCircumferenceCm ? Number(e.headCircumferenceCm) : null,
    temperatureCelsius: e.temperatureCelsius ? Number(e.temperatureCelsius) : null,
    planning: e.planning || null,
    notes: e.notes || null
  }));

  const payload = {
    childName: immunizationFormData.childName?.trim() || '',
    childNik: immunizationFormData.childNik?.trim() || '',
    childBirthDate: immunizationFormData.childBirthDate || '',
    childSex: immunizationFormData.childSex || '',
    childAgeFormatted: toNullableString(immunizationFormData.childAgeFormatted),
    parentPhone: immunizationFormData.parentPhone?.trim() || '',
    fatherName: toNullableString(immunizationFormData.fatherName),
    motherName: toNullableString(immunizationFormData.motherName),
    childAddress: toNullableString(immunizationFormData.childAddress),
    line1: toNullableString(immunizationFormData.line1),
    provinceCode: toNullableString(immunizationFormData.provinceCode),
    provinceName: toNullableString(immunizationFormData.provinceName),
    regencyCode: toNullableString(immunizationFormData.regencyCode),
    regencyName: toNullableString(immunizationFormData.regencyName),
    districtCode: toNullableString(immunizationFormData.districtCode),
    districtName: toNullableString(immunizationFormData.districtName),
    villageCode: toNullableString(immunizationFormData.villageCode),
    villageName: toNullableString(immunizationFormData.villageName),
    previousVaccineHistory: toNullableString(immunizationFormData.previousVaccineHistory),
    childAllergyHistory: toNullableString(immunizationFormData.childAllergyHistory),
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
}
