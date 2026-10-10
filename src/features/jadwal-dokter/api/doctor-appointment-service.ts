import 'server-only';

import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import {
  adminSessionPatientsResponseSchema,
  cancelAppointmentResponseSchema,
  callAppointmentResponseSchema,
  completeAppointmentResponseSchema,
  type AdminSessionPatientsResponse,
  type CancelAppointmentPayload,
  type CancelAppointmentResponse,
  type CallAppointmentResponse,
  type CompleteAppointmentResponse,
  type UpdateAppointmentStatusPayload
} from '@/server/contracts/schedules/doctor-schedules.dto';
import { z } from 'zod';
import { resolveActiveToken } from './token-resolver';

export async function fetchAdminSessionPatients(
  doctorId: string,
  sessionId: string,
  queryFilters?: { status?: string; search?: string; date?: string }
): Promise<AdminSessionPatientsResponse> {
  const token = await resolveActiveToken();
  const query: Record<string, unknown> = {
    status: queryFilters?.status || 'all'
  };
  if (queryFilters?.search) {
    query.search = queryFilters.search;
  }
  if (queryFilters?.date) {
    query.date = queryFilters.date;
  }

  const response = await httpClient.request(
    paths.doctorSchedules.sessionPatients(doctorId, sessionId),
    adminSessionPatientsResponseSchema,
    {
      method: 'GET',
      query,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function cancelAdminAppointment(
  appointmentId: string,
  payload: CancelAppointmentPayload
): Promise<CancelAppointmentResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.appointments.cancel(appointmentId),
    cancelAppointmentResponseSchema,
    {
      method: 'PATCH',
      body: payload,
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function updateAdminAppointmentStatus(
  appointmentId: string,
  payload: UpdateAppointmentStatusPayload
): Promise<unknown> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(paths.appointments.status(appointmentId), z.any(), {
    method: 'PATCH',
    body: payload,
    tokenOverride: token,
    cache: 'no-store'
  });

  return response;
}

export async function callPatientAppointment(
  appointmentId: string
): Promise<CallAppointmentResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.appointments.call(appointmentId),
    callAppointmentResponseSchema,
    {
      method: 'POST',
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}

export async function completePatientAppointment(
  appointmentId: string
): Promise<CompleteAppointmentResponse> {
  const token = await resolveActiveToken();

  const response = await httpClient.request(
    paths.appointments.complete(appointmentId),
    completeAppointmentResponseSchema,
    {
      method: 'POST',
      tokenOverride: token,
      cache: 'no-store'
    }
  );

  return response;
}
