import 'server-only';

import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import { AppError } from '@/core/errors/app-error';
import { mapToAdminAppointment } from './mapper';
import type {
  AppointmentFilters,
  AppointmentResponse,
  BackendAppointmentRecord,
  QueueNavigationResponse
} from './types';

async function resolveActiveToken(): Promise<string | null> {
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

export async function getAppointmentsOnServer(
  filters: AppointmentFilters
): Promise<AppointmentResponse> {
  const token = await resolveActiveToken();
  if (!token) {
    throw AppError.unauthenticated('Sesi admin tidak valid atau telah berakhir');
  }

  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;

  const queryParams: Record<string, unknown> = {
    page,
    limit
  };

  if (filters.status) {
    queryParams.status = Array.isArray(filters.status) ? filters.status[0] : filters.status;
  }

  if (filters.poliklinikId) {
    queryParams.poliklinikId = filters.poliklinikId;
  } else if (filters.poli) {
    queryParams.poliklinikName = Array.isArray(filters.poli) ? filters.poli[0] : filters.poli;
  }

  const sName = filters.serviceName || filters.service;
  if (sName) {
    queryParams.serviceName = Array.isArray(sName) ? sName[0] : sName;
  }

  if (filters.date) {
    queryParams.date = filters.date;
  }

  if (filters.doctorName) {
    queryParams.doctorName = Array.isArray(filters.doctorName)
      ? filters.doctorName[0]
      : filters.doctorName;
  }

  if (filters.doctorId) {
    queryParams.doctorId = filters.doctorId;
  }

  if (filters.roomName) {
    queryParams.roomName = Array.isArray(filters.roomName) ? filters.roomName[0] : filters.roomName;
  }

  if (filters.roomId) {
    queryParams.roomId = filters.roomId;
  }

  if (filters.session) {
    queryParams.session = filters.session;
  }

  if (filters.search && filters.search.trim().length > 0) {
    queryParams.search = filters.search.trim();
  }

  const response = await httpClient.request<
    { data?: BackendAppointmentRecord[]; meta?: { total?: number } } | BackendAppointmentRecord[]
  >(paths.appointments.list(), z.any(), {
    method: 'GET',
    query: queryParams,
    tokenOverride: token,
    cache: 'no-store'
  });

  const rawList: BackendAppointmentRecord[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  const appointments = rawList.map(mapToAdminAppointment);

  const totalCount =
    !Array.isArray(response) && typeof response?.meta?.total === 'number'
      ? response.meta.total
      : appointments.length;

  return {
    success: true,
    time: new Date().toISOString(),
    total_appointments: totalCount,
    offset: (page - 1) * limit,
    limit,
    appointments
  };
}

export async function getQueueNavigationOnServer(
  params?: { date?: string; session?: string }
): Promise<QueueNavigationResponse> {
  const token = await resolveActiveToken();
  if (!token) {
    throw AppError.unauthenticated('Sesi admin tidak valid atau telah berakhir');
  }

  const queryParams: Record<string, unknown> = {};
  if (params?.date) queryParams.date = params.date;
  if (params?.session) queryParams.session = params.session;

  return await httpClient.request<QueueNavigationResponse>(
    '/api/v1/appointments/queue-navigation',
    z.any(),
    {
      method: 'GET',
      query: queryParams,
      tokenOverride: token,
      cache: 'no-store'
    }
  );
}
