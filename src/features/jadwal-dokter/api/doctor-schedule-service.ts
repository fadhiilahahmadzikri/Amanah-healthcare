import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import {
  adminDoctorScheduleListResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  clinicalPractitionersResponseSchema,
  type AdminDoctorScheduleListResponse,
  type AdminDoctorScheduleDetailResponse,
  type UpdateAdminDoctorSchedulePayload,
  type UpdateAdminDayStatusPayload,
  type CreateAdminDoctorSessionPayload,
  type ClinicalPractitionersResponse
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { z } from 'zod';
import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';

export async function resolveActiveToken(): Promise<string | null> {
  let token = await getAccessTokenCookie();

  if (!token) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.session?.token) {
        token = session.session.token;
      }
    } catch {
      // Ignore fallback error
    }
  }

  return token;
}

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
  if (filters.status && filters.status.length > 0) query.status = filters.status.join(',');

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
