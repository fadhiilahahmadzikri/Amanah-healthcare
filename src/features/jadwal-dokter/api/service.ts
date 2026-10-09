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
  DoctorOccupancyOverviewResponse,
  ScheduleReferenceOptionsData
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
  date?: string;
  startTime?: string;
  endTime?: string;
  excludePractitionerId?: string;
}): Promise<ClinicRoom[]> {
  const qs = new URLSearchParams();
  if (params?.poliklinikId) qs.set('poliklinikId', params.poliklinikId);
  if (params?.clinicUnitId) qs.set('clinicUnitId', params.clinicUnitId);
  if (params?.date) qs.set('date', params.date);
  if (params?.startTime) qs.set('startTime', params.startTime);
  if (params?.endTime) qs.set('endTime', params.endTime);
  if (params?.excludePractitionerId) qs.set('excludePractitionerId', params.excludePractitionerId);
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
): Promise<DoctorOccupancyOverviewResponse | null> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const res = await clientFetch<
    { data?: DoctorOccupancyOverviewResponse } | DoctorOccupancyOverviewResponse
  >(`/api/v1/schedules/occupancy-overview${q ? `?${q}` : ''}`);
  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return (res as DoctorOccupancyOverviewResponse) ?? null;
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

export async function getDoctorShiftPatients(
  doctorId: string,
  params: { date: string; sessionShift?: string; status?: string; search?: string }
): Promise<AdminSessionPatientsData> {
  const qs = new URLSearchParams();
  qs.set('date', params.date);
  if (params.sessionShift) qs.set('sessionShift', params.sessionShift);
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  const q = qs.toString();
  const res = await clientFetch<{
    data?: {
      sessionId?: string;
      shift?: string;
      date?: string;
      accumulatedCapacity?: number;
      accumulatedAvailableSlots?: number;
      accumulatedBookedCount?: number;
      sessions?: Array<{
        startTime?: string;
        endTime?: string;
        patients?: AdminSessionPatientsData['patients'];
      }>;
      patients?: AdminSessionPatientsData['patients'];
    };
  }>(`/api/v1/admin/doctor-schedules/${doctorId}/patients${q ? `?${q}` : ''}`);
  const raw = res && 'data' in res && res.data ? res.data : undefined;
  const patients =
    raw?.patients ||
    (Array.isArray(raw?.sessions) ? raw.sessions.flatMap((s) => s.patients || []) : []);
  return {
    sessionId: raw?.sessionId || '',
    sessionLabel: raw?.shift || params.sessionShift || '',
    shift: raw?.shift || params.sessionShift || '',
    scheduleDate: raw?.date || params.date,
    startTime: raw?.sessions?.[0]?.startTime || '00:00',
    endTime: raw?.sessions?.[raw?.sessions?.length - 1]?.endTime || '23:59',
    capacity: raw?.accumulatedCapacity ?? 0,
    availableSlots: raw?.accumulatedAvailableSlots ?? 0,
    bookedCount: raw?.accumulatedBookedCount ?? patients.length,
    clinicRoom: null,
    patients
  };
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

export async function getScheduleReferenceOptions(): Promise<ScheduleReferenceOptionsData> {
  const res = await clientFetch<
    ScheduleReferenceOptionsData | { data?: ScheduleReferenceOptionsData }
  >('/api/v1/admin/doctor-schedules/filter-options');
  if (res && typeof res === 'object' && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleReferenceOptionsData;
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

export async function createDoctorSession(
  doctorId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  const url = doctorId
    ? `/api/v1/admin/doctor-schedules/${doctorId}/sessions`
    : '/api/v1/admin/doctor-schedules/sessions';
  return await clientFetch<ApiMessageResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateDoctorSession(
  doctorId: string,
  sessionId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  const url = doctorId
    ? `/api/v1/admin/doctor-schedules/${doctorId}/sessions/${sessionId}`
    : `/api/v1/admin/doctor-schedules/sessions/${sessionId}`;
  return await clientFetch<ApiMessageResponse>(url, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteDoctorSession(
  doctorId: string,
  sessionId: string
): Promise<ApiMessageResponse> {
  const url = doctorId
    ? `/api/v1/admin/doctor-schedules/${doctorId}/sessions/${sessionId}`
    : `/api/v1/admin/doctor-schedules/sessions/${sessionId}`;
  return await clientFetch<ApiMessageResponse>(url, {
    method: 'DELETE'
  });
}

export async function rescheduleDoctorSession(
  doctorId: string,
  sessionId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(
    `/api/v1/admin/doctor-schedules/${doctorId}/sessions/${sessionId}/reschedule`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function updateDoctorDuration(
  doctorId: string,
  payload: unknown
): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>(
    `/api/v1/admin/doctor-schedules/${doctorId}/duration`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );
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
    method: 'POST'
  });
}

export async function updateScheduleDaySettings(payload: unknown): Promise<ApiMessageResponse> {
  return await clientFetch<ApiMessageResponse>('/api/v1/schedules/day-settings', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export interface DoctorRosterSessionItem {
  sessionId: string;
  sessionCode: string;
  sessionLabel: string;
  timeRange: string;
  isActive: boolean;
  preferredRoomId: string | null;
  preferredRoomName: string | null;
}

export interface DoctorRosterDayItem {
  dow: number;
  dayCode: string;
  dayName: string;
  sortOrder: number;
  isWeekend: boolean;
  isOperatingDay: boolean;
  sessions: DoctorRosterSessionItem[];
}

export interface DoctorRosterOverview {
  doctorId: string;
  doctorName: string;
  specialization: string;
  days: DoctorRosterDayItem[];
}

export interface UpdateDoctorRosterPayload {
  assignments: {
    dow: number;
    sessionId: string;
    isActive: boolean;
    preferredRoomId?: string | null;
  }[];
  reason?: string;
}

export interface DoctorScheduleHistoryItem {
  id: string;
  doctorId: string;
  scheduleDate: string | null;
  sessionLabel: string | null;
  dayName: string | null;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string | null;
  changedByName: string | null;
  createdAt: string;
}

export interface DoctorScheduleHistoryResult {
  items: DoctorScheduleHistoryItem[];
  total: number;
}

export async function getDoctorRosterAssignments(doctorId: string): Promise<DoctorRosterOverview> {
  return await clientFetch<DoctorRosterOverview>(
    `/api/v1/admin/doctor-schedules/${doctorId}/assignments`
  );
}

export async function updateDoctorRosterAssignments(
  doctorId: string,
  payload: UpdateDoctorRosterPayload
): Promise<DoctorRosterOverview> {
  return await clientFetch<DoctorRosterOverview>(
    `/api/v1/admin/doctor-schedules/${doctorId}/assignments`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
}

export async function getDoctorScheduleHistory(
  doctorId: string,
  limit = 20,
  offset = 0
): Promise<DoctorScheduleHistoryResult> {
  return await clientFetch<DoctorScheduleHistoryResult>(
    `/api/v1/admin/doctor-schedules/${doctorId}/history?limit=${limit}&offset=${offset}`
  );
}
