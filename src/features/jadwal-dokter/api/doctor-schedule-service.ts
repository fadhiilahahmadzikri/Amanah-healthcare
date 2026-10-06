import 'server-only';

import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import {
  adminDoctorScheduleListResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  clinicalPractitionersResponseSchema,
  adminDoctorScheduleFilterOptionsSchema,
  deleteAdminDoctorSessionResponseSchema,
  rescheduleAdminDoctorSessionResponseSchema,
  rescheduleEligibilityResponseSchema,
  updateAdminDayByDateResponseSchema,
  clinicRoomsResponseSchema,
  doctorOccupancyOverviewResponseSchema,
  type ClinicRoom,
  type DoctorOccupancyOverviewResponse,
  type AdminDoctorScheduleListResponse,
  type AdminDoctorScheduleDetailResponse,
  type UpdateAdminDoctorSchedulePayload,
  type UpdateAdminDayStatusPayload,
  type UpdateAdminDayByDatePayload,
  type UpdateAdminDayByDateResponse,
  type CreateAdminDoctorSessionPayload,
  type UpdateAdminDoctorSessionPayload,
  type DeleteAdminDoctorSessionResponse,
  type RescheduleAdminDoctorSessionPayload,
  type RescheduleAdminDoctorSessionResponse,
  type RescheduleEligibilityResponse,
  type UpdateAdminDoctorDurationPayload,
  type AdminDoctorScheduleFilterOptionsResponse,
  type ClinicalPractitionersResponse,
  scheduleContextsResponseSchema,
  scheduleDaySettingsResponseSchema,
  type ScheduleContextsResponse,
  type ScheduleDaySettingsPayload,
  type ScheduleDaySettingsResponse,
  scheduleProjectionResponseSchema,
  scheduleReferenceOptionsResponseSchema,
  type ScheduleProjectionResponse,
  type ScheduleReferenceOptionsResponse,
  scheduleSlotAvailabilityResponseSchema,
  type ScheduleSlotAvailabilityResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { z } from 'zod';
import { normalizeDateParam } from '../utils/shift-slot-builder';
import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';
import { resolveActiveToken } from './token-resolver';

export { resolveActiveToken };
export {
  fetchAdminSessionPatients,
  cancelAdminAppointment,
  updateAdminAppointmentStatus,
  callPatientAppointment,
  completePatientAppointment
} from './doctor-appointment-service';

export async function fetchAdminDoctorSchedules(
  filters: DoctorScheduleFilters = {}
): Promise<AdminDoctorScheduleListResponse['data']> {
  const token = await resolveActiveToken();

  const query: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 6
  };

  if (filters.search) query.search = filters.search;
  if (filters.month && filters.month !== 'ALL') query.month = filters.month;
  if (filters.date) query.date = filters.date;
  if (filters.poli && filters.poli.length > 0) query.poli = filters.poli.join(',');
  if (filters.status && filters.status.length > 0) {
    const validStatuses = filters.status
      .map((st) => st.trim().toUpperCase())
      .filter(
        (st): st is 'OPEN' | 'OCCUPIED' | 'CLOSED' =>
          st === 'OPEN' || st === 'OCCUPIED' || st === 'CLOSED'
      );

    if (validStatuses.length > 0) {
      query.status = validStatuses.join(',');
    }
  }

  const response = await httpClient.request(
    paths.doctorSchedules.list(),
    adminDoctorScheduleListResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function fetchAdminDoctorScheduleDetail(
  id: string,
  params?: DoctorScheduleDetailParams
): Promise<AdminDoctorScheduleDetailResponse['data']> {
  const token = await resolveActiveToken();

  const query: Record<string, unknown> = {};
  if (params?.month !== undefined) query.month = params.month;
  if (params?.year !== undefined) query.year = params.year;
  if (params?.date !== undefined) query.date = params.date;

  const response = await httpClient.request(
    paths.doctorSchedules.detail(id),
    adminDoctorScheduleDetailResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDoctorSchedule(
  id: string,
  payload: UpdateAdminDoctorSchedulePayload
): Promise<AdminDoctorScheduleDetailResponse['data']> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.update(id),
    adminDoctorScheduleDetailResponseSchema,
    {
      method: 'PUT',
      body: payload,
      tokenOverride: token
    }
  );

  return response.data;
}

export async function updateAdminDayStatus(
  id: string,
  payload: UpdateAdminDayStatusPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.doctorSchedules.updateDayStatus(id), z.any(), {
    method: 'PATCH',
    body: payload,
    tokenOverride: token
  });

  return response;
}

export async function createAdminDoctorSession(
  id: string,
  payload: CreateAdminDoctorSessionPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.doctorSchedules.createSession(id), z.any(), {
    method: 'POST',
    body: payload,
    tokenOverride: token
  });

  return response;
}

export async function fetchClinicalPractitioners(params?: {
  search?: string;
  specialtyId?: string;
  clinicUnitId?: string;
  date?: string;
  service?: string;
}): Promise<ClinicalPractitionersResponse['data']> {
  const response = await httpClient.request(
    paths.clinicalPractitioners.list(),
    clinicalPractitionersResponseSchema,
    {
      method: 'GET',
      query: params as Record<string, unknown>,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function fetchAdminDoctorScheduleFilterOptions(): Promise<
  AdminDoctorScheduleFilterOptionsResponse['data']
> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.filterOptions(),
    adminDoctorScheduleFilterOptionsSchema,
    {
      method: 'GET',
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDoctorSession(
  id: string,
  sessionId: string,
  payload: UpdateAdminDoctorSessionPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.updateSession(id, sessionId),
    z.any(),
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function deleteAdminDoctorSession(
  id: string,
  sessionId: string
): Promise<DeleteAdminDoctorSessionResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.deleteSession(id, sessionId),
    deleteAdminDoctorSessionResponseSchema,
    {
      method: 'DELETE',
      tokenOverride: token
    }
  );

  return response;
}

export async function rescheduleAdminDoctorSession(
  id: string,
  sessionId: string,
  payload: RescheduleAdminDoctorSessionPayload
): Promise<RescheduleAdminDoctorSessionResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.reschedule(id, sessionId),
    rescheduleAdminDoctorSessionResponseSchema,
    {
      method: 'POST',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function checkRescheduleEligibility(
  id: string,
  sessionId: string,
  params: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  } = {}
): Promise<RescheduleEligibilityResponse['data']> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.rescheduleEligibility(id, sessionId),
    rescheduleEligibilityResponseSchema,
    {
      method: 'GET',
      query: params as Record<string, unknown>,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response.data;
}

export async function updateAdminDayByDate(
  id: string,
  date: string,
  payload: UpdateAdminDayByDatePayload
): Promise<UpdateAdminDayByDateResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.doctorSchedules.dayByDate(id, date),
    updateAdminDayByDateResponseSchema,
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token
    }
  );

  return response;
}

export async function updateAdminDoctorDuration(
  id: string,
  payload: UpdateAdminDoctorDurationPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.doctorSchedules.duration(id), z.any(), {
    method: 'PATCH',
    body: payload,
    tokenOverride: token
  });

  return response;
}

export async function fetchClinicRooms(params?: {
  date?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ClinicRoom[]> {
  const token = await resolveActiveToken();
  const response = await httpClient.request(
    paths.schedules.referenceRooms(),
    clinicRoomsResponseSchema,
    {
      method: 'GET',
      query: params as Record<string, unknown>,
      tokenOverride: token,
      cache: 'no-store'
    }
  );
  return response;
}

export async function fetchScheduleProjection(params: {
  scheduleContextId?: string;
  startTime?: string;
  endTime?: string;
  practitionerId?: string;
  shift?: string;
  date?: string;
  slotsCount?: number;
  fillShift?: boolean;
}): Promise<ScheduleProjectionResponse> {
  const token = await resolveActiveToken();
  const query: Record<string, unknown> = {};
  if (params.scheduleContextId) query.scheduleContextId = params.scheduleContextId;
  if (params.date) query.date = params.date;
  if (params.startTime) query.startTime = params.startTime;
  if (params.endTime) query.endTime = params.endTime;
  if (params.practitionerId) query.practitionerId = params.practitionerId;
  if (params.shift) query.shift = params.shift;
  if (params.slotsCount !== undefined) query.slotsCount = params.slotsCount;
  if (params.fillShift !== undefined) query.fillShift = params.fillShift;

  const response = await httpClient.request(
    paths.schedules.projection(),
    scheduleProjectionResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function fetchScheduleReferenceOptions(): Promise<ScheduleReferenceOptionsResponse> {
  const token = await resolveActiveToken();
  const response = await httpClient.request(
    paths.schedules.referenceOptions(),
    scheduleReferenceOptionsResponseSchema,
    {
      method: 'GET',
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function fetchScheduleContexts(date?: string): Promise<ScheduleContextsResponse> {
  const token = await resolveActiveToken();
  const validDate = normalizeDateParam(date);
  const query: Record<string, unknown> = {
    date: validDate
  };

  const response = await httpClient.request(
    paths.schedules.contexts(),
    scheduleContextsResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function fetchDoctorOccupancyOverview(params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: {
    jam_mulai: string;
    jam_selesai: string;
    nama_sesi?: string;
    id?: string;
    status_sesi?: string;
    slot_tersedia?: number;
  }[];
}): Promise<DoctorOccupancyOverviewResponse> {
  const token = await resolveActiveToken();
  const query: Record<string, unknown> = {
    date: params.date,
    staffId: params.staffId
  };
  if (params.roomId) query.roomId = params.roomId;

  const response = await httpClient.request(
    paths.schedules.occupancyOverview(),
    doctorOccupancyOverviewResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );
  return response;
}

export async function updateScheduleDaySettings(
  payload: ScheduleDaySettingsPayload
): Promise<ScheduleDaySettingsResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.schedules.daySettings(),
    scheduleDaySettingsResponseSchema,
    {
      method: 'PUT',
      body: payload,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function fetchScheduleSlotAvailability(params: {
  date: string;
  shift: string;
  roomId: string;
  scheduleId?: string;
  staffId?: string;
}): Promise<ScheduleSlotAvailabilityResponse> {
  const token = await resolveActiveToken();
  const query: Record<string, unknown> = {
    date: params.date,
    shift: params.shift,
    roomId: params.roomId
  };
  if (params.scheduleId) query.scheduleId = params.scheduleId;
  if (params.staffId) query.staffId = params.staffId;

  const response = await httpClient.request(
    paths.schedules.slotAvailability(),
    scheduleSlotAvailabilityResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}
