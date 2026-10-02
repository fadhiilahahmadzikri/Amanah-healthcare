import type {
  BackendAppointmentItem,
  PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ServiceCatalogItem } from '../api/catalog.service';
import type { Appointment } from '../api/types';

export interface MapAppointmentParams {
  res: BackendAppointmentItem;
  currentPatient: PatientAffiliationProfile | undefined;
  initialAppointment?: Appointment | null;
  dateStr: string;
  complaint: string;
  timeSlot: string;
  selectedService: ServiceCatalogItem | null;
}

export function mapBackendAppointmentToUi({
  res,
  currentPatient,
  initialAppointment,
  dateStr,
  complaint,
  timeSlot,
  selectedService
}: MapAppointmentParams): Appointment {
  const matchStart = res.scheduledStartTime?.match(/^(\d{1,2}):(\d{2})/);
  const matchEnd = res.scheduledEndTime?.match(/^(\d{1,2}):(\d{2})/);
  const startFmt = matchStart
    ? `${matchStart[1].padStart(2, '0')}.${matchStart[2]}`
    : res.scheduledStartTime;
  const endFmt = matchEnd ? `${matchEnd[1].padStart(2, '0')}.${matchEnd[2]}` : res.scheduledEndTime;
  const timeDisplay = startFmt && endFmt ? `${startFmt} - ${endFmt} WIB` : res.session || timeSlot;

  return {
    id: res.id,
    booking_code: res.id.slice(0, 8).toUpperCase(),
    patient_name:
      res.patientName || currentPatient?.fullName || initialAppointment?.patient_name || 'Pasien',
    patient_email: initialAppointment?.patient_email || '',
    patient_avatar: initialAppointment?.patient_avatar || '',
    doctor_name: res.doctorName || initialAppointment?.doctor_name || '',
    doctor_specialty: res.doctorSpecialty || initialAppointment?.doctor_specialty || '',
    poliklinik_name: res.poliklinikName || initialAppointment?.poliklinik_name || '',
    room_name: res.roomName || initialAppointment?.room_name || '',
    room_location: res.roomLocation || initialAppointment?.room_location || '',
    scheduled_start_time: startFmt || initialAppointment?.scheduled_start_time,
    scheduled_end_time: endFmt || initialAppointment?.scheduled_end_time,
    date: res.appointmentDate || dateStr,
    time: timeDisplay,
    complaint: res.complaint || complaint,
    status: 'Sudah Buat Janji',
    visit_type: res.visitType || initialAppointment?.visit_type || '',
    service: res.layananName || selectedService?.name || initialAppointment?.service || '',
    created_at: res.createdAt || new Date().toISOString(),
    queue_number: res.queueNumber || initialAppointment?.queue_number || '-'
  };
}
