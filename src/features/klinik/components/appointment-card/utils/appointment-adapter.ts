import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { Appointment, AppointmentStatus } from '../../../api/types';

export interface SessionContext {
  doctorName?: string;
  doctorSpecialty?: string;
  date?: string;
  sessionTime?: string;
}

export function formatTimeSlotString(time?: string): string | null {
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
  const isCompleted = appointment.status === 'Selesai' || appointment.status === 'COMPLETED';
  const isInService =
    appointment.status === 'Sedang Diperiksa' || appointment.status === 'IN_SERVICE';

  if (isCompleted && appointment.actual_started_at && appointment.actual_completed_at) {
    const actualStart = formatTimeSlotString(appointment.actual_started_at);
    const actualEnd = formatTimeSlotString(appointment.actual_completed_at);
    const startMs = new Date(appointment.actual_started_at).getTime();
    const endMs = new Date(appointment.actual_completed_at).getTime();
    let diffMins = Math.round((endMs - startMs) / 60000);
    if (diffMins <= 0) diffMins = 1;

    return {
      startTime: actualStart || '-',
      endTime: actualEnd || '-',
      durationText: `${diffMins} minutes`
    };
  }

  if (isInService && appointment.actual_started_at) {
    const actualStart = formatTimeSlotString(appointment.actual_started_at);
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
    formatTimeSlotString(appointment.scheduled_start_time) ||
    (timeRangeMatch ? timeRangeMatch[1].replace(':', '.') : '-');
  const endTime =
    formatTimeSlotString(appointment.scheduled_end_time) ||
    (timeRangeMatch ? timeRangeMatch[2].replace(':', '.') : '-');

  let durationText = sessionMatch ? sessionMatch[0] : '-';
  if (startTime !== '-' && endTime !== '-') {
    const startParts = startTime.split('.').map(Number);
    const endParts = endTime.split('.').map(Number);
    if (
      !Number.isNaN(startParts[0]) &&
      !Number.isNaN(startParts[1]) &&
      !Number.isNaN(endParts[0]) &&
      !Number.isNaN(endParts[1])
    ) {
      const diffMins = endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      if (diffMins > 0) {
        durationText = `${diffMins} minutes`;
      }
    }
  } else if (!sessionMatch && timeRangeMatch) {
    const startParts = timeRangeMatch[1].replace('.', ':').split(':').map(Number);
    const endParts = timeRangeMatch[2].replace('.', ':').split(':').map(Number);
    if (
      !Number.isNaN(startParts[0]) &&
      !Number.isNaN(startParts[1]) &&
      !Number.isNaN(endParts[0]) &&
      !Number.isNaN(endParts[1])
    ) {
      const diffMins = endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      if (diffMins > 0) {
        durationText = `${diffMins} minutes`;
      }
    }
  }

  return { startTime, endTime, durationText };
}

export function bookedPatientToAppointment(
  item: BookedPatientItem,
  context?: SessionContext
): Appointment {
  const timeParts = (item.timeSlot || '').split('-').map((s) => s.trim());
  const startClock = timeParts[0] || '';
  const endClock = timeParts[1] || '';

  const rawStatus = (item.statusBadge || item.status || '').toLowerCase();
  let canonicalStatus: AppointmentStatus = 'Sudah Buat Janji';
  if (rawStatus === 'waiting' || rawStatus === 'menunggu') {
    canonicalStatus = 'Menunggu';
  } else if (
    rawStatus === 'in_service' ||
    rawStatus === 'sedang diperiksa' ||
    rawStatus === 'di sesi'
  ) {
    canonicalStatus = 'Sedang Diperiksa';
  } else if (rawStatus === 'completed' || rawStatus === 'selesai') {
    canonicalStatus = 'Selesai';
  } else if (rawStatus === 'cancelled' || rawStatus === 'batal') {
    canonicalStatus = 'Batal';
  } else if (rawStatus === 'no_show' || rawStatus === 'terlambat' || rawStatus === 'tidak hadir') {
    canonicalStatus = 'Tidak Hadir';
  }

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
    scheduled_start_time: startClock.replace('.', ':'),
    scheduled_end_time: endClock.replace('.', ':'),
    actual_started_at: (item as unknown as { actualStartedAt?: string }).actualStartedAt,
    actual_completed_at: (item as unknown as { actualCompletedAt?: string }).actualCompletedAt,
    estimated_duration_minutes:
      (item as unknown as { estimatedDurationMinutes?: number }).estimatedDurationMinutes ?? 30,
    date,
    time: item.timeSlot || context?.sessionTime || '',
    complaint: item.chiefComplaint || '',
    status: canonicalStatus,
    visit_type: rawVisitType,
    queue_number: item.queueNumber,
    created_at: item.bookingMetadata?.bookedAt || new Date().toISOString()
  };
}
