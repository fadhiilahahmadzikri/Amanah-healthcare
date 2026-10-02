'use client';

import * as React from 'react';
import { toast } from 'sonner';
import type { Patient } from '@/features/data-pasien/api/types';
import type { Appointment, AppointmentFormData, QueueItem } from '../api/types';
import { createAppointmentRecordWithQueue, loadStoredAppointments } from '../api/service';
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
import { FLOW_NAMES } from '../constants/kia-constants';
import type { ReservationContext } from '../components/reservation/reservation-modal';

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
      const patientEmail =
        registeredPatient?.email_pasien || registeredPatient?.email || patientContact || undefined;
      const patientId =
        registeredPatient?.patient_id ||
        (registeredPatient?.id ? String(registeredPatient.id) : '');

      if (onCompleteIntake) {
        if (!selectedService?.id || !selectedService?.poliklinikId) {
          toast.error('Layanan klinik belum dipilih atau tidak valid.');
          return;
        }

        setIsProcessing(true);
        void (async () => {
          try {
            let resolvedPatientId = selectedPatient?.id || '';
            let resolvedPatientName = selectedPatient?.fullName || patientName || '';

            if (!resolvedPatientId) {
              const targetName = (
                submittedValues.motherName ||
                submittedValues.patientName ||
                patientName ||
                ''
              ).trim();
              const targetNik = (submittedValues.motherNik || submittedValues.nik || '').trim();
              const targetBirthDate =
                submittedValues.motherBirthDate || submittedValues.birthDate || '';
              const targetBirthPlace =
                submittedValues.motherBirthPlace || submittedValues.birthPlace || 'Jakarta';
              const targetBloodType = submittedValues.motherBloodType || 'Belum Tahu';
              const targetPhone = submittedValues.phoneNumber || patientContact || '';
              const targetAddress =
                submittedValues.domicileAddress || submittedValues.residenceAddress || '';

              if (!targetName || !targetNik) {
                toast.error('Nama dan NIK pasien wajib diisi.');
                setIsProcessing(false);
                return;
              }

              const newAffiliation = await patientAffiliationService.createAffiliation({
                name: targetName,
                nik: targetNik,
                birth_date: targetBirthDate,
                tempat_lahir: targetBirthPlace,
                gender: 'Perempuan',
                blood_type: targetBloodType as any,
                nama_ibu_kandung: submittedValues.ibuKandung || targetName,
                relationship_type: (newPatientRelationship as any) || 'relative',
                phone: targetPhone,
                alamat_detail: targetAddress
              });

              if (!newAffiliation?.id) {
                throw new Error('Gagal mendapatkan ID rekam medis pasien.');
              }

              resolvedPatientId = newAffiliation.id;
              resolvedPatientName = newAffiliation.fullName;
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
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            } else if (definition.flow === FLOW_NAMES.IMMUNIZATION) {
              const immunizationPayload = buildChildImmunizationIntakePayload(
                resolvedPatientId,
                submittedValues,
                resolvedPatientName,
                patientContact
              );
              const intakeRes =
                await kiaIntakeService.createImmunizationIntake(immunizationPayload);
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            }

            const reservationCtx: ReservationContext = {
              patientId: resolvedPatientId,
              patientName: resolvedPatientName || 'Pasien',
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              poliklinikId: selectedService.poliklinikId,
              complaint: complaint || 'Pemeriksaan Persalinan',
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

      if (patientId) {
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
