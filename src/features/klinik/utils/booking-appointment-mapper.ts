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

export function mapBackendAppointmentToUi({
  res,
  currentPatient,
  dateStr,
  complaint,
  selectedService
}: MapAppointmentParams): Appointment {
  const timeSource = res.etaRange || '';
  const timeMatches = timeSource.match(/(\d{1,2}[:.]\d{2})/g);
  const startClock = timeMatches?.[0]
    ? timeMatches[0].replace('.', ':')
    : res.scheduledStartTime
      ? formatClinicTime(res.scheduledStartTime)
      : '';
  const endClock = timeMatches?.[1]
    ? timeMatches[1].replace('.', ':')
    : res.scheduledEndTime
      ? formatClinicTime(res.scheduledEndTime)
      : '';

  const startFmt = startClock ? formatClinicTime(startClock) : '';
  const endFmt = endClock ? formatClinicTime(endClock) : '';
  const friendlySession = formatFriendlySessionName(res.sessionName || res.session);
  const timeDisplay =
    res.etaRange ||
    (startFmt && endFmt ? `${startFmt} - ${endFmt}` : friendlySession || res.session || '-');

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
    scheduled_start_time: startFmt || undefined,
    scheduled_end_time: endFmt || undefined,
    eta_range: res.etaRange || null,
    session_name: friendlySession || undefined,
    session: friendlySession || res.session || undefined,
    date: res.appointmentDate || dateStr,
    time: timeDisplay,
    complaint: res.complaint || complaint,
    status: APPOINTMENT_STATUS.BOOKED,
    visit_type: res.visitType || '',
    service: res.layananName || selectedService?.name || '',
    created_at: res.createdAt || new Date().toISOString(),
    queue_number: res.queueNumber || '-',
    allowedActions: (res.allowedActions as string[]) || ['CANCEL', 'RESCHEDULE']
  };
}

