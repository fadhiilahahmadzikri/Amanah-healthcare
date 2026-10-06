import 'server-only';

import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import { AppError } from '@/core/errors/app-error';
import { mapToAdminAppointment, computeSummary } from './mapper';
import type { AppointmentFilters, AppointmentResponse, BackendAppointmentRecord } from './types';

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

  if (filters.status && typeof filters.status === 'string') {
    queryParams.status = filters.status;
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

  let appointments = rawList.map(mapToAdminAppointment);

  if (filters.poli) {
    const poliFilter = Array.isArray(filters.poli) ? filters.poli : [filters.poli];
    appointments = appointments.filter((apt) =>
      poliFilter.some((p) => p.toLowerCase() === apt.poliklinikName.toLowerCase())
    );
  }

  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    appointments = appointments.filter((apt) =>
      [
        apt.patientName,
        apt.patientId,
        apt.queueNumber,
        apt.doctorName,
        apt.poliklinikName,
        apt.complaint
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  const totalCount =
    !Array.isArray(response) && typeof response?.meta?.total === 'number'
      ? response.meta.total
      : appointments.length;

  const summary = computeSummary(appointments);

  return {
    success: true,
    time: new Date().toISOString(),
    total_appointments: totalCount,
    offset: (page - 1) * limit,
    limit,
    appointments,
    summary
  };
}
