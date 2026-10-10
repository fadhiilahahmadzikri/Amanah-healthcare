import 'server-only';

import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import {
  adminDoctorScheduleListResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  clinicalPractitionersResponseSchema,
  adminDoctorScheduleFilterOptionsSchema,
  updateAdminDayByDateResponseSchema,
  clinicRoomsResponseSchema,
  type ClinicRoom,
  type AdminDoctorScheduleListResponse,
  type AdminDoctorScheduleDetailResponse,
  type UpdateAdminDoctorSchedulePayload,
  type UpdateAdminDayStatusPayload,
  type UpdateAdminDayByDatePayload,
  type UpdateAdminDayByDateResponse,
  type UpdateAdminDoctorSessionPayload,
  type AdminDoctorScheduleFilterOptionsResponse,
  type ClinicalPractitionersResponse,
  scheduleDaySettingsResponseSchema,
  type ScheduleDaySettingsPayload,
  type ScheduleDaySettingsResponse,
  scheduleReferenceOptionsResponseSchema,
  type ScheduleReferenceOptionsResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { z } from 'zod';
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
      .filter((st): st is 'OPEN' | 'CLOSED' => st === 'OPEN' || st === 'CLOSED');

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
