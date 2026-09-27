import { apiClient } from '@/lib/api-client';
import type {
  DoctorSchedule,
  DoctorScheduleFilters,
  DoctorScheduleDetailParams,
  DoctorScheduleListResponse,
  ScheduleDayStatus
} from './types';

export async function getDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<DoctorScheduleListResponse> {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.search) query.set('search', filters.search);
  if (filters.date) query.set('date', filters.date);
  if (filters.month && filters.month !== 'ALL') query.set('month', filters.month);
  if (filters.poli && filters.poli.length > 0) query.set('poli', filters.poli.join(','));
  if (filters.status && filters.status.length > 0) query.set('status', filters.status.join(','));

  const qs = query.toString();
  const endpoint = `/api/v1/admin/doctor-schedules${qs ? `?${qs}` : ''}`;

  try {
    const res = await apiClient<{
      data?: DoctorSchedule[];
      meta?: { total_doctors?: number; total_pages?: number; page?: number; limit?: number };
    }>(endpoint);

    const doctors = res.data ?? [];
    return {
      doctors,
      total_doctors: res.meta?.total_doctors ?? doctors.length,
      meta: {
        page: res.meta?.page ?? filters.page ?? 1,
        limit: res.meta?.limit ?? filters.limit ?? 6,
        total_doctors: res.meta?.total_doctors ?? doctors.length,
        total_pages: res.meta?.total_pages ?? 1
      }
    };
  } catch (err) {
    console.error('Error fetching admin doctor schedules:', err);
    return {
      doctors: [],
      total_doctors: 0,
      meta: { page: 1, limit: 6, total_doctors: 0, total_pages: 0 }
    };
  }
}

export async function getDoctorScheduleById(
  id: string,
  params?: DoctorScheduleDetailParams
): Promise<DoctorSchedule | undefined> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.month) query.set('month', params.month);

  const qs = query.toString();
  const endpoint = `/api/v1/admin/doctor-schedules/${id}${qs ? `?${qs}` : ''}`;

  try {
    const res = await apiClient<{ data?: DoctorSchedule } | DoctorSchedule>(endpoint);
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as DoctorSchedule;
  } catch (err) {
    console.error(`Error fetching doctor schedule ${id}:`, err);
    return undefined;
  }
}

export async function updateDoctorSchedule(
  id: string,
  payload: Partial<DoctorSchedule>
): Promise<DoctorSchedule> {
  return await apiClient<DoctorSchedule>(`/api/v1/admin/doctor-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorDayStatus(
  doctorId: string,
  day: number,
  status: ScheduleDayStatus,
  date?: string
): Promise<DoctorSchedule> {
  return await apiClient<DoctorSchedule>(`/api/v1/admin/doctor-schedules/${doctorId}/day-status`, {
    method: 'PATCH',
    body: JSON.stringify({ day, status, date })
  });
}

export { isDoctorOnLeaveOnDay } from '../utils/leave-calculator';

export async function getDoctorScheduleByName(
  name: string,
  params?: DoctorScheduleDetailParams
): Promise<DoctorSchedule | undefined> {
  const all = await getDoctorSchedules({ search: name, limit: 10, ...params });
  return (
    all.doctors.find((d) => d.name.toLowerCase().includes(name.toLowerCase())) || all.doctors[0]
  );
}

export async function getDoctorScheduleFilterOptions(): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/filter-options');
}

export async function getClinicRooms(params?: {
  poliklinikId?: string;
  clinicUnitId?: string;
}): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.poliklinikId) qs.set('poliklinikId', params.poliklinikId);
  if (params?.clinicUnitId) qs.set('clinicUnitId', params.clinicUnitId);
  const q = qs.toString();
  return await apiClient(`/api/v1/admin/doctor-schedules/rooms${q ? `?${q}` : ''}`);
}

export async function getDoctorOccupancyOverview(
  params?: Record<string, unknown>
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return await apiClient(`/api/v1/admin/doctor-schedules/occupancy${q ? `?${q}` : ''}`);
}

export async function checkRescheduleEligibility(
  params: Record<string, unknown>
): Promise<unknown> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  return await apiClient(`/api/v1/admin/doctor-schedules/reschedule-eligibility?${qs.toString()}`);
}

export async function getSessionPatients(sessionId: string): Promise<unknown> {
  return await apiClient(`/api/v1/admin/doctor-schedules/sessions/${sessionId}/patients`);
}

export async function getScheduleProjection(params?: Record<string, unknown>): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return await apiClient(`/api/v1/admin/doctor-schedules/projection${q ? `?${q}` : ''}`);
}

export async function getScheduleReferenceOptions(): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/reference-options');
}

export async function getScheduleContexts(params?: Record<string, unknown>): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return await apiClient(`/api/v1/admin/doctor-schedules/contexts${q ? `?${q}` : ''}`);
}

export async function getScheduleFormBootstrap(params?: Record<string, unknown>): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return await apiClient(`/api/v1/admin/doctor-schedules/form-bootstrap${q ? `?${q}` : ''}`);
}

export async function getScheduleSlotAvailability(
  params: Record<string, unknown>
): Promise<unknown> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  return await apiClient(`/api/v1/admin/doctor-schedules/slot-availability?${qs.toString()}`);
}

export async function createDoctorSession(payload: unknown): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/sessions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorSession(sessionId: string, payload: unknown): Promise<unknown> {
  return await apiClient(`/api/v1/admin/doctor-schedules/sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteDoctorSession(sessionId: string): Promise<unknown> {
  return await apiClient(`/api/v1/admin/doctor-schedules/sessions/${sessionId}`, {
    method: 'DELETE'
  });
}

export async function rescheduleDoctorSession(payload: unknown): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/reschedule', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorDuration(payload: unknown): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/duration', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function cancelAppointment(
  appointmentId: string,
  payload?: unknown
): Promise<unknown> {
  return await apiClient(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {})
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  payload: unknown
): Promise<unknown> {
  return await apiClient(`/api/v1/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function callPatientAppointment(appointmentId: string): Promise<unknown> {
  return await apiClient(`/api/v1/appointments/${appointmentId}/call`, {
    method: 'POST'
  });
}

export async function completePatientAppointment(appointmentId: string): Promise<unknown> {
  return await apiClient(`/api/v1/appointments/${appointmentId}/complete`, {
    method: 'PATCH'
  });
}

export async function updateScheduleDaySettings(payload: unknown): Promise<unknown> {
  return await apiClient('/api/v1/admin/doctor-schedules/day-settings', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
