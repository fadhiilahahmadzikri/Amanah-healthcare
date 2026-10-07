import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { normalizeToAppointmentStatus } from '../constants/appointment-status.dictionary';
import type { Appointment } from '@/features/klinik';
import type {
  AdminAppointment,
  AppointmentSummary,
  AppointmentAction,
  AppointmentStatus,
  BackendAppointmentRecord
} from './types';

export const emptyAppointmentSummary: AppointmentSummary = {
  total: 0,
  booked: 0,
  waiting: 0,
  inService: 0,
  completed: 0,
  cancelled: 0,
  late: 0
};

export function computeSummary(records: AdminAppointment[]): AppointmentSummary {
  if (records.length === 0) return emptyAppointmentSummary;

  const countOf = (st: AppointmentStatus) => records.filter((r) => r.status === st).length;

  return {
    total: records.length,
    booked: countOf(APPOINTMENT_STATUS.BOOKED),
    waiting: countOf(APPOINTMENT_STATUS.WAITING),
    inService: countOf(APPOINTMENT_STATUS.IN_SERVICE),
    completed: countOf(APPOINTMENT_STATUS.COMPLETED),
    cancelled: countOf(APPOINTMENT_STATUS.CANCELLED),
    late: countOf(APPOINTMENT_STATUS.LATE)
  };
}

export function mapToAdminAppointment(item: BackendAppointmentRecord): AdminAppointment {
  const status = normalizeToAppointmentStatus(item.status);
  const patientName = item.patientName || item.patientProfile?.fullName || 'Pasien Amanah';
  const doctorName =
    item.doctorName || item.practitioner?.staffProfile?.fullName || 'Dokter Amanah';
  const poliklinikName = item.poliklinikName || item.clinicRoom?.clinicUnit?.name || 'Poli Umum';
  const queueNumber = item.queueNumber
    ? String(item.queueNumber)
    : item.queueTickets?.[0]?.queueNumber || '-';
  const scheduledDate =
    item.appointmentDate ||
    (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const scheduledStartTime = item.scheduledStartTime || item.session || '-';

  const allowedActions =
    (item.allowedActions as AppointmentAction[]) ||
    (status === APPOINTMENT_STATUS.BOOKED
      ? ['CHECK_IN', 'CANCEL']
      : status === APPOINTMENT_STATUS.WAITING
        ? ['CALL', 'START_SERVICE', 'CANCEL']
        : status === APPOINTMENT_STATUS.IN_SERVICE
          ? ['COMPLETE']
          : []);

  return {
    id: String(item.id),
    queueNumber,
    patientId: item.patientId || String(item.id),
    patientName,
    gender: item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
    phone: item.phone || '-',
    email: item.email || '-',
    scheduledDate,
    scheduledStartTime,
    doctorName,
    staffId: item.staffId ? String(item.staffId) : item.doctorId ? String(item.doctorId) : null,
    doctorId: item.doctorId ? String(item.doctorId) : item.staffId ? String(item.staffId) : null,
    poliklinikName,
    layananId: (item.layananId as string) || null,
    layananName: (item.layananName as string) || item.clinicService?.name || null,
    visitType: item.visitType || 'Pemeriksaan Baru',
    complaint: item.complaint || '-',
    status,
    allowedActions,
    lastCalledAt: item.lastCalledAt ? String(item.lastCalledAt) : null,
    actualStartedAt: item.actualStartedAt ? String(item.actualStartedAt) : null,
    actualCompletedAt: item.actualCompletedAt ? String(item.actualCompletedAt) : null,
    estimatedStartAt: item.estimatedStartAt ? String(item.estimatedStartAt) : null,
    estimatedEndAt: item.estimatedEndAt ? String(item.estimatedEndAt) : null,
    checkedInAt: item.checkedInAt ? String(item.checkedInAt) : null,
    isAffiliated: Boolean(item.isAffiliated),
    affiliationRelationship: item.affiliationRelationship
      ? String(item.affiliationRelationship)
      : null,
    parentUserId: item.parentUserId ? String(item.parentUserId) : null,
    parentUserName: item.parentUserName ? String(item.parentUserName) : null,
    consultationElapsedSeconds:
      typeof item.consultationElapsedSeconds === 'number' ? item.consultationElapsedSeconds : null,
    consultationDurationFormatted: item.consultationDurationFormatted
      ? String(item.consultationDurationFormatted)
      : null,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
  };
}

export function adminAppointmentToAppointment(item: AdminAppointment): Appointment {
  return {
    id: item.id,
    booking_code: item.id.slice(0, 8).toUpperCase(),
    patient_name: item.patientName,
    patient_email: item.email || '',
    patient_avatar: (item as any).patientAvatar || '',
    doctor_name: item.doctorName,
    doctor_specialty: (item as any).doctorSpecialty || '',
    poliklinik_name: item.poliklinikName,
    service: item.layananName || '',
    room_name: (item as any).roomName || '',
    scheduled_start_time: item.scheduledStartTime || '',
    scheduled_end_time: (item as any).scheduledEndTime || item.estimatedEndAt || '',
    actual_started_at: item.actualStartedAt || undefined,
    actual_completed_at: item.actualCompletedAt || undefined,
    consultation_elapsed_seconds: item.consultationElapsedSeconds ?? undefined,
    consultation_duration_formatted: item.consultationDurationFormatted || undefined,
    date: item.scheduledDate,
    time: item.scheduledStartTime || '',
    patient_id: item.patientId,
    patient_phone: item.phone,
    complaint: item.complaint || '',
    status: item.status,
    visit_type: item.visitType || 'Pemeriksaan Baru',
    queue_number: item.queueNumber,
    created_at: item.createdAt || new Date().toISOString()
  };
}
