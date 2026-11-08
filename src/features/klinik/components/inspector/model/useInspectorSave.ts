import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { klinikKeys } from '../../../api/query-keys';
import type { Appointment } from '../../../api/types';
import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';
import { appointmentDraftService } from '../../../services/appointment-draft.service';
import { saveMaternalAction } from './save-maternal-action';
import { saveImmunizationAction } from './save-immunization-action';
import { saveRegularAction } from './save-regular-action';
import { formatInspectorErrorMessage } from './inspector-error-formatter';

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

  const patientId = parsedData.patient?.id || appointment.patient_id;

  const invalidateCommonQueries = React.useCallback(async () => {
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
  }, [queryClient, appointment.id, patientId]);

  const handleSaveEdit = React.useCallback(
    async (isDirty?: boolean) => {
      if (isDirty === false) {
        toast.info('Tidak ada perubahan data formulir yang disimpan.');
        setIsEditing(false);
        return;
      }
      try {
        setIsSaving(true);
        if (isPregnancy) {
          await saveMaternalAction({
            formData,
            parsedData,
            appointment,
            setValidationErrors
          });
          toast.success('Perubahan formulir KIA & Kehamilan berhasil disimpan!');
        } else if (isImmunization) {
          await saveImmunizationAction({
            immunizationFormData,
            parsedData,
            appointment,
            setValidationErrors
          });
          toast.success('Perubahan formulir imunisasi anak berhasil disimpan!');
        } else {
          await saveRegularAction({
            regularFormData,
            serverIntake,
            parsedData,
            appointment,
            setValidationErrors
          });
          toast.success('Perubahan formulir intake pasien berhasil disimpan!');
        }

        await invalidateCommonQueries();
        if (appointment?.id) {
          appointmentDraftService.clearInspectorDraft(appointment.id);
        }
        setIsEditing(false);
      } catch (err: any) {
        const { userFriendlyMessage, fieldErrors } = formatInspectorErrorMessage(err);
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        toast.error(userFriendlyMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [
      isPregnancy,
      isImmunization,
      formData,
      immunizationFormData,
      regularFormData,
      serverIntake,
      parsedData,
      appointment,
      invalidateCommonQueries,
      setIsEditing,
      setValidationErrors
    ]
  );

  return {
    isSaving,
    handleSaveEdit
  };
}
