import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { klinikKeys } from '../../../api/query-keys';
import { FLOW_NAMES } from '../../../constants/medical-appointment-types';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '../../../api/kia-intake-service';
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

  const { data: patientDetailResponse } = useQuery({
    queryKey: ['patient-detail', appointment.patient_id],
    queryFn: () => getPatientById(appointment.patient_id!),
    enabled: Boolean(appointment.patient_id),
    staleTime: 60_000
  });
  const patientRecord = patientDetailResponse?.patient;

  const parsedData = React.useMemo<UnifiedInspectorData>(() => {
    const rawData = serverIntake?.data ?? serverIntake;

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
    const patient: UnifiedInspectorPatient | undefined = rawPatient
      ? {
          id: rawPatient.id,
          medicalRecordNumber: rawPatient.medicalRecordNumber,
          nik: rawPatient.nik,
          fullName: rawPatient.fullName,
          motherName: rawPatient.motherName,
          birthPlace: rawPatient.birthPlace,
          birthDate: rawPatient.birthDate,
          gender: rawPatient.gender,
          bloodType: rawPatient.bloodType,
          occupation: rawPatient.occupation,
          phone: rawPatient.phone,
          email: rawPatient.email,
          address: rawPatient.address,
          line1: rawPatient.line1,
          provinceName: rawPatient.provinceName,
          provinceCode: rawPatient.provinceCode,
          regencyName: rawPatient.regencyName,
          regencyCode: rawPatient.regencyCode,
          districtName: rawPatient.districtName,
          districtCode: rawPatient.districtCode,
          villageName: rawPatient.villageName,
          villageCode: rawPatient.villageCode,
          relationshipTypeId: rawPatient.relationshipTypeId,
          relationshipType: rawPatient.relationshipType,
          relationLabel: rawPatient.relationLabel,
          emergencyContactName: rawPatient.emergencyContactName,
          emergencyContactPhone: rawPatient.emergencyContactPhone,
          emergencyContactRelationship: rawPatient.emergencyContactRelationship
        }
      : patientRecord
        ? {
            id: patientRecord.id,
            medicalRecordNumber: patientRecord.medical_record_number || patientRecord.patient_id,
            nik: patientRecord.nik,
            fullName: patientRecord.name,
            motherName: patientRecord.mother_name,
            birthPlace: patientRecord.birth_place,
            birthDate: patientRecord.birth_date,
            gender: patientRecord.gender,
            bloodType: patientRecord.blood_type,
            occupation: patientRecord.occupation,
            phone: patientRecord.phone,
            email: patientRecord.email,
            address: patientRecord.address,
            line1: patientRecord.line1 ?? undefined,
            provinceName: patientRecord.province_name ?? undefined,
            provinceCode: patientRecord.province_code ?? undefined,
            regencyName: patientRecord.regency_name ?? undefined,
            regencyCode: patientRecord.regency_code ?? undefined,
            districtName: patientRecord.district_name ?? undefined,
            districtCode: patientRecord.district_code ?? undefined,
            villageName: patientRecord.village_name ?? undefined,
            villageCode: patientRecord.village_code ?? undefined,
            relationshipTypeId: patientRecord.relationshipTypeId ?? undefined,
            relationshipType: patientRecord.relationship_type ?? undefined,
            relationLabel: patientRecord.relation_label ?? undefined,
            emergencyContactName: patientRecord.emergencyContactName ?? undefined,
            emergencyContactPhone: patientRecord.emergencyContactPhone ?? undefined,
            emergencyContactRelationship: patientRecord.emergencyContactRelationship ?? undefined
          }
        : appointment.patient_name
          ? {
              fullName: appointment.patient_name,
              phone: appointment.patient_phone
            }
          : undefined;

    return {
      flow,
      maternal,
      child,
      patient,
      appointmentId: appointment.id,
      bookingCode: appointment.booking_code,
      scheduledDate: appointment.date,
      scheduledStartTime: appointment.scheduled_start_time || '',
      complaint: appointment.complaint,
      poliklinikId: appointment.poliklinik_id,
      poliklinikName: appointment.poliklinik_name,
      categoryId: appointment.category_id,
      categoryName: appointment.category_name,
      serviceId: appointment.layanan_id,
      serviceName: appointment.service
    };
  }, [serverIntake, appointment, patientRecord]);

  const isPregnancy = parsedData.flow === FLOW_NAMES.PREGNANCY;
  const isImmunization = parsedData.flow === FLOW_NAMES.IMMUNIZATION;

  return {
    serverIntake,
    isLoading,
    parsedData,
    isPregnancy,
    isImmunization
  };
}
