import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { normalizeToAppointmentStatus } from '../constants/appointment-status.dictionary';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import type { Appointment } from '@/features/klinik';
import type { AdminAppointment, AppointmentAction, BackendAppointmentRecord } from './types';

export function mapToAdminAppointment(item: BackendAppointmentRecord): AdminAppointment {
  const status = normalizeToAppointmentStatus(item.status);
  const patientName = item.patientName || item.patientProfile?.fullName || 'Pasien Amanah';
  const doctorName = item.doctorName || item.practitioner?.staffProfile?.fullName || null;
  const poliklinikName = item.poliklinikName || item.clinicRoom?.clinicUnit?.name || 'Poli Umum';
  const queueNumber =
    item.queueTickets?.[0]?.queueNumber ||
    (item.queueNumber ? String(item.queueNumber) : '-');
  const scheduledDate =
    item.appointmentDate ||
    (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const scheduledStartTime = item.scheduledStartTime || item.session || '-';

  const allowedActions = (item.allowedActions as AppointmentAction[]) || [];

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
    doctorSpecialty:
      (item.doctorSpecialty as string) ||
      (item.practitioner?.medicalSpecialty?.name as string) ||
      null,
    doctorAvatarUrl: (item.doctorAvatarUrl as string) || null,
    staffId: item.staffId ? String(item.staffId) : item.doctorId ? String(item.doctorId) : null,
    doctorId: item.doctorId ? String(item.doctorId) : item.staffId ? String(item.staffId) : null,
    poliklinikName,
    roomName: (item.roomName as string) || (item.clinicRoom as any)?.name || null,
    roomLocation: (item.roomLocation as string) || (item.clinicRoom as any)?.location || null,
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
    bookingCode: (item.bookingCode as string) || null,
    aheadCount: typeof item.aheadCount === 'number' ? item.aheadCount : null,
    etaRange: (item.etaRange as string) || null,
    session: item.session || null,
    sessionName: formatFriendlySessionName(item.sessionName || item.session) || null,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
  };
}

export function adminAppointmentToAppointment(item: AdminAppointment): Appointment {
  const timeSource = item.etaRange || item.scheduledStartTime || '';
  const timeMatches = timeSource.match(/(\d{1,2}[:.]\d{2})/g);
  const startClock = timeMatches?.[0] ? timeMatches[0].replace('.', ':') : item.scheduledStartTime || '';
  const endClock = timeMatches?.[1]
    ? timeMatches[1].replace('.', ':')
    : (item as any).scheduledEndTime || item.estimatedEndAt || '';

  return {
    id: item.id,
    booking_code: item.bookingCode || item.id.slice(0, 8).toUpperCase(),
    patient_name: item.patientName,
    patient_email: item.email || '',
    patient_avatar: (item as any).patientAvatar || '',
    doctor_name: item.doctorName || '',
    doctor_specialty: item.doctorSpecialty || '',
    poliklinik_name: item.poliklinikName,
    service: item.layananName || '',
    room_name: item.roomName || '',
    scheduled_start_time: startClock,
    scheduled_end_time: endClock,
    actual_started_at: item.actualStartedAt || undefined,
    actual_completed_at: item.actualCompletedAt || undefined,
    consultation_elapsed_seconds: item.consultationElapsedSeconds ?? undefined,
    consultation_duration_formatted: item.consultationDurationFormatted || undefined,
    eta_range: item.etaRange || null,
    ahead_count: item.aheadCount ?? null,
    session: item.session || undefined,
    session_name: formatFriendlySessionName(item.sessionName || item.session) || null,
    date: item.scheduledDate,
    time: item.etaRange || item.scheduledStartTime || '',
    patient_id: item.patientId,
    patient_phone: item.phone,
    complaint: item.complaint || '',
    status: item.status,
    visit_type: item.visitType || 'Pemeriksaan Baru',
    queue_number: item.queueNumber,
    allowedActions: item.allowedActions,
    created_at: item.createdAt || new Date().toISOString()
  };
}
