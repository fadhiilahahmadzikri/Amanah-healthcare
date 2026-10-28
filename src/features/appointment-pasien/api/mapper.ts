import { getGenderLabel } from '@/constants/gender.constants';
import { VISIT_TYPE } from '@/constants/visit-type.constants';
import { normalizeToAppointmentStatus } from '../constants/appointment-status.dictionary';
import type { Appointment } from '@/features/klinik';
import { resolveAppointmentCapabilities } from './capabilities';
import type { AdminAppointment, AppointmentAction, BackendAppointmentRecord } from './types';

export function mapToAdminAppointment(item: BackendAppointmentRecord): AdminAppointment {
  const status = normalizeToAppointmentStatus(item.status);
  const patientName = item.patientName ?? '';
  const doctorName = item.doctorName ?? null;
  const poliklinikName = item.poliklinikName ?? '';
  const queueNumber =
    item.queueTickets?.[0]?.queueNumber ?? (item.queueNumber ? String(item.queueNumber) : '-');
  const scheduledDate =
    item.appointmentDate ??
    (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const scheduledStartTime = item.scheduledStartTime ?? '-';

  const allowedActions = (item.allowedActions as AppointmentAction[]) ?? [];
  const capabilities = resolveAppointmentCapabilities(allowedActions);
  const avatarUrl = (item.avatarUrl as string | undefined) ?? null;

  return {
    id: String(item.id),
    queueNumber,
    patientId: item.patientId ? String(item.patientId) : '',
    patientName,
    avatarUrl,
    gender: getGenderLabel(item.gender),
    phone: item.phone ?? '-',
    email: item.email ?? '-',
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime: item.scheduledEndTime ?? null,
    doctorName,
    doctorSpecialty: (item.doctorSpecialty as string | undefined) ?? null,
    staffId: item.staffId ? String(item.staffId) : item.doctorId ? String(item.doctorId) : null,
    doctorId: item.doctorId ? String(item.doctorId) : item.staffId ? String(item.staffId) : null,
    poliklinikId: item.poliklinikId ? String(item.poliklinikId) : null,
    poliklinikName,
    roomName: (item.roomName as string | undefined) ?? null,
    roomLocation: (item.roomLocation as string | undefined) ?? null,
    layananId: item.layananId ? String(item.layananId) : null,
    layananName: (item.layananName as string | undefined) ?? null,
    visitType: item.visitType ?? VISIT_TYPE.NEW_VISIT,
    complaint: item.complaint ?? '-',
    status,
    allowedActions,
    capabilities,
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
    bookingCode: (item.bookingCode as string | undefined) ?? null,
    aheadCount: typeof item.aheadCount === 'number' ? item.aheadCount : null,
    etaRange: (item.etaRange as string | undefined) ?? null,
    session: item.session ?? null,
    sessionName: item.sessionName ?? item.session ?? null,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
  };
}

export function adminAppointmentToAppointment(item: AdminAppointment): Appointment {
  const timeSource = item.scheduledStartTime ?? '';
  const timeMatches = timeSource.match(/(\d{1,2}[:.]\d{2})/g);
  const startClock = timeMatches?.[0]
    ? timeMatches[0].replace('.', ':')
    : (item.scheduledStartTime ?? '');
  const endClock = item.scheduledEndTime ?? '';

  return {
    id: item.id,
    booking_code: item.bookingCode ?? '',
    patient_name: item.patientName,
    patient_email: item.email ?? '',
    patient_avatar: item.avatarUrl ?? '',
    doctor_name: item.doctorName ?? '',
    doctor_specialty: item.doctorSpecialty ?? '',
    poliklinik_name: item.poliklinikName,
    service: item.layananName ?? '',
    room_name: item.roomName ?? '',
    scheduled_start_time: startClock,
    scheduled_end_time: endClock,
    actual_started_at: item.actualStartedAt ?? undefined,
    actual_completed_at: item.actualCompletedAt ?? undefined,
    consultation_elapsed_seconds: item.consultationElapsedSeconds ?? undefined,
    consultation_duration_formatted: item.consultationDurationFormatted ?? undefined,
    eta_range: item.etaRange ?? null,
    ahead_count: item.aheadCount ?? null,
    session: item.session ?? undefined,
    session_name: item.sessionName ?? item.session ?? null,
    date: item.scheduledDate,
    time: item.scheduledStartTime ?? '',
    patient_id: item.patientId,
    patient_phone: item.phone,
    complaint: item.complaint ?? '',
    status: item.status,
    visit_type: item.visitType ?? VISIT_TYPE.NEW_VISIT,
    queue_number: item.queueNumber,
    allowedActions: item.allowedActions,
    created_at: item.createdAt ?? new Date().toISOString()
  };
}
