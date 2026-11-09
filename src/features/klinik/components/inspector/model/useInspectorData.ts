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
import { getPatientById } from '@/features/data-pasien/api/service';
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

  const { data: patientDetailResponse } = useQuery({
    queryKey: ['patient-detail', appointment.patient_id],
    queryFn: () => getPatientById(appointment.patient_id!),
    enabled: Boolean(appointment.patient_id),
    staleTime: 60_000
  });
  const patientRecord = patientDetailResponse?.patient;

  const matchingAffiliation = React.useMemo(() => {
    if (!affiliations?.length) return null;
    return affiliations.find((a) => a.id === appointment.patient_id) || null;
  }, [affiliations, appointment.patient_id]);

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData =
      serverIntake && typeof serverIntake === 'object' && 'data' in serverIntake
        ? (serverIntake as any).data
        : serverIntake;

    const flow = serverIntake?.flow ?? appointment.medical_flow ?? null;

    let maternal: MaternalIntakeResponse | undefined = undefined;
    let child: ChildImmunizationResponse | undefined = undefined;

    if (rawData) {
      if (flow === FLOW_NAMES.PREGNANCY) {
        maternal = rawData as MaternalIntakeResponse;
      } else if (flow === FLOW_NAMES.IMMUNIZATION) {
        child = rawData as ChildImmunizationResponse;
      }
    }

    const rawPatient = rawData?.patient;
    const patient: UnifiedInspectorPatient | undefined =
      rawPatient
        ? {
            ...rawPatient,
            line1: rawPatient.line1 || patientRecord?.line1 || undefined,
            provinceName: rawPatient.provinceName || patientRecord?.province_name || undefined,
            provinceCode: rawPatient.provinceCode || patientRecord?.province_code || undefined,
            regencyName: rawPatient.regencyName || patientRecord?.regency_name || undefined,
            regencyCode: rawPatient.regencyCode || patientRecord?.regency_code || undefined,
            districtName: rawPatient.districtName || patientRecord?.district_name || undefined,
            districtCode: rawPatient.districtCode || patientRecord?.district_code || undefined,
            villageName: rawPatient.villageName || patientRecord?.village_name || undefined,
            villageCode: rawPatient.villageCode || patientRecord?.village_code || undefined,
            relationshipType:
              rawPatient.relationshipType || patientRecord?.relationship_type || undefined,
            relationLabel:
              rawPatient.relationLabel || patientRecord?.relation_label || undefined,
            emergencyContactName:
              rawPatient.emergencyContactName ||
              patientRecord?.emergencyContactName ||
              patientRecord?.emergency_contact ||
              undefined,
            emergencyContactPhone:
              rawPatient.emergencyContactPhone ||
              patientRecord?.emergencyContactPhone ||
              undefined,
            emergencyContactRelationship:
              rawPatient.emergencyContactRelationship ||
              patientRecord?.emergencyContactRelationship ||
              undefined
          }
        : (patientRecord
        ? {
            id: patientRecord.id,
            medicalRecordNumber: patientRecord.patient_id,
            nik: patientRecord.nik || undefined,
            fullName: patientRecord.name,
            motherName: patientRecord.mother_name || undefined,
            birthPlace: patientRecord.birth_place || undefined,
            birthDate: patientRecord.birth_date || undefined,
            gender: patientRecord.gender,
            bloodType: patientRecord.blood_type || undefined,
            occupation: patientRecord.occupation || undefined,
            phone: patientRecord.phone || undefined,
            email: patientRecord.email || undefined,
            address: patientRecord.address || undefined,
            line1: patientRecord.line1 || undefined,
            provinceName: patientRecord.province_name || undefined,
            provinceCode: patientRecord.province_code || undefined,
            regencyName: patientRecord.regency_name || undefined,
            regencyCode: patientRecord.regency_code || undefined,
            districtName: patientRecord.district_name || undefined,
            districtCode: patientRecord.district_code || undefined,
            villageName: patientRecord.village_name || undefined,
            villageCode: patientRecord.village_code || undefined,
            relationshipType: patientRecord.relationship_type || undefined,
            relationLabel: patientRecord.relation_label || undefined,
            emergencyContactName:
              patientRecord.emergencyContactName ||
              patientRecord.emergency_contact ||
              undefined,
            emergencyContactPhone:
              patientRecord.emergencyContactPhone || undefined,
            emergencyContactRelationship:
              patientRecord.emergencyContactRelationship || undefined
          }
        : matchingAffiliation
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
      maternal,
      child,
      patient,
      appointmentId: appointment.id,
      bookingCode: appointment.booking_code,
      scheduledDate: appointment.date,
      scheduledStartTime: appointment.scheduled_start_time || '',
      complaint: appointment.complaint || '',
      poliklinikName: appointment.poliklinik_name || '',
      serviceName: appointment.service || ''
    };
  }, [serverIntake, appointment, matchingAffiliation, patientRecord]);

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
