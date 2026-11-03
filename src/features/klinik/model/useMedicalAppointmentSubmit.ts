'use client';

import * as React from 'react';
import { toast } from 'sonner';
import type { Patient } from '@/features/data-pasien/api/types';
import type { Appointment, AppointmentFormData, QueueItem } from '../api/types';
import {
  patientAffiliationService,
  type PatientAffiliationProfile,
  type PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import { kiaIntakeService } from '../api/kia-intake-service';
import type { ServiceCatalogItem } from '../api/catalog.service';
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
import { FLOW_NAMES } from '../constants/medical-appointment-types';
import type { ReservationContext } from '../components/reservation/reservation-modal';
import { requestImplicitWebPushRegistration } from '@/features/notifications';

interface UseMedicalAppointmentSubmitParams {
  definition: MedicalFlowDefinition;
  schedule?: ScheduleValues;
  registeredPatient: Patient | null;
  repeatableMedicalSections: MedicalFormSection[];
  selectedService?: ServiceCatalogItem | null;
  selectedPatient?: PatientAffiliationProfile | null;
  newPatientRelationship?: PatientRelationshipType | string;
  onCreated?: (formData: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
}

export function useMedicalAppointmentSubmit({
  definition,
  schedule,
  registeredPatient,
  repeatableMedicalSections,
  selectedService,
  selectedPatient,
  newPatientRelationship,
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
      const patientEmail = registeredPatient?.email || undefined;
      const patientId = registeredPatient?.id ? String(registeredPatient.id) : '';

      if (onCompleteIntake) {
        if (!selectedService?.id || !selectedService?.poliklinikId) {
          toast.error('Layanan klinik belum dipilih atau tidak valid.');
          return;
        }

        setIsProcessing(true);
        void (async () => {
          try {
            let resolvedPatientId = selectedPatient ? selectedPatient.id : '';
            let resolvedPatientName = selectedPatient
              ? selectedPatient.fullName
              : patientName || '';

            if (!resolvedPatientId) {
              toast.error('Profil pasien wajib dipilih sebelum melengkapi formulir klinis.');
              setIsProcessing(false);
              return;
            }

            let sourceIntakeId: string | undefined = undefined;
            if (definition.flow === FLOW_NAMES.PREGNANCY) {
              const maternityPayload = buildMaternityIntakePayload(
                resolvedPatientId,
                submittedValues,
                resolvedPatientName,
                complaint
              );
              const intakeRes = await kiaIntakeService.createMaternityIntake(maternityPayload);
              sourceIntakeId = intakeRes?.id;
            } else if (definition.flow === FLOW_NAMES.IMMUNIZATION) {
              const immunizationPayload = buildChildImmunizationIntakePayload(
                resolvedPatientId,
                submittedValues,
                resolvedPatientName,
                patientContact
              );
              const intakeRes =
                await kiaIntakeService.createImmunizationIntake(immunizationPayload);
              sourceIntakeId = intakeRes?.id;
            }

            const reservationCtx: ReservationContext = {
              patientId: resolvedPatientId,
              patientName: resolvedPatientName,
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              poliklinikId: selectedService.poliklinikId,
              complaint: complaint.trim(),
              sourceIntakeId,
              medicalFlow: definition.flow
            };

            onCompleteIntake(reservationCtx);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memproses data pasien';
            toast.error(message);
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
        session: schedule?.session || '',
        complaint: complaint.trim(),
        patientName: patientName || '',
        patientEmail,
        patientAvatar: registeredPatient?.avatarUrl,
        medicalFlow: definition.flow,
        medicalIntake: intake
      };

      setIsProcessing(true);
      void (async () => {
        try {
          if (!selectedService?.id || !selectedService?.poliklinikId) {
            toast.error('Layanan klinik belum dipilih.');
            return;
          }
          const res = await patientAffiliationService.createAppointment({
            patientId: selectedPatient ? selectedPatient.id : patientId,
            poliklinikId: selectedService.poliklinikId,
            layananId: selectedService.id,
            appointmentDate: schedule?.dateStr || '',
            session: schedule?.session || '',
            visitType: definition.visitType,
            complaint: complaint || 'Pemeriksaan klinik'
          });

          void requestImplicitWebPushRegistration();

          const uiApt: Appointment = {
            id: res.id,
            booking_code: res.bookingCode ?? '',
            patient_name: res.patientName || '',
            patient_email: patientEmail || '',
            patient_avatar: registeredPatient?.avatarUrl || '',
            doctor_name: res.doctorName || '',
            date: res.appointmentDate,
            time: res.session,
            session: res.session,
            complaint: res.complaint || '',
            status: 'BOOKED',
            visit_type: (res.visitType || definition.visitType) as Appointment['visit_type'],
            service: res.layananName || definition.serviceName,
            created_at: res.createdAt
          };

          const uiQueue: QueueItem = {
            id: res.id,
            queue_number: res.queueNumber || '-',
            patient_name: uiApt.patient_name,
            patient_avatar: '',
            doctor_name: uiApt.doctor_name || '',
            poli: uiApt.service || 'Poli',
            estimated_time: uiApt.time || '-',
            status: 'WAITING',
            is_user: true,
            room: res.roomName || ''
          };

          setCreatedAppointment(uiApt);
          setCreatedQueueItem(uiQueue);
          setIsQueueSuccessOpen(true);
          onCreated?.(payload);

          if (patientId) {
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
              // Non-blocking intake creation error
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal memproses janji temu';
          toast.error(msg);
        } finally {
          setIsProcessing(false);
        }
      })();
    },
    [
      definition,
      schedule,
      registeredPatient,
      repeatableMedicalSections,
      selectedService,
      selectedPatient,
      newPatientRelationship,
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
