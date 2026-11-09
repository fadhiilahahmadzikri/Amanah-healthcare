import type * as React from 'react';
import { toast } from 'sonner';
import { kiaIntakeService } from '../../../api/kia-intake-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import type { Appointment } from '../../../api/types';
import type { UnifiedInspectorData, EditableRegularData } from '../types';
import { validateRegularForm } from '../../../validations/inspector-form.schema';
import { buildInitialRegularData } from './inspector-initial-state';
import { getRegularPatientDiff } from './patient-diff-helper';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { toNullableString } from './inspector-save-utils';

export interface SaveRegularParams {
  regularFormData: EditableRegularData;
  serverIntake: any;
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export async function saveRegularAction({
  regularFormData,
  serverIntake,
  parsedData,
  appointment,
  setValidationErrors
}: SaveRegularParams): Promise<void> {
  const validation = validateRegularForm(regularFormData);
  if (!validation.isValid) {
    setValidationErrors(validation.errors);
    toast.error('Periksa kembali isian formulir pasien yang ditandai merah.');
    throw new Error('Validasi formulir pasien gagal');
  }
  setValidationErrors({});

  const targetId = (serverIntake as any)?.data?.id ?? (serverIntake as any)?.id;

  const newNik = regularFormData.nik?.trim();
  const originalNik = parsedData.patient?.nik?.trim();
  if (newNik && newNik !== originalNik && newNik.length === 16) {
    const check = await patientAffiliationService.verifyNikAvailability(newNik);
    if (!check.available) {
      setValidationErrors({ nik: 'NIK ini sudah terdaftar pada pasien lain' });
      toast.error('NIK ini sudah terdaftar pada pasien lain');
      throw new Error('NIK ini sudah terdaftar pada pasien lain');
    }
  }

  const complaintPayload = {
    complaint: toNullableString(regularFormData.complaint)
  };

  const patientId = parsedData.patient?.id || appointment.patient_id;
  if (patientId) {
    const initialRegular = buildInitialRegularData(parsedData, appointment);
    const diffPayload = getRegularPatientDiff(regularFormData, initialRegular);
    if (Object.keys(diffPayload).length > 0) {
      await updatePatient(patientId, diffPayload);
    }
  }

  if (targetId && (serverIntake as any)?.type === 'regular') {
    await kiaIntakeService.updateGenericIntake(targetId, complaintPayload);
  }
  appointment.complaint = regularFormData.complaint.trim() || '';
}
