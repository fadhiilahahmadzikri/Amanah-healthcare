import type {
  BackendAppointmentItem,
  PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ServiceCatalogItem } from '../api/catalog.service';
import { APPOINTMENT_STATUS, type Appointment } from '../api/types';

export interface MapAppointmentParams {
  res: BackendAppointmentItem;
  currentPatient: PatientAffiliationProfile | undefined;
  dateStr: string;
  complaint: string;
  selectedService: ServiceCatalogItem | null;
}

export function mapBackendAppointmentToUi({
  res,
  currentPatient,
  dateStr,
  complaint,
  selectedService
}: MapAppointmentParams): Appointment {
  const matchStart = res.scheduledStartTime?.match(/^(\d{1,2}):(\d{2})/);
  const matchEnd = res.scheduledEndTime?.match(/^(\d{1,2}):(\d{2})/);
  const startFmt = matchStart
    ? `${matchStart[1].padStart(2, '0')}.${matchStart[2]}`
    : res.scheduledStartTime;
  const endFmt = matchEnd ? `${matchEnd[1].padStart(2, '0')}.${matchEnd[2]}` : res.scheduledEndTime;
  const timeDisplay = startFmt && endFmt ? `${startFmt} - ${endFmt} WIB` : res.session;

  return {
    id: res.id,
    booking_code: res.bookingCode || res.id.slice(0, 8).toUpperCase(),
    patient_name: res.patientName || currentPatient?.fullName || 'Pasien',
    patient_email: '',
    patient_avatar: '',
    doctor_name: res.doctorName || '',
    doctor_specialty: res.doctorSpecialty || '',
    poliklinik_name: res.poliklinikName || '',
    room_name: res.roomName || '',
    room_location: res.roomLocation || '',
    scheduled_start_time: startFmt,
    scheduled_end_time: endFmt,
    date: res.appointmentDate || dateStr,
    time: timeDisplay,
    complaint: res.complaint || complaint,
    status: APPOINTMENT_STATUS.BOOKED,
    visit_type: res.visitType || '',
    service: res.layananName || selectedService?.name || '',
    created_at: res.createdAt || new Date().toISOString(),
    queue_number: res.queueNumber || '-'
  };
}
