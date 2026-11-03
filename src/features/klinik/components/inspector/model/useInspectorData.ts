import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { klinikKeys } from '../../../api/query-keys';
import { FLOW_NAMES } from '../../../constants/medical-appointment-types';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../../../api/kia-intake-service';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import type { Appointment } from '../../../api/types';
import type {
  UnifiedInspectorData,
  UnifiedInspectorPatient
} from '../types';

export function useInspectorData(appointment: Appointment) {
  const { data: serverIntake, isLoading } = useQuery({
    queryKey: klinikKeys.appointmentIntake(appointment.id),
    queryFn: () => kiaIntakeService.getIntakeByAppointmentId(appointment.id),
    enabled: Boolean(appointment.id),
    staleTime: 60_000,
    retry: false
  });

  const { data: affiliations } = useQuery({
    queryKey: ['patient-affiliations', 'me'],
    queryFn: () => patientAffiliationService.getMyAffiliations(),
    staleTime: 60_000
  });

  const matchingAffiliation = React.useMemo(() => {
    if (!affiliations?.length) return null;
    return affiliations.find((a) => a.id === appointment.patient_id) || null;
  }, [affiliations, appointment.patient_id]);

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData =
      serverIntake &&
      typeof serverIntake === 'object' &&
      'data' in serverIntake &&
      serverIntake.data
        ? typeof serverIntake.data === 'object' && 'data' in serverIntake.data
          ? (serverIntake.data as any).data
          : serverIntake.data
        : serverIntake;

    const flow = serverIntake?.flow ?? appointment.medical_flow ?? null;

    let answers: Record<string, any> = {};
    let automatic: Record<string, any> = {};
    let maternal: MaternalIntakeResponse | undefined = undefined;
    let child: ChildImmunizationResponse | undefined = undefined;

    if (rawData) {
      if (flow === FLOW_NAMES.PREGNANCY) {
        maternal = rawData as MaternalIntakeResponse;
        answers = (maternal.answers as Record<string, any>) || {};
        automatic = (maternal.automatic as Record<string, any>) || {};
      } else if (flow === FLOW_NAMES.IMMUNIZATION) {
        child = rawData as ChildImmunizationResponse;
        answers = (child.answers as Record<string, any>) || {};
        automatic = (child.automatic as Record<string, any>) || {};
      } else {
        answers = (rawData.answers as Record<string, any>) || {};
        automatic = (rawData.automatic as Record<string, any>) || {};
      }
    }

    if (appointment.medical_intake) {
      if (Object.keys(answers).length === 0 && appointment.medical_intake.answersByFieldId) {
        answers = { ...appointment.medical_intake.answersByFieldId };
      }
      if (Object.keys(automatic).length === 0 && appointment.medical_intake.automatic) {
        automatic = { ...appointment.medical_intake.automatic };
      }
    }

    const patient: UnifiedInspectorPatient | undefined =
      rawData?.patient ||
      (matchingAffiliation
        ? {
            id: matchingAffiliation.id,
            nik: matchingAffiliation.nik || undefined,
            fullName: matchingAffiliation.fullName,
            motherName: matchingAffiliation.motherName || undefined,
            birthPlace: matchingAffiliation.birthPlace || undefined,
            birthDate: matchingAffiliation.birthDate || undefined,
            gender: matchingAffiliation.gender,
            bloodType: matchingAffiliation.bloodType || undefined,
            occupation: matchingAffiliation.occupationName || undefined,
            phone: matchingAffiliation.phoneNumber || undefined,
            address: matchingAffiliation.address || undefined,
            line1: matchingAffiliation.line1 || undefined,
            provinceName: matchingAffiliation.provinceName || undefined,
            provinceCode: matchingAffiliation.provinceCode || undefined,
            regencyName: matchingAffiliation.regencyName || undefined,
            regencyCode: matchingAffiliation.regencyCode || undefined,
            districtName: matchingAffiliation.districtName || undefined,
            districtCode: matchingAffiliation.districtCode || undefined,
            villageName: matchingAffiliation.villageName || undefined,
            villageCode: matchingAffiliation.villageCode || undefined,
            relationshipType: matchingAffiliation.relationship,
            relationLabel: matchingAffiliation.relationshipLabel,
            emergencyContactName: matchingAffiliation.emergencyContactName || undefined,
            emergencyContactPhone: matchingAffiliation.emergencyContactPhone || undefined,
            emergencyContactRelationship:
              matchingAffiliation.emergencyContactRelationship || undefined
          }
        : appointment.patient_name
          ? {
              fullName: appointment.patient_name,
              phone: appointment.patient_phone
            }
          : undefined);

    return {
      flow,
      answers,
      automatic,
      maternal,
      child,
      patient,
      appointmentId: appointment.id,
      bookingCode: appointment.booking_code,
      scheduledDate: appointment.date,
      scheduledStartTime: appointment.scheduled_start_time || '-',
      complaint: appointment.complaint || '-',
      serviceName: appointment.service || '-'
    };
  }, [serverIntake, appointment, matchingAffiliation]);

  const isPregnancy = parsedData.flow === FLOW_NAMES.PREGNANCY;
  const isImmunization = parsedData.flow === FLOW_NAMES.IMMUNIZATION || Boolean(parsedData.child);

  return {
    serverIntake,
    isLoading,
    parsedData,
    isPregnancy,
    isImmunization
  };
}
