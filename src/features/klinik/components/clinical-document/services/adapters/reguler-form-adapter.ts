import type { UnifiedInspectorData } from '../../../inspector/types';
import type { Appointment } from '../../../../api/types';
import type { FormJsonSchema } from '../../../../constants/medical-appointment-types';
import type { RegulerFormData } from '../../types';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import { formatClinicDate } from '@/lib/date-format';
import { getInactiveFieldIds, formatGender } from './clinical-adapter-helpers';

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 RegulerFormData (General Intake)
 */
export function adaptToRegulerFormData(
  data: UnifiedInspectorData,
  appointment?: Appointment,
  schema?: FormJsonSchema | Record<string, any> | null
): RegulerFormData {
  const p = data.patient;
  const answers = data.answers || {};
  const _inactive = getInactiveFieldIds(schema);

  const bDate = p?.birthDate;
  const age = bDate ? `${new Date().getFullYear() - new Date(bDate).getFullYear()} Tahun` : '';

  const complaint = appointment?.complaint || data.complaint || '';
  const allergy = answers.allergyHistory || '';

  const heightVal = answers.vitalHeightCm;
  const vitalHeightCm = heightVal ? `${heightVal} cm` : '';

  const weightVal = answers.vitalWeightKg;
  const vitalWeightKg = weightVal ? `${weightVal} kg` : '';

  const vitalBloodPressure = answers.vitalBloodPressure || '';
  const additionalNotes = answers.additionalNotes || '';

  const resolvedAddress = (() => {
    const l1 = p?.line1;
    const vill = p?.villageName;
    const dist = p?.districtName;
    const reg = p?.regencyName;
    const prov = p?.provinceName;
    const parts = [
      l1,
      vill ? `Kel. ${vill}` : '',
      dist ? `Kec. ${dist}` : '',
      reg,
      prov ? `Prov. ${prov}` : ''
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : p?.address || '';
  })();

  return {
    medicalRecordNumber: p?.medicalRecordNumber || '',
    registrationDate: data.scheduledDate
      ? formatClinicDate(data.scheduledDate, { style: 'human_full' })
      : formatClinicDate(new Date().toISOString(), { style: 'human_full' }),
    bookingCode: appointment?.booking_code || data.bookingCode || '',
    queueNumber: appointment?.queue_number || '',
    poliklinikName: appointment?.poliklinik_name || data?.poliklinikName || '',
    serviceName: appointment?.service || data.serviceName || '',
    doctorName: appointment?.doctor_name || '',
    scheduledTime: appointment?.scheduled_start_time || data.scheduledStartTime ? `${appointment?.scheduled_start_time || data.scheduledStartTime} WIB` : '',
    identity: {
      nik: p?.nik || '',
      fullName: p?.fullName || '',
      gender: formatGender(p?.gender),
      birthDate: bDate ? formatClinicDate(bDate, { style: 'human_full' }) : '',
      birthPlace: p?.birthPlace || '',
      age,
      bloodType: p?.bloodType ? p.bloodType.toUpperCase() : '',
      motherName: p?.motherName || '',
      occupation: p?.occupation || '',
      phoneNumber: p?.phone || '',
      email: p?.email || '',
      address: resolvedAddress,
      relationship: getRelationshipLabel(p?.relationshipType)
    },
    emergencyContact: {
      name: p?.emergencyContactName || '',
      relationship: p?.emergencyContactRelationship || '',
      phoneNumber: p?.emergencyContactPhone || ''
    },
    clinical: {
      chiefComplaint: complaint,
      allergyHistory: allergy,
      vitalHeightCm,
      vitalWeightKg,
      vitalBloodPressure,
      additionalNotes
    }
  };
}
