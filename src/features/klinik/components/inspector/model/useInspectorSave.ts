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
import { changeAppointmentService } from '@/features/appointment-pasien/api/service';
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
    const intakeKey = klinikKeys.appointmentIntake(appointment.id);
    await queryClient.invalidateQueries({ queryKey: intakeKey });
    await queryClient.invalidateQueries({
      queryKey: ['patient-detail', appointment.patient_id]
    });
    if (patientId && patientId !== appointment.patient_id) {
      await queryClient.invalidateQueries({
        queryKey: ['patient-detail', patientId]
      });
    }
    await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    await queryClient.invalidateQueries({ queryKey: ['patients'] });
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    await queryClient.invalidateQueries({ queryKey: ['appointment', appointment.id] });
    await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    await queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });

    await Promise.all([
      queryClient.refetchQueries({ queryKey: intakeKey }),
      appointment.patient_id
        ? queryClient.refetchQueries({
            queryKey: ['patient-detail', appointment.patient_id]
          })
        : Promise.resolve()
    ]);
  }, [queryClient, appointment.id, appointment.patient_id, patientId]);

  const handleSaveEdit = React.useCallback(
    async (isDirty?: boolean) => {
      if (isDirty === false) {
        toast.info('Tidak ada perubahan data formulir yang disimpan.');
        setIsEditing(false);
        return;
      }
      try {
        setIsSaving(true);

        const serviceChanged = Boolean(
          regularFormData.serviceId &&
          regularFormData.serviceId !== appointment.layanan_id
        );
        const complaintChanged =
          regularFormData.complaint !== undefined &&
          regularFormData.complaint.trim() !== (appointment.complaint || '').trim();

        if (serviceChanged || complaintChanged) {
          const targetServiceId = regularFormData.serviceId || appointment.layanan_id;
          if (targetServiceId) {
            const res = await changeAppointmentService(
              appointment.id,
              targetServiceId,
              { complaint: regularFormData.complaint.trim() }
            );
            if (!res.success) {
              throw new Error(res.message || 'Gagal memperbarui layanan janji temu');
            }
            appointment.complaint = regularFormData.complaint.trim();
            if (serviceChanged) {
              appointment.layanan_id = regularFormData.serviceId;
              if (regularFormData.serviceName) {
                appointment.service = regularFormData.serviceName;
              }
              if (regularFormData.unitId) {
                appointment.poliklinik_id = regularFormData.unitId;
              }
              if (regularFormData.unitName) {
                appointment.poliklinik_name = regularFormData.unitName;
              }
              if (regularFormData.categoryId) {
                appointment.category_id = regularFormData.categoryId;
              }
              if (regularFormData.categoryName) {
                appointment.category_name = regularFormData.categoryName;
              }
              if (res.appointment?.queueNumber) {
                appointment.queue_number = res.appointment.queueNumber;
              }
              if (res.appointment?.medicalFlow !== undefined) {
                appointment.medical_flow = res.appointment.medicalFlow || undefined;
                parsedData.flow = res.appointment.medicalFlow || null;
              }
            }
          }
        }

        if (!isPregnancy) {
          parsedData.maternal = undefined;
        }
        if (!isImmunization) {
          parsedData.child = undefined;
        }

        if (isPregnancy) {
          await saveMaternalAction({
            formData,
            regularFormData,
            parsedData,
            appointment,
            setValidationErrors
          });
          toast.success('Perubahan formulir KIA & Kehamilan berhasil disimpan!');
        } else if (isImmunization) {
          await saveImmunizationAction({
            immunizationFormData,
            regularFormData,
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
