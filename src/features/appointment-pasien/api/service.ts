import { clientFetch } from '@/lib/client-fetch';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { computeSummary, mapToAdminAppointment, emptyAppointmentSummary } from './mapper';
import type {
  AdminAppointment,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentSummary,
  AppointmentDetailResponse,
  AppointmentStatus,
  BackendAppointmentRecord,
  DoctorCandidatesResult,
  RoomCandidateItem
} from './types';

export async function getAdminAppointments(
  filters: AppointmentFilters,
  signal?: AbortSignal
): Promise<AppointmentResponse> {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;

  const queryParams: Record<string, unknown> = {
    page,
    limit
  };

  if (filters.status && typeof filters.status === 'string') {
    queryParams.status = filters.status;
  }

  const response = await clientFetch<
    { data?: BackendAppointmentRecord[]; meta?: { total?: number } } | BackendAppointmentRecord[]
  >('/api/v1/appointments', {
    query: queryParams,
    signal
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

export async function getAdminAppointmentSummary(): Promise<AppointmentSummary> {
  try {
    const response = await clientFetch<
      { data?: BackendAppointmentRecord[] } | BackendAppointmentRecord[]
    >('/api/v1/appointments', {
      query: { limit: 200 }
    });

    const rawList: BackendAppointmentRecord[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    return computeSummary(rawList.map(mapToAdminAppointment));
  } catch {
    return emptyAppointmentSummary;
  }
}

export async function getAdminAppointmentById(
  id: number | string
): Promise<AppointmentDetailResponse> {
  try {
    const response = await clientFetch<
      { data?: BackendAppointmentRecord } | BackendAppointmentRecord
    >(`/api/v1/appointments/${id}`);
    const rawData =
      response && typeof response === 'object' && 'data' in response && response.data
        ? (response.data as BackendAppointmentRecord)
        : (response as BackendAppointmentRecord);

    if (!rawData || !rawData.id) {
      return {
        success: false,
        appointment: null,
        message: `Appointment dengan ID ${id} tidak ditemukan`
      };
    }

    return {
      success: true,
      appointment: mapToAdminAppointment(rawData)
    };
  } catch (error) {
    return {
      success: false,
      appointment: null,
      message: `Gagal memuat appointment dengan ID ${id}: ${String(error)}`
    };
  }
}

export async function updateAdminLiveStatus(id: number | string, status: AppointmentStatus) {
  try {
    let rawUpdated: BackendAppointmentRecord | undefined;

    if (status === APPOINTMENT_STATUS.IN_SERVICE) {
      const res = await startService(id);
      rawUpdated = res as BackendAppointmentRecord;
    } else if (status === APPOINTMENT_STATUS.COMPLETED) {
      const res = await completeService(id);
      rawUpdated = res as BackendAppointmentRecord;
    } else if (status === APPOINTMENT_STATUS.CANCELLED) {
      const res = await cancelAppointmentAction(id);
      rawUpdated = res as BackendAppointmentRecord;
    } else {
      const updated = await clientFetch<
        { data?: BackendAppointmentRecord } | BackendAppointmentRecord
      >(`/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      rawUpdated =
        updated && typeof updated === 'object' && 'data' in updated && updated.data
          ? (updated.data as BackendAppointmentRecord)
          : (updated as BackendAppointmentRecord);
    }

    return {
      success: true,
      message: 'Status janji temu berhasil diperbarui',
      appointment: rawUpdated ? mapToAdminAppointment(rawUpdated) : undefined
    };
  } catch (error: unknown) {
    const err = error as { status?: number; statusCode?: number; message?: string };
    const isConflict =
      err?.status === 409 ||
      err?.statusCode === 409 ||
      String(err?.message).includes('409') ||
      String(err).includes('Conflict');
    const errorMsg = isConflict
      ? 'Status janji temu telah diperbarui oleh pengguna lain (409 Conflict). Silakan muat ulang halaman.'
      : err?.message || String(error);
    throw new Error(errorMsg, { cause: error });
  }
}

export async function deleteAdminAppointment(id: number | string) {
  try {
    await clientFetch(`/api/v1/appointments/${id}`, {
      method: 'DELETE'
    });

    return {
      success: true,
      message: 'Appointment berhasil dihapus'
    };
  } catch (error) {
    return {
      success: false,
      message: `Gagal menghapus appointment: ${String(error)}`
    };
  }
}

export interface AppointmentCallAttempt {
  id: string;
  appointmentId: string;
  queueTicketId: string | null;
  attemptNumber: number;
  status: 'called' | 'responded' | 'no_show' | 'no_response' | string;
  calledBy: string | null;
  calledAt: string;
  respondedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export async function getAppointmentCallAttempts(
  appointmentId: string
): Promise<AppointmentCallAttempt[]> {
  try {
    const list = await clientFetch<AppointmentCallAttempt[]>(
      `/api/v1/appointments/${appointmentId}/call-attempts`
    );
    return Array.isArray(list) ? list : [];
  } catch (err: unknown) {
    console.warn(`Failed to load call attempts for ${appointmentId}:`, err);
    return [];
  }
}

export async function getDoctorCandidates(appointmentId: string): Promise<DoctorCandidatesResult> {
  return clientFetch<DoctorCandidatesResult>(
    `/api/v1/admin/appointments/${appointmentId}/candidates/doctors`
  );
}

export async function getRoomCandidates(appointmentId: string): Promise<RoomCandidateItem[]> {
  const response = await clientFetch<RoomCandidateItem[]>(
    `/api/v1/admin/appointments/${appointmentId}/candidates/rooms`
  );
  return Array.isArray(response) ? response : [];
}

export async function changeAppointmentDoctor(
  appointmentId: string,
  doctorId: string,
  options?: { closeOldSchedule?: boolean; reason?: string }
): Promise<{ success: boolean; message: string; appointment?: AdminAppointment }> {
  try {
    const response = await clientFetch<{
      success: boolean;
      message: string;
      data: BackendAppointmentRecord;
    }>(`/api/v1/admin/appointments/${appointmentId}/doctor`, {
      method: 'PATCH',
      body: JSON.stringify({
        doctorId,
        closeOldSchedule: options?.closeOldSchedule,
        reason: options?.reason
      })
    });

    return {
      success: true,
      message: response.message,
      appointment: response.data ? mapToAdminAppointment(response.data) : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function changeAppointmentRoom(
  appointmentId: string,
  roomId: string
): Promise<{ success: boolean; message: string; appointment?: AdminAppointment }> {
  try {
    const response = await clientFetch<{
      success: boolean;
      message: string;
      data: BackendAppointmentRecord;
    }>(`/api/v1/admin/appointments/${appointmentId}/room`, {
      method: 'PATCH',
      body: JSON.stringify({ roomId })
    });

    return {
      success: true,
      message: response.message,
      appointment: response.data ? mapToAdminAppointment(response.data) : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function callPatient(appointmentId: string | number, notes?: string) {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/call`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes || 'Panggilan pemeriksaan' })
  });
}

export async function startService(appointmentId: string | number) {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/start`, {
    method: 'POST'
  });
}

export async function completeService(appointmentId: string | number) {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/complete`, {
    method: 'POST'
  });
}

export async function cancelAppointmentAction(appointmentId: string | number, reason?: string) {
  return await clientFetch(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}
