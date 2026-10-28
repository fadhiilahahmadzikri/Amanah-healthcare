import {
  APPOINTMENT_STATUS,
  AppointmentStatusDescriptor
} from '@/constants/appointment-status.constants';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { Appointment, AppointmentStatus } from '../../../api/types';
import { formatClinicTime } from '@/lib/date-format';
import {
  formatFriendlyVisitType,
  type CanonicalVisitType
} from '@/constants/visit-type.constants';

export interface SessionContext {
  doctorName?: string;
  doctorSpecialty?: string;
  date?: string;
  sessionTime?: string;
}

export function formatTimeString(time?: string): string | null {
  if (!time) return null;
  const res = formatClinicTime(time);
  return res && res !== '-' ? res : null;
}

export function normalizeAppointmentTimes(appointment: Partial<Appointment>): {
  startTime: string;
  endTime: string;
  durationText: string;
} {
  const desc = AppointmentStatusDescriptor.from(appointment.status);
  const isCompleted = desc.code === APPOINTMENT_STATUS.COMPLETED;
  const isInService = desc.isInService;

  if (isCompleted && appointment.actual_started_at && appointment.actual_completed_at) {
    const actualStart = formatTimeString(appointment.actual_started_at);
    const actualEnd = formatTimeString(appointment.actual_completed_at);

    return {
      startTime: actualStart || '-',
      endTime: actualEnd || '-',
      durationText: appointment.consultation_duration_formatted || '-'
    };
  }

  if (isInService && appointment.actual_started_at) {
    const actualStart = formatTimeString(appointment.actual_started_at);
    return {
      startTime: actualStart || '-',
      endTime: 'Sedang Berlangsung',
      durationText: 'Di Sesi'
    };
  }

  const timeStr = appointment.eta_range || '';
  const timeRangeMatch = timeStr.match(/(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})/);
  const sessionMatch = timeStr.match(/Sesi\s+[A-Za-z\s]+/i);

  // If eta_range provides specific patient arrival/service estimate window, respect it first!
  const etaStart = timeRangeMatch
    ? formatTimeString(timeRangeMatch[1].replace('.', ':')) || timeRangeMatch[1]
    : null;
  const etaEnd = timeRangeMatch
    ? formatTimeString(timeRangeMatch[2].replace('.', ':')) || timeRangeMatch[2]
    : null;

  let startTime = etaStart;
  if (!startTime) {
    startTime = formatTimeString(appointment.scheduled_start_time) ?? '-';
  }

  let endTime = etaEnd;
  if (!endTime) {
    endTime = formatTimeString(appointment.scheduled_end_time) ?? '-';
  }

  // Backend is SSOT for duration: use consultation_duration_formatted or estimated_duration_minutes
  const durationText =
    appointment.consultation_duration_formatted ??
    (appointment.estimated_duration_minutes
      ? `~${appointment.estimated_duration_minutes} mnt`
      : '-');

  return { startTime, endTime, durationText };
}

export function bookedPatientToAppointment(
  item: BookedPatientItem,
  context?: SessionContext
): Appointment {
  const timeSource = item.etaRange ? item.etaRange : (context?.sessionTime ?? '');
  const timeMatches = timeSource.match(/(\d{1,2}[:.]\d{2})/g);
  const startClock = timeMatches?.[0] ? timeMatches[0].replace('.', ':') : '';
  const endClock = timeMatches?.[1] ? timeMatches[1].replace('.', ':') : '';

  const descriptor = AppointmentStatusDescriptor.from(item.status);
  const canonicalStatus: AppointmentStatus = descriptor.code;

  const poliklinik_name = item.poliklinikName || '';
  const service = item.serviceName || '';
  const room_name = item.roomName || '';
  const room_location = item.roomLocation || '';
  const date = item.appointmentDate ? item.appointmentDate : (context?.date ?? '');

  const rawVisitType = formatFriendlyVisitType(item.visitType as CanonicalVisitType);

  const sessionDisplay = item.sessionTitle ? item.sessionTitle : (context?.sessionTime ?? '');

  return {
    id: item.appointmentId,
    booking_code: (item as { bookingCode?: string }).bookingCode ?? '',
    patient_id: item.patient.id ?? '',
    patient_name: item.patient.fullName,
    patient_email: item.patient.email || '',
    patient_avatar: item.patient.avatarUrl || '',
    patient_phone: item.patient.phoneNumber || '',
    doctor_name: context?.doctorName || '',
    doctor_specialty: context?.doctorSpecialty || '',
    poliklinik_name,
    service,
    room_name,
    room_location,
    scheduled_start_time: startClock,
    scheduled_end_time: endClock,
    actual_started_at: item.bookingMetadata?.startedAt ?? undefined,
    actual_completed_at: item.bookingMetadata?.completedAt ?? undefined,
    consultation_elapsed_seconds: item.consultationElapsedSeconds ?? undefined,
    consultation_duration_formatted: item.consultationDurationFormatted ?? undefined,
    estimated_duration_minutes: item.estimatedDurationMinutes ?? undefined,
    eta_range: item.etaRange || null,
    session: item.sessionTitle || undefined,
    session_name: item.sessionTitle || undefined,
    date,
    time: sessionDisplay,
    complaint: item.chiefComplaint || '',
    status: canonicalStatus,
    visit_type: rawVisitType,
    queue_number: item.queueNumber,
    created_at: item.bookingMetadata?.bookedAt || new Date().toISOString()
  };
}
