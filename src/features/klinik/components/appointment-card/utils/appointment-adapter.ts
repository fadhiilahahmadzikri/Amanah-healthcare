import {
  APPOINTMENT_STATUS,
  AppointmentStatusDescriptor
} from '@/constants/appointment-status.constants';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { Appointment, AppointmentStatus } from '../../../api/types';

export interface SessionContext {
  doctorName?: string;
  doctorSpecialty?: string;
  date?: string;
  sessionTime?: string;
}

export function formatTimeString(time?: string): string | null {
  if (!time) return null;
  if (time.includes('T') || time.endsWith('Z')) {
    const d = new Date(time);
    if (!Number.isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}.${minutes}`;
    }
  }
  const match = time.match(/(\d{1,2})[:.](\d{2})/);
  return match ? `${match[1].padStart(2, '0')}.${match[2]}` : null;
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

  const timeStr = appointment.time || '';
  const timeRangeMatch = timeStr.match(/(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})/);
  const sessionMatch = timeStr.match(/Sesi\s+[A-Za-z]+/i);

  const startTime =
    formatTimeString(appointment.scheduled_start_time) ||
    (timeRangeMatch ? timeRangeMatch[1].replace(':', '.') : formatTimeString(timeStr) || '-');
  const endTime =
    formatTimeString(appointment.scheduled_end_time) ||
    (timeRangeMatch ? timeRangeMatch[2].replace(':', '.') : '-');

  // Frontend does not calculate minutes. Backend provides duration or session label.
  const durationText = sessionMatch
    ? sessionMatch[0]
    : appointment.consultation_duration_formatted ||
      (appointment.estimated_duration_minutes
        ? `~${appointment.estimated_duration_minutes} mnt`
        : '-');

  return { startTime, endTime, durationText };
}

export function bookedPatientToAppointment(
  item: BookedPatientItem,
  context?: SessionContext
): Appointment {
  const timeMatches = (item.timeSlot || '').match(/(\d{1,2}[:.]\d{2})/g);
  const startClock = timeMatches?.[0] ? timeMatches[0].replace('.', ':') : '';
  const endClock = timeMatches?.[1] ? timeMatches[1].replace('.', ':') : '';

  const descriptor = AppointmentStatusDescriptor.from(item.statusBadge || item.status);
  const canonicalStatus: AppointmentStatus = descriptor.code;

  const poliklinik_name = item.poliklinikName || '';
  const service = item.serviceName || '';
  const room_name = item.roomName || item.clinicRoomName || '';
  const room_location = item.roomLocation || '';
  const date = item.appointmentDate || context?.date || '';

  const rawVisitType =
    item.visitType ||
    (item as unknown as { visit_type?: string }).visit_type ||
    (item as unknown as { layananName?: string }).layananName ||
    'Pemeriksaan Baru';

  const sessionDisplay = item.sessionTitle || context?.sessionTime || item.timeSlot || '';

  return {
    id: item.appointmentId,
    booking_code: item.appointmentId.slice(0, 8).toUpperCase(),
    patient_id: item.patient.id || item.appointmentId,
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
    actual_started_at:
      (item as unknown as { actualStartedAt?: string }).actualStartedAt ||
      item.bookingMetadata?.startedAt ||
      undefined,
    actual_completed_at:
      (item as unknown as { actualCompletedAt?: string }).actualCompletedAt ||
      item.bookingMetadata?.completedAt ||
      undefined,
    consultation_elapsed_seconds: (item as unknown as { consultationElapsedSeconds?: number })
      .consultationElapsedSeconds,
    consultation_duration_formatted: (item as unknown as { consultationDurationFormatted?: string })
      .consultationDurationFormatted,
    estimated_duration_minutes: (item as unknown as { estimatedDurationMinutes?: number })
      .estimatedDurationMinutes,
    date,
    time: sessionDisplay,
    complaint: item.chiefComplaint || '',
    status: canonicalStatus,
    visit_type: rawVisitType,
    queue_number: item.queueNumber,
    created_at: item.bookingMetadata?.bookedAt || new Date().toISOString()
  };
}
