import 'server-only';

import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import { AppError } from '@/core/errors/app-error';
import { mapBackendPatient } from './service';
import type { PatientFilters, PatientsResponse, PatientSummary } from './types';

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

export async function getPatientsOnServer(
  filters: PatientFilters
): Promise<PatientsResponse> {
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

  if (filters.search && filters.search.trim()) {
    queryParams.search = filters.search.trim();
  }

  if (filters.gender) {
    const rawGender = Array.isArray(filters.gender) ? filters.gender[0] : filters.gender;
    if (rawGender === 'Laki-laki' || rawGender === 'male') {
      queryParams.gender = 'male';
    } else if (rawGender === 'Perempuan' || rawGender === 'female') {
      queryParams.gender = 'female';
    }
  }

  if (filters.status) {
    const rawStatus = Array.isArray(filters.status) ? filters.status[0] : filters.status;
    if (rawStatus === 'Aktif' || rawStatus === 'active') {
      queryParams.status = 'active';
    } else if (rawStatus === 'Nonaktif' || rawStatus === 'inactive') {
      queryParams.status = 'inactive';
    }
  }

  const response = await httpClient.request<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    summary: {
      totalPatients: number;
      totalAppointments: number;
      totalCompletedVisits: number;
      totalMissedOrCancelled: number;
    };
  }>(paths.patients.directory(), z.any(), {
    method: 'GET',
    query: queryParams,
    tokenOverride: token,
    cache: 'no-store'
  });

  const rawList = Array.isArray(response?.data) ? response.data : [];
  const patients = rawList.map(mapBackendPatient);

  const summary: PatientSummary = {
    total: response?.summary?.totalPatients ?? response?.meta?.total ?? patients.length,
    active: response?.summary?.totalPatients ?? patients.length,
    inactive: 0,
    total_appointments: response?.summary?.totalAppointments ?? 0,
    completed_visits: response?.summary?.totalCompletedVisits ?? 0,
    missed_or_cancelled: response?.summary?.totalMissedOrCancelled ?? 0
  };

  return {
    success: true,
    time: new Date().toISOString(),
    total_patients: response?.meta?.total ?? patients.length,
    offset: (page - 1) * limit,
    limit,
    patients,
    summary
  };
}
