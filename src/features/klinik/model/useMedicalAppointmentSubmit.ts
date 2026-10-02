'use client';

import * as React from 'react';
import type { Patient } from '@/features/data-pasien/api/types';
import type { Appointment, AppointmentFormData, QueueItem } from '../api/types';
import { createAppointmentRecordWithQueue, loadStoredAppointments } from '../api/service';
import { kiaIntakeService } from '../api/kia-intake-service';
import type {
  MedicalFlowDefinition,
  MedicalFormSection
} from '../constants/medical-appointment-schemas';
import {
  buildMedicalIntakeRecord,
  type MedicalAppointmentValues
} from '../utils/medical-appointment';
import type { ScheduleValues } from './medical-form-history-types';
import { buildComplaintText, pickMedicalValues } from '../utils/medical-form-helpers';
import {
  buildChildImmunizationIntakePayload,
  buildMaternityIntakePayload
} from '../utils/kia-intake-payload-builder';
import { FLOW_NAMES } from '../constants/kia-constants';

import type { ReservationContext } from '../components/reservation/reservation-modal';

interface UseMedicalAppointmentSubmitParams {
  definition: MedicalFlowDefinition;
  schedule?: ScheduleValues;
  registeredPatient: Patient | null;
  repeatableMedicalSections: MedicalFormSection[];
  onCreated?: (formData: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
}

export function useMedicalAppointmentSubmit({
  definition,
  schedule,
  registeredPatient,
  repeatableMedicalSections,
  onCreated,
  onCompleteIntake
}: UseMedicalAppointmentSubmitParams) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = React.useState(false);
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null);
  const [createdQueueItem, setCreatedQueueItem] = React.useState<QueueItem | null>(null);

  const submitMedicalAppointment = React.useCallback(
    (formValues: MedicalAppointmentValues) => {
      const submittedValues = pickMedicalValues(repeatableMedicalSections, formValues);
      const intake = buildMedicalIntakeRecord({
        definition,
        values: submittedValues
      });
      const complaint = buildComplaintText(definition.complaintFieldId, submittedValues);
      const patientName = submittedValues[definition.patientNameFieldId] || undefined;
      const patientContact = submittedValues[definition.patientContactFieldId] || undefined;
      const patientEmail =
        registeredPatient?.email_pasien || registeredPatient?.email || patientContact || undefined;
      const patientId =
        registeredPatient?.patient_id ||
        (registeredPatient?.id ? String(registeredPatient.id) : 'pat_guest');

      if (onCompleteIntake) {
        setIsProcessing(true);
        void (async () => {
          try {
            let sourceIntakeId: string | undefined = undefined;
            if (definition.flow === FLOW_NAMES.PREGNANCY) {
              const maternityPayload = buildMaternityIntakePayload(
                patientId,
                submittedValues,
                patientName,
                complaint
              );
              const intakeRes = await kiaIntakeService.createMaternityIntake(maternityPayload);
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            } else if (definition.flow === FLOW_NAMES.IMMUNIZATION) {
              const immunizationPayload = buildChildImmunizationIntakePayload(
                patientId,
                submittedValues,
                patientName,
                patientContact
              );
              const intakeRes =
                await kiaIntakeService.createImmunizationIntake(immunizationPayload);
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            }

            const reservationCtx: ReservationContext = {
              patientId,
              patientName: patientName || registeredPatient?.name || 'Pasien',
              serviceId: 'midwifery-childbirth',
              serviceName: definition.serviceName,
              poliklinikId: 'b18b4e7c-b6fa-4993-8025-a13437e2311f',
              complaint: complaint || 'Pemeriksaan Persalinan',
              sourceIntakeId,
              medicalFlow: definition.flow
            };

            onCompleteIntake(reservationCtx);
          } catch (err) {
            console.error('Failed to persist intake:', err);
            const fallbackCtx: ReservationContext = {
              patientId,
              patientName: patientName || 'Pasien',
              serviceId: 'midwifery-childbirth',
              serviceName: definition.serviceName,
              poliklinikId: 'b18b4e7c-b6fa-4993-8025-a13437e2311f',
              complaint: complaint || 'Pemeriksaan Persalinan',
              medicalFlow: definition.flow
            };
            onCompleteIntake(fallbackCtx);
          } finally {
            setIsProcessing(false);
          }
        })();
        return;
      }

      const payload: AppointmentFormData = {
        visitType: definition.visitType,
        service: definition.serviceName,
        doctor: schedule?.doctor || '',
        dateStr: schedule?.dateStr || '',
        timeSlot: schedule?.timeSlot || '',
        complaint,
        patientName,
        patientEmail,
        patientAvatar: registeredPatient?.avatar,
        medicalFlow: definition.flow,
        medicalIntake: intake
      };

      setIsProcessing(true);
      setIsQueueSuccessOpen(true);

      const existing = loadStoredAppointments();
      const result = createAppointmentRecordWithQueue(payload, existing);

      setCreatedAppointment(result.appointment);
      setCreatedQueueItem(result.queueItem);
      onCreated?.(payload);

      if (registeredPatient?.id) {
        void (async () => {
          try {
            if (definition.flow === FLOW_NAMES.PREGNANCY) {
              const maternityPayload = buildMaternityIntakePayload(
                patientId,
                submittedValues,
                patientName,
                complaint
              );
              await kiaIntakeService.createMaternityIntake(maternityPayload);
            } else if (definition.flow === FLOW_NAMES.IMMUNIZATION) {
              const immunizationPayload = buildChildImmunizationIntakePayload(
                patientId,
                submittedValues,
                patientName,
                patientContact
              );
              await kiaIntakeService.createImmunizationIntake(immunizationPayload);
            }
          } catch {
            return;
          }
        })();
      }

      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    },
    [
      definition,
      schedule,
      registeredPatient,
      repeatableMedicalSections,
      onCreated,
      onCompleteIntake
    ]
  );

  return {
    isProcessing,
    isQueueSuccessOpen,
    setIsQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    submitMedicalAppointment
  };
}
