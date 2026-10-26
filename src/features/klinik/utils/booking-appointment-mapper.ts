import type {
  BackendAppointmentItem,
  PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ServiceCatalogItem } from '../api/catalog.service';
import { APPOINTMENT_STATUS, type Appointment } from '../api/types';
import { formatClinicTime } from '@/lib/date-format';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';

export interface MapAppointmentParams {
  res: BackendAppointmentItem;
  currentPatient: PatientAffiliationProfile | undefined;
  dateStr: string;
  complaint: string;
  selectedService: ServiceCatalogItem | null;
}

export function mapBackendAppointmentToUi({ res }: MapAppointmentParams): Appointment {
  const scheduledStart = res.scheduledStartTime
    ? formatClinicTime(res.scheduledStartTime)
    : undefined;
  const scheduledEnd = res.scheduledEndTime ? formatClinicTime(res.scheduledEndTime) : undefined;
  const sessionName = formatFriendlySessionName(res.session);

  return {
    id: res.id,
    booking_code: res.bookingCode || res.id.slice(0, 8).toUpperCase(),
    patient_name: res.patientName || '',
    patient_email: '',
    patient_avatar: '',
    doctor_name: res.doctorName || '',
    doctor_specialty: res.doctorSpecialty || '',
    poliklinik_name: res.poliklinikName || '',
    room_name: res.roomName || '',
    room_location: res.roomLocation || '',
    scheduled_start_time: scheduledStart,
    scheduled_end_time: scheduledEnd,
    eta_range: res.etaRange || null,
    session_name: sessionName || undefined,
    session: res.session || undefined,
    date: res.appointmentDate,
    time: res.etaRange ?? '',
    complaint: res.complaint || '',
    status: APPOINTMENT_STATUS.BOOKED,
    visit_type: res.visitType || '',
    service: res.layananName || '',
    created_at: String(res.createdAt),
    queue_number: res.queueNumber,
    allowedActions: (res.allowedActions as string[]) || ['CANCEL', 'RESCHEDULE']
  };
}
