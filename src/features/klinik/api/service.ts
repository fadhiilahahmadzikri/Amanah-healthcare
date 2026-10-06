import { clientFetch } from '@/lib/client-fetch';
import { AppointmentStatusDescriptor } from '@/constants/appointment-status.constants';
import { Appointment, Doctor, QueueItem, AppointmentFormData } from './types';
import { getAmanahServiceByName } from '../constants/services';
import { getClinicalPractitionersAction } from '@/features/jadwal-dokter/api/doctor-schedule-actions';

const LOCAL_STORAGE_KEY_APPOINTMENTS = 'amanah_appointments_v4';

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
    const list = await clientFetch<Record<string, unknown>[]>(endpoint);
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      const rawStatus = String(item.status || '');
      const ticketStatus = String(item.ticketStatus || '');
      const statusDesc = AppointmentStatusDescriptor.from(
        ticketStatus === 'called' ? 'IN_SERVICE' : rawStatus || ticketStatus
      );
      const status = statusDesc.queueDisplayStatus;

      const startTime =
        typeof item.scheduledStartTime === 'string' ? item.scheduledStartTime.slice(0, 5) : '08:00';
      const endTime =
        typeof item.scheduledEndTime === 'string' ? item.scheduledEndTime.slice(0, 5) : '08:30';

      return {
        id: String(item.id),
        queue_number: String(item.queueNumber || '-'),
        patient_name: String(item.patientName || 'Pasien'),
        patient_avatar: '',
        doctor_name: String(item.doctorName || '-'),
        poli: String(item.poliklinikName || 'Poli Umum'),
        estimated_time: `${startTime} - ${endTime}`,
        status,
        is_user: false,
        called_time: item.calledAt
          ? new Date(String(item.calledAt)).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : undefined,
        room: String(item.room || item.roomName || 'Ruang Periksa'),
        call_count: Number(item.callCount ?? item.call_count ?? 0),
        called_at: item.calledAt ? String(item.calledAt) : null,
        actual_started_at: item.actualStartedAt
          ? String(item.actualStartedAt)
          : item.calledAt
            ? String(item.calledAt)
            : null,
        actual_completed_at: item.actualCompletedAt ? String(item.actualCompletedAt) : null,
        estimated_duration_minutes:
          typeof item.estimatedDurationMinutes === 'number' ? item.estimatedDurationMinutes : 30
      };
    });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; statusCode?: number; message?: string };
    const isForbidden =
      errorObj?.status === 403 ||
      errorObj?.statusCode === 403 ||
      String(errorObj?.message || '')
        .toLowerCase()
        .includes('forbidden');

    if (isForbidden) {
      try {
        const displayQuery = new URLSearchParams();
        if (params?.date) displayQuery.set('date', params.date);
        if (params?.poliklinikId) displayQuery.set('poliklinikId', params.poliklinikId);
        const qsDisplay = displayQuery.toString();
        const displayEndpoint = `/api/v1/appointments/queue/display${qsDisplay ? `?${qsDisplay}` : ''}`;
        const display = await clientFetch<{
          currentTicket?: {
            queueNumber?: string;
            patientName?: string;
            roomName?: string;
            doctorName?: string;
            calledAt?: string;
          } | null;
          nextTickets?: Array<{
            queueNumber?: string;
            patientName?: string;
            poliklinikName?: string;
          }>;
        }>(displayEndpoint);

        const items: QueueItem[] = [];
        if (display?.currentTicket) {
          items.push({
            id: 'display-current',
            queue_number: display.currentTicket.queueNumber || '-',
            patient_name: display.currentTicket.patientName || 'Pasien',
            doctor_name: display.currentTicket.doctorName || '-',
            poli: display.currentTicket.roomName || 'Poli',
            estimated_time: 'Sedang Berlangsung',
            status: 'DIPANGGIL',
            called_time: display.currentTicket.calledAt
              ? new Date(display.currentTicket.calledAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : undefined,
            room: display.currentTicket.roomName || 'Ruang Periksa',
            called_at: display.currentTicket.calledAt
              ? String(display.currentTicket.calledAt)
              : null,
            actual_started_at: display.currentTicket.calledAt
              ? String(display.currentTicket.calledAt)
              : null,
            actual_completed_at: null,
            estimated_duration_minutes: 30
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
              status: 'MENUNGGU',
              room: t.poliklinikName || 'Ruang Periksa',
              actual_started_at: null,
              actual_completed_at: null,
              estimated_duration_minutes: 30
            });
          });
        }
        return items;
      } catch {
        return [];
      }
    }

    console.error('Failed to fetch daily queues from backend:', err);
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
  return await clientFetch(`/api/v1/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'SELESAI' })
  });
}

export const loadStoredAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_APPOINTMENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Appointment[];
    }
  } catch (e) {
    console.warn('Could not read appointments from localStorage', e);
  }
  return [];
};

export const saveAppointmentsToStorage = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.warn('Could not save appointments to localStorage', e);
  }
};

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
    status: 'PENDING',
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
    doctor_name: appointment.doctor_name,
    poli: formData.service || 'Poli Umum',
    estimated_time: appointment.time || '08:00 - 08:30',
    status: 'MENUNGGU',
    is_user: true,
    room: 'Ruang Periksa 1'
  };

  return { appointment, queueItem };
};
