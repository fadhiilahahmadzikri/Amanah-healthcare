import { clientFetch } from '@/lib/client-fetch';
import {
  Appointment,
  Doctor,
  QueueItem,
  AppointmentFormData,
  QueueStatus,
  QUEUE_STATUS,
  APPOINTMENT_STATUS
} from './types';
import { getAmanahServiceByName } from '../constants/services';
import { getClinicalPractitionersAction } from '@/features/jadwal-dokter/api/doctor-schedule-actions';

export async function fetchClinicalDoctors(serviceName?: string): Promise<Doctor[]> {
  try {
    const list = await getClinicalPractitionersAction({ service: serviceName });
    return list.map((doc) => ({
      name: doc.name,
      spec: doc.spec,
      avatar: doc.avatar || '',
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

export const getDoctorByName = (name: string): Doctor | undefined => {
  return getDoctors().find((doc) => doc.name === name);
};

export const getDoctorsByService = (serviceName?: string): Doctor[] => {
  const all = getDoctors();
  if (!serviceName) return all;

  const srvInfo = getAmanahServiceByName(serviceName);
  const targetSpec = srvInfo ? srvInfo.shortName.toLowerCase() : serviceName.toLowerCase();

  return all.filter((doc) => {
    const docSpec = doc.spec.toLowerCase();
    const docLoc = doc.location.toLowerCase();
    return (
      docSpec.includes(targetSpec) ||
      targetSpec.includes(docSpec) ||
      docLoc.includes(targetSpec) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(targetSpec)))
    );
  });
};

export const getTimeSlots = (): string[] => {
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
    return res?.operationalHours || '08:00 - 21:00';
  } catch (err) {
    console.error('Failed to fetch clinic operational hours from backend:', err);
    return '08:00 - 21:00';
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
  const candidate = normApt || normTicket;

  if (candidate === QUEUE_STATUS.IN_SERVICE) return QUEUE_STATUS.IN_SERVICE;
  if (candidate === QUEUE_STATUS.CALLED) return QUEUE_STATUS.CALLED;
  if (candidate === QUEUE_STATUS.COMPLETED) return QUEUE_STATUS.COMPLETED;
  if (candidate === QUEUE_STATUS.CANCELLED) return QUEUE_STATUS.CANCELLED;
  if (candidate === QUEUE_STATUS.NO_SHOW || candidate === 'SKIPPED' || candidate === 'LATE') {
    return QUEUE_STATUS.NO_SHOW;
  }
  if (candidate === QUEUE_STATUS.WAITING) return QUEUE_STATUS.WAITING;

  return candidate as QueueStatus;
}

function mapBackendQueueItemToFrontend(item: Record<string, unknown>, isUser = false): QueueItem {
  const rawStatus = typeof item.status === 'string' ? item.status : '';
  const ticketStatus = typeof item.ticketStatus === 'string' ? item.ticketStatus : '';
  const status = normalizeQueueStatus(rawStatus, ticketStatus);

  const startTime =
    typeof item.scheduledStartTime === 'string' ? item.scheduledStartTime.slice(0, 5) : '';
  const endTime =
    typeof item.scheduledEndTime === 'string' ? item.scheduledEndTime.slice(0, 5) : '';
  const estimatedTime =
    startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || '-';

  return {
    id: String(item.id),
    queue_number: String(item.queueNumber || '-'),
    patient_name: String(item.patientName || 'Pasien'),
    patient_avatar: '',
    doctor_name: String(item.doctorName || '-'),
    poli: String(item.poliklinikName || 'Poli Umum'),
    estimated_time: estimatedTime,
    status,
    is_user: isUser,
    called_time: item.calledAt
      ? new Date(String(item.calledAt)).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : undefined,
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
      typeof item.estimatedDurationMinutes === 'number'
        ? item.estimatedDurationMinutes
        : undefined
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
    return list.map((item) => mapBackendQueueItemToFrontend(item, true));
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
      } | null;
      nextTickets?: Array<{
        queueNumber?: string;
        patientName?: string;
        poliklinikName?: string;
      }>;
    }>(endpoint);

    const items: QueueItem[] = [];
    if (display?.currentTicket) {
      const isCurInService =
        display.currentTicket.status === QUEUE_STATUS.IN_SERVICE ||
        Boolean(display.currentTicket.startedAt);
      items.push({
        id: 'display-current',
        queue_number: display.currentTicket.queueNumber || '-',
        patient_name: display.currentTicket.patientName || 'Pasien',
        doctor_name: display.currentTicket.doctorName || '-',
        poli: display.currentTicket.roomName || 'Poli',
        estimated_time: isCurInService ? 'Sedang Diperiksa' : 'Sedang Dipanggil',
        status: isCurInService ? QUEUE_STATUS.IN_SERVICE : QUEUE_STATUS.CALLED,
        called_time: display.currentTicket.calledAt
          ? new Date(display.currentTicket.calledAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })
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
          estimated_time: 'Menunggu',
          status: QUEUE_STATUS.WAITING,
          room: (t as any).roomName || '',
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

export const loadStoredAppointments = (): Appointment[] => [];

export const saveAppointmentsToStorage = (_appointments: Appointment[]): void => {};

export const loadStoredQueues = (): QueueItem[] => {
  return [];
};

export const saveQueuesToStorage = (_queues: QueueItem[]): void => {};

export const createAppointmentRecord = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): Appointment => {
  const nextNumber = existingList.length + 1;
  const newId = `apt-${String(nextNumber).padStart(4, '0')}`;
  const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = new Date().toISOString();

  return {
    id: newId,
    booking_code: `KLINIK-${randomCode}`,
    patient_name: formData.patientName || '',
    patient_email: formData.patientEmail || '',
    patient_avatar: '',
    doctor_name: formData.doctor,
    date: formData.dateStr,
    time: formData.timeSlot,
    complaint: formData.complaint,
    status: APPOINTMENT_STATUS.BOOKED,
    visit_type: formData.visitType,
    service: formData.service,
    medical_flow: formData.medicalFlow,
    medical_intake: formData.medicalIntake,
    created_at: timestamp,
    updated_at: timestamp
  };
};

export const createAppointmentRecordWithQueue = (
  formData: AppointmentFormData,
  existingList: Appointment[]
): { appointment: Appointment; queueItem: QueueItem } => {
  const appointment = createAppointmentRecord(formData, existingList);
  const queueItem: QueueItem = {
    id: appointment.id,
    queue_number: appointment.booking_code.replace('KLINIK-', 'A-'),
    patient_name: appointment.patient_name,
    patient_avatar: '',
    doctor_name: appointment.doctor_name || '',
    poli: formData.service || 'Poli Umum',
    estimated_time: appointment.time || '-',
    status: QUEUE_STATUS.WAITING,
    is_user: true,
    room: appointment.room_name || ''
  };

  return { appointment, queueItem };
};
