import { clientFetch } from '@/lib/client-fetch';
import type {
  DoctorSchedule,
  DoctorScheduleFilters,
  DoctorScheduleDetailParams,
  DoctorScheduleListResponse,
  ScheduleDayStatus
} from './types';
import type {
  ClinicRoom,
  AdminDoctorScheduleFilterOptionsResponse,
  RescheduleEligibilityData,
  AdminSessionPatientsData,
  ScheduleContextsResponse,
  ScheduleProjectionResponse,
  ScheduleFormBootstrapResponse,
  ScheduleSlotAvailabilityResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';

/** Minimal shape returned by endpoints that include a human-readable message in their body. */
export interface ApiMessageResponse {
  message?: string;
  [key: string]: unknown;
}

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
    const res = await clientFetch<{
      doctors?: DoctorSchedule[];
      data?: DoctorSchedule[];
      total_doctors?: number;
      meta?: { total_doctors?: number; total_pages?: number; page?: number; limit?: number };
    }>(endpoint);

    const doctors = res.doctors ?? res.data ?? [];
    const total = res.total_doctors ?? res.meta?.total_doctors ?? doctors.length;
    return {
      doctors,
      total_doctors: total,
      meta: {
        page: res.meta?.page ?? filters.page ?? 1,
        limit: res.meta?.limit ?? filters.limit ?? 6,
        total_doctors: total,
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
): Promise<DoctorSchedule | null> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.month) query.set('month', params.month);

  const qs = query.toString();
  const endpoint = `/api/v1/admin/doctor-schedules/${id}${qs ? `?${qs}` : ''}`;

  try {
    const res = await clientFetch<{ data?: DoctorSchedule } | DoctorSchedule>(endpoint);
    if ('data' in res && res.data) {
      return res.data;
    }
    return (res as DoctorSchedule) ?? null;
  } catch (err) {
    console.error(`Error fetching doctor schedule ${id}:`, err);
    return null;
  }
}

export async function updateDoctorSchedule(
  id: string,
  payload: Partial<DoctorSchedule>
): Promise<DoctorSchedule> {
  return await clientFetch<DoctorSchedule>(`/api/v1/admin/doctor-schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorDayStatus(
  doctorId: string,
  date: string,
  status: ScheduleDayStatus,
  reason?: string
): Promise<DoctorSchedule> {
  return await clientFetch<DoctorSchedule>(
    `/api/v1/admin/doctor-schedules/${doctorId}/day-status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ date, status, reason })
    }
  );
}

export { isDoctorOnLeaveOnDay } from '../utils/leave-calculator';

export async function getDoctorScheduleByName(
  name: string,
  params?: DoctorScheduleDetailParams
): Promise<DoctorSchedule | null> {
  const all = await getDoctorSchedules({ search: name, limit: 10, ...params });
  return (
    all.doctors.find((d) => (d.nama_dokter || '').toLowerCase().includes(name.toLowerCase())) ||
    all.doctors[0] ||
    null
  );
}

export async function getDoctorScheduleFilterOptions(): Promise<
  AdminDoctorScheduleFilterOptionsResponse['data']
> {
  const res = await clientFetch<
    | AdminDoctorScheduleFilterOptionsResponse
    | { data: AdminDoctorScheduleFilterOptionsResponse['data'] }
  >('/api/v1/admin/doctor-schedules/filter-options');
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as unknown as AdminDoctorScheduleFilterOptionsResponse['data'];
}

export async function getClinicRooms(params?: {
  poliklinikId?: string;
  clinicUnitId?: string;
}): Promise<ClinicRoom[]> {
  const qs = new URLSearchParams();
  if (params?.poliklinikId) qs.set('poliklinikId', params.poliklinikId);
  if (params?.clinicUnitId) qs.set('clinicUnitId', params.clinicUnitId);
  const q = qs.toString();
  const res = await clientFetch<ClinicRoom[] | { data?: ClinicRoom[] }>(
    `/api/v1/schedules/reference/rooms${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && Array.isArray(res.data)) {
    return res.data;
  }
  return (Array.isArray(res) ? res : []) as ClinicRoom[];
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
  return await clientFetch(`/api/v1/admin/doctor-schedules/occupancy${q ? `?${q}` : ''}`);
}

export async function checkRescheduleEligibility(
  id: string,
  sessionId: string,
  params?: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  }
): Promise<RescheduleEligibilityData> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const res = await clientFetch<{ data?: RescheduleEligibilityData } | RescheduleEligibilityData>(
    `/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}/reschedule-eligibility${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as RescheduleEligibilityData;
}

export async function getSessionPatients(
  doctorId: string,
  sessionId: string,
  filters: { status?: string; search?: string } = {}
): Promise<AdminSessionPatientsData> {
  const qs = new URLSearchParams();
  if (filters.status) qs.set('status', filters.status);
  if (filters.search) qs.set('search', filters.search);
  const q = qs.toString();
  const res = await clientFetch<{ data?: AdminSessionPatientsData } | AdminSessionPatientsData>(
    `/api/v1/admin/doctor-schedules/${doctorId}/sessions/${sessionId}/patients${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as AdminSessionPatientsData;
}

export async function getScheduleProjection(
  params?: Record<string, unknown>
): Promise<ScheduleProjectionResponse> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const res = await clientFetch<ScheduleProjectionResponse | { data?: ScheduleProjectionResponse }>(
    `/api/v1/admin/doctor-schedules/projection${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleProjectionResponse;
}

export async function getScheduleReferenceOptions(): Promise<unknown> {
  return await clientFetch('/api/v1/admin/doctor-schedules/reference-options');
}

export async function getScheduleContexts(
  params?: string | Record<string, unknown>
): Promise<ScheduleContextsResponse> {
  const qs = new URLSearchParams();
  if (typeof params === 'string') {
    if (params) qs.set('date', params);
  } else if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const res = await clientFetch<ScheduleContextsResponse | { data?: ScheduleContextsResponse }>(
    `/api/v1/admin/doctor-schedules/contexts${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && Array.isArray(res.data)) {
    return res.data;
  }
  return (Array.isArray(res) ? res : []) as ScheduleContextsResponse;
}

export async function getScheduleFormBootstrap(
  params?: Record<string, unknown>
): Promise<ScheduleFormBootstrapResponse> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const res = await clientFetch<
    ScheduleFormBootstrapResponse | { data?: ScheduleFormBootstrapResponse }
  >(`/api/v1/admin/doctor-schedules/form-bootstrap${q ? `?${q}` : ''}`);
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleFormBootstrapResponse;
}

export async function getScheduleSlotAvailability(
  params: Record<string, unknown>
): Promise<ScheduleSlotAvailabilityResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const res = await clientFetch<
    ScheduleSlotAvailabilityResponse | { data?: ScheduleSlotAvailabilityResponse }
  >(`/api/v1/admin/doctor-schedules/slot-availability?${qs.toString()}`);
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleSlotAvailabilityResponse;
}

export async function createDoctorSession(
  _doctorId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>('/api/v1/admin/doctor-schedules/sessions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorSession(
  _doctorId: string,
  sessionId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(
    `/api/v1/admin/doctor-schedules/sessions/${sessionId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
}

export async function deleteDoctorSession(
  _doctorId: string,
  sessionId: string
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(
    `/api/v1/admin/doctor-schedules/sessions/${sessionId}`,
    {
      method: 'DELETE'
    }
  );
}

export async function rescheduleDoctorSession(
  _doctorId: string,
  _sessionId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>('/api/v1/admin/doctor-schedules/reschedule', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorDuration(
  _doctorId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>('/api/v1/admin/doctor-schedules/duration', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function cancelAppointment(
  appointmentId: string,
  payload?: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {})
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(`/api/v1/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function callPatientAppointment(appointmentId: string): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(`/api/v1/appointments/${appointmentId}/call`, {
    method: 'POST'
  });
}

export async function completePatientAppointment(
  appointmentId: string
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(`/api/v1/appointments/${appointmentId}/complete`, {
    method: 'PATCH'
  });
}

export async function updateScheduleDaySettings(payload: unknown): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>('/api/v1/admin/doctor-schedules/day-settings', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
