import { clientFetch } from '@/lib/client-fetch';
import { formatClinicTime } from '@/lib/date-format';
import { getClinicalPractitionersAction } from '@/features/jadwal-dokter/api/doctor-schedule-actions';
import type { ClinicalPractitioner } from '@/server/contracts/schedules/doctor-schedules.dto';
import { Doctor, QueueItem, QueueStatus, QUEUE_STATUS } from './types';

export async function fetchClinicalDoctors(serviceName?: string): Promise<Doctor[]> {
  try {
    const list = await getClinicalPractitionersAction({ service: serviceName });
    return (list || []).map((doc: ClinicalPractitioner) => ({
      name: doc.name,
      spec: doc.spec,
      avatar: typeof doc.avatar === 'string' ? doc.avatar : '',
      location: doc.location,
      rating: doc.rating || '5.0',
      tags: doc.tags || [doc.spec],
      schedule: doc.schedule
    }));
  } catch (err) {
    console.error('Failed to fetch clinical practitioners from backend:', err);
    return [];
  }
}

export const getDoctors = (): Doctor[] => {
  return [];
};

export const getDoctorByName = (_name: string): Doctor | undefined => {
  return undefined;
};

export const getDoctorsByService = (_serviceName?: string): Doctor[] => {
  return [];
};

export async function fetchPoliListFromApi(): Promise<string[]> {
  try {
    const res = await clientFetch<
      Array<{ id: string; name: string }> | { items?: Array<{ id: string; name: string }> }
    >('/api/v1/schedules/reference/polikliniks');
    const list = Array.isArray(res) ? res : res?.items || [];
    return list.map((item) => item.name);
  } catch (err) {
    console.error('Failed to fetch poliklinik list from backend:', err);
    return [];
  }
}

export async function fetchClinicOperationalHoursFromApi(): Promise<string> {
  try {
    const res = await clientFetch<{ operationalHours?: string }>('/api/v1/time/current');
    return res?.operationalHours || '-';
  } catch (err) {
    console.error('Failed to fetch clinic operational hours from backend:', err);
    return '-';
  }
}

export async function fetchConsultationSessionsFromApi(): Promise<
  Array<{ id: string; label: string; timeRange: string; value: string }>
> {
  try {
    const res = await clientFetch<
      | Array<{ id: string; label: string; timeRange: string; value: string }>
      | { items?: Array<{ id: string; label: string; timeRange: string; value: string }> }
    >('/api/v1/schedules/reference/sessions');
    return Array.isArray(res) ? res : res?.items || [];
  } catch (err) {
    console.error('Failed to fetch consultation sessions from backend:', err);
    return [];
  }
}

export function normalizeQueueStatus(
  rawStatus?: string | null,
  ticketStatus?: string | null
): QueueStatus {
  const normApt = (rawStatus || '').toUpperCase();
  const normTicket = (ticketStatus || '').toUpperCase();

  if (normApt === QUEUE_STATUS.IN_SERVICE || normTicket === QUEUE_STATUS.IN_SERVICE) {
    return QUEUE_STATUS.IN_SERVICE;
  }
  if (normApt === QUEUE_STATUS.CALLED || normTicket === QUEUE_STATUS.CALLED) {
    return QUEUE_STATUS.CALLED;
  }
  if (normApt === QUEUE_STATUS.COMPLETED || normTicket === QUEUE_STATUS.COMPLETED) {
    return QUEUE_STATUS.COMPLETED;
  }
  if (normApt === QUEUE_STATUS.CANCELLED || normTicket === QUEUE_STATUS.CANCELLED) {
    return QUEUE_STATUS.CANCELLED;
  }
  if (
    normApt === QUEUE_STATUS.NO_SHOW ||
    normTicket === QUEUE_STATUS.NO_SHOW ||
    normApt === 'SKIPPED' ||
    normApt === 'LATE'
  ) {
    return QUEUE_STATUS.NO_SHOW;
  }
  if (normApt === QUEUE_STATUS.WAITING || normTicket === QUEUE_STATUS.WAITING) {
    if (normApt === 'BOOKED' && normTicket !== QUEUE_STATUS.WAITING) {
      return 'BOOKED';
    }
    return QUEUE_STATUS.WAITING;
  }

  return (normApt || normTicket) as QueueStatus;
}

function mapBackendQueueItemToFrontend(item: Record<string, unknown>, isUser = false): QueueItem {
  const rawStatus = typeof item.status === 'string' ? item.status : '';
  const ticketStatus = typeof item.ticketStatus === 'string' ? item.ticketStatus : '';
  const status = normalizeQueueStatus(rawStatus, ticketStatus);

  const rawEtaRange =
    typeof item.etaRange === 'string'
      ? item.etaRange
      : typeof item.eta_range === 'string'
        ? item.eta_range
        : null;

  let computedEta = rawEtaRange || '';
  if (!computedEta && item.estimatedStartAt) {
    const estStart = formatClinicTime(String(item.estimatedStartAt));
    if (item.estimatedEndAt) {
      const estEnd = formatClinicTime(String(item.estimatedEndAt));
      computedEta = `${estStart} - ${estEnd}`;
    } else {
      computedEta = `~${estStart}`;
    }
  }

  const startTime =
    typeof item.scheduledStartTime === 'string' ? formatClinicTime(item.scheduledStartTime) : '';
  const endTime =
    typeof item.scheduledEndTime === 'string' ? formatClinicTime(item.scheduledEndTime) : '';
  const fallbackSchedule =
    startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || '-';

  // Samakan paradigma estimasi dengan halaman appointment pasien / admin:
  const estimatedTime = computedEta || fallbackSchedule;

  return {
    id: String(item.id),
    queue_number: String(item.queueNumber || '-'),
    appointment_id: item.appointmentId ? String(item.appointmentId) : undefined,
    patient_id: item.patientId ? String(item.patientId) : undefined,
    patient_user_id: item.patientUserId ? String(item.patientUserId) : undefined,
    parent_user_id: item.parentUserId ? String(item.parentUserId) : undefined,
    patient_name: String(item.patientName || 'Pasien'),
    patient_avatar: typeof item.patientAvatarUrl === 'string' ? item.patientAvatarUrl : '',
    doctor_name: String(item.doctorName || '-'),
    poli: String(item.poliklinikName || 'Poli Umum'),
    estimated_time: estimatedTime,
    eta_range: rawEtaRange || (computedEta || null),
    estimated_start_at: item.estimatedStartAt ? String(item.estimatedStartAt) : null,
    estimated_end_at: item.estimatedEndAt ? String(item.estimatedEndAt) : null,
    scheduled_start_time: typeof item.scheduledStartTime === 'string' ? item.scheduledStartTime : null,
    scheduled_end_time: typeof item.scheduledEndTime === 'string' ? item.scheduledEndTime : null,
    status,
    is_user: isUser,
    called_time: item.calledAt ? formatClinicTime(String(item.calledAt)) : undefined,
    room: String(item.room || item.roomName || ''),
    call_count: Number(item.callCount ?? item.call_count ?? 0),
    called_at: item.calledAt ? String(item.calledAt) : null,
    actual_started_at: item.actualStartedAt ? String(item.actualStartedAt) : null,
    actual_completed_at: item.actualCompletedAt ? String(item.actualCompletedAt) : null,
    consultation_duration_formatted: item.consultationDurationFormatted
      ? String(item.consultationDurationFormatted)
      : undefined,
    consultation_elapsed_seconds:
      typeof item.consultationElapsedSeconds === 'number'
        ? item.consultationElapsedSeconds
        : undefined,
    estimated_duration_minutes:
      typeof item.estimatedDurationMinutes === 'number' ? item.estimatedDurationMinutes : undefined
  };
}

export async function getDailyQueuesFromApi(params?: {
  poliklinikId?: string;
  date?: string;
  session?: string;
}): Promise<QueueItem[]> {
  const query = new URLSearchParams();
  if (params?.poliklinikId) query.set('poliklinikId', params.poliklinikId);
  if (params?.date) query.set('date', params.date);
  if (params?.session) query.set('session', params.session);

  const qs = query.toString();
  const endpoint = `/api/v1/appointments/queue/daily${qs ? `?${qs}` : ''}`;
  try {
    const res = await clientFetch<
      Record<string, unknown>[] | { items?: Record<string, unknown>[] }
    >(endpoint);
    const list = Array.isArray(res) ? res : res?.items || [];
    return list.map((item) => mapBackendQueueItemToFrontend(item, false));
  } catch (err: unknown) {
    console.error('Failed to fetch daily queues from backend:', err);
    return [];
  }
}

export async function getMyQueueFromApi(params?: { poliklinikId?: string }): Promise<QueueItem[]> {
  const query = new URLSearchParams();
  if (params?.poliklinikId) query.set('poliklinikId', params.poliklinikId);

  const qs = query.toString();
  const endpoint = `/api/v1/appointments/queue/my${qs ? `?${qs}` : ''}`;
  try {
    const res = await clientFetch<
      Record<string, unknown>[] | { items?: Record<string, unknown>[] }
    >(endpoint);
    const list = Array.isArray(res) ? res : res?.items || [];
    return list.map((item) => mapBackendQueueItemToFrontend(item, false));
  } catch (err: unknown) {
    console.error('Failed to fetch patient queue from backend:', err);
    return [];
  }
}

export async function getDisplayQueueFromApi(params?: {
  poliklinikId?: string;
  date?: string;
}): Promise<QueueItem[]> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.poliklinikId) query.set('poliklinikId', params.poliklinikId);
  const qs = query.toString();
  const endpoint = `/api/v1/appointments/queue/display${qs ? `?${qs}` : ''}`;
  try {
    const display = await clientFetch<{
      currentTicket?: {
        queueNumber?: string;
        patientName?: string;
        roomName?: string;
        doctorName?: string;
        status?: string;
        calledAt?: string;
        startedAt?: string;
        consultationElapsedSeconds?: number;
        consultationDurationFormatted?: string;
        etaRange?: string;
        estimatedStartAt?: string;
        estimatedEndAt?: string;
      } | null;
      nextTickets?: Array<{
        queueNumber?: string;
        patientName?: string;
        poliklinikName?: string;
        etaRange?: string;
        estimatedStartAt?: string;
        estimatedEndAt?: string;
      }>;
    }>(endpoint);

    const items: QueueItem[] = [];
    if (display?.currentTicket) {
      const isCurInService =
        display.currentTicket.status === QUEUE_STATUS.IN_SERVICE ||
        Boolean(display.currentTicket.startedAt);
      const estTime =
        display.currentTicket.etaRange ||
        (isCurInService ? 'Sedang Diperiksa' : 'Sedang Dipanggil');
      items.push({
        id: 'display-current',
        queue_number: display.currentTicket.queueNumber || '-',
        patient_name: display.currentTicket.patientName || 'Pasien',
        doctor_name: display.currentTicket.doctorName || '-',
        poli: display.currentTicket.roomName || 'Poli',
        estimated_time: estTime,
        eta_range: display.currentTicket.etaRange || null,
        estimated_start_at: display.currentTicket.estimatedStartAt || null,
        estimated_end_at: display.currentTicket.estimatedEndAt || null,
        status: isCurInService ? QUEUE_STATUS.IN_SERVICE : QUEUE_STATUS.CALLED,
        called_time: display.currentTicket.calledAt
          ? formatClinicTime(display.currentTicket.calledAt)
          : undefined,
        room: display.currentTicket.roomName || '',
        called_at: display.currentTicket.calledAt ? String(display.currentTicket.calledAt) : null,
        actual_started_at: display.currentTicket.startedAt
          ? String(display.currentTicket.startedAt)
          : null,
        actual_completed_at: null,
        consultation_duration_formatted: display.currentTicket.consultationDurationFormatted,
        consultation_elapsed_seconds: display.currentTicket.consultationElapsedSeconds
      });
    }
    if (Array.isArray(display?.nextTickets)) {
      display.nextTickets.forEach((t, idx) => {
        items.push({
          id: `display-next-${idx}`,
          queue_number: t.queueNumber || '-',
          patient_name: t.patientName || 'Pasien',
          doctor_name: '-',
          poli: t.poliklinikName || 'Poli',
          estimated_time: t.etaRange || 'Menunggu',
          eta_range: t.etaRange || null,
          estimated_start_at: t.estimatedStartAt || null,
          estimated_end_at: t.estimatedEndAt || null,
          status: QUEUE_STATUS.WAITING,
          room: (t as { roomName?: string }).roomName || '',
          actual_started_at: null,
          actual_completed_at: null
        });
      });
    }
    return items;
  } catch (err: unknown) {
    console.error('Failed to fetch display queues from backend:', err);
    return [];
  }
}

export async function callPatientQueue(appointmentId: string): Promise<unknown> {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/call`, { method: 'POST' });
}

export async function respondPatientQueue(appointmentId: string): Promise<unknown> {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/respond`, { method: 'POST' });
}

export async function noShowPatientQueue(appointmentId: string): Promise<unknown> {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/no-show`, { method: 'POST' });
}

export async function completePatientQueue(appointmentId: string): Promise<unknown> {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/complete`, {
    method: 'POST'
  });
}
