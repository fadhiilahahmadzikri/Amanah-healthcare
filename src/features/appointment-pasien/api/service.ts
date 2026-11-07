import { clientFetch } from '@/lib/client-fetch';
import { AppError } from '@/core/errors/app-error';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { mapToAdminAppointment } from './mapper';
import type {
  AdminAppointment,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentDetailResponse,
  AppointmentStatus,
  BackendAppointmentRecord,
  ChangeDoctorResponseDto,
  ChangeRoomResponseDto,
  CheckInQrResponse,
  DoctorCandidatesResult,
  PerformCheckInPayload,
  PerformCheckInResponse,
  QueueNavigationResponse,
  RescheduleAppointmentDto,
  RescheduleAppointmentResponseDto,
  RoomCandidateItem,
  BulkAssignDoctorPayload,
  BulkAssignRoomPayload,
  BulkCancelAppointmentsPayload,
  BulkRescheduleAppointmentsPayload,
  BulkOperationResponseDto
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

  if (filters.status) {
    queryParams.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
  }

  if (filters.poliklinikId) {
    queryParams.poliklinikId = filters.poliklinikId;
  } else if (filters.poliklinikName) {
    queryParams.poliklinikName = Array.isArray(filters.poliklinikName)
      ? filters.poliklinikName[0]
      : filters.poliklinikName;
  }

  const sName = filters.serviceName;
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
    queryParams.doctorId = Array.isArray(filters.doctorId)
      ? filters.doctorId.find((id) => Boolean(id && String(id).trim()))
      : filters.doctorId;
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
    const isConflict = error instanceof AppError && error.status === 409;
    const errorMsg = isConflict
      ? 'Status janji temu telah diperbarui oleh pengguna lain (409 Conflict). Silakan muat ulang halaman.'
      : error instanceof Error
        ? error.message
        : String(error);
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
    const response = await clientFetch<ChangeDoctorResponseDto>(
      `/api/v1/admin/appointments/${appointmentId}/doctor`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          doctorId,
          closeOldSchedule: options?.closeOldSchedule,
          reason: options?.reason
        })
      }
    );

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
    const response = await clientFetch<ChangeRoomResponseDto>(
      `/api/v1/admin/appointments/${appointmentId}/room`,
      {
        method: 'PATCH',
        body: JSON.stringify({ roomId })
      }
    );

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

export interface NoShowResponse {
  requeued?: boolean;
  noShow?: boolean;
  attemptNumber: number;
  remainingAttempts?: number;
  status: string;
}

export async function noShowPatient(
  appointmentId: string | number,
  notes?: string
): Promise<NoShowResponse> {
  return await clientFetch<NoShowResponse>(`/api/v1/appointments/${appointmentId}/no-show`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes || 'Pasien tidak merespons panggilan' })
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

export async function generateCheckInQr(
  appointmentId: string | number
): Promise<CheckInQrResponse> {
  return await clientFetch<CheckInQrResponse>(`/api/v1/appointments/${appointmentId}/check-in-qr`, {
    method: 'POST'
  });
}

export async function performCheckIn(
  payload: PerformCheckInPayload
): Promise<PerformCheckInResponse> {
  return await clientFetch<PerformCheckInResponse>('/api/v1/appointments/check-in', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function rescheduleAppointmentAction(
  appointmentId: string | number,
  payload: RescheduleAppointmentDto
): Promise<RescheduleAppointmentResponseDto> {
  return await clientFetch<RescheduleAppointmentResponseDto>(
    `/api/v1/appointments/${appointmentId}/reschedule`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function getQueueNavigation(
  params?: { date?: string; session?: string },
  signal?: AbortSignal
): Promise<QueueNavigationResponse> {
  const queryParams: Record<string, unknown> = {};
  if (params?.date) queryParams.date = params.date;
  if (params?.session) queryParams.session = params.session;

  return await clientFetch<QueueNavigationResponse>('/api/v1/appointments/queue-navigation', {
    query: queryParams,
    signal
  });
}

export async function bulkAssignDoctor(
  payload: BulkAssignDoctorPayload
): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>(
    '/api/v1/admin/appointments/bulk/assign-doctor',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function bulkAssignRoom(
  payload: BulkAssignRoomPayload
): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>(
    '/api/v1/admin/appointments/bulk/assign-room',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function bulkCancelAppointments(
  payload: BulkCancelAppointmentsPayload
): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>('/api/v1/admin/appointments/bulk/cancel', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function bulkProposeCancelAppointments(payload: {
  appointmentIds: string[];
  reason: string;
}): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>(
    '/api/v1/admin/appointments/bulk/propose-cancel',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function bulkRescheduleAppointments(
  payload: BulkRescheduleAppointmentsPayload
): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>('/api/v1/admin/appointments/bulk/reschedule', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function bulkProposeRescheduleAppointments(payload: {
  appointmentIds: string[];
  targetDate: string;
  targetSessionId: string;
  targetDoctorId?: string;
  targetRoomId?: string;
  reason: string;
}): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>(
    '/api/v1/admin/appointments/bulk/propose-reschedule',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function bulkRevertProposals(payload: {
  appointmentIds: string[];
  reason?: string;
}): Promise<BulkOperationResponseDto> {
  return await clientFetch<BulkOperationResponseDto>(
    '/api/v1/admin/appointments/bulk/revert-proposal',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function revertAppointmentProposal(
  appointmentId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  return await clientFetch<{ success: boolean; message: string }>(
    `/api/v1/admin/appointments/${appointmentId}/revert-proposal`,
    {
      method: 'POST',
      body: JSON.stringify({ reason })
    }
  );
}

export interface ProposeReschedulePayload {
  targetDate: string;
  targetSessionId: string;
  targetDoctorId?: string;
  targetRoomId?: string;
  reason: string;
}

export async function proposeRescheduleAppointment(
  appointmentId: string,
  payload: ProposeReschedulePayload
): Promise<{ message: string; proposalId: string }> {
  return await clientFetch<{ message: string; proposalId: string }>(
    `/api/v1/admin/appointments/${appointmentId}/propose-reschedule`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function proposeCancellationAppointment(
  appointmentId: string,
  reason: string
): Promise<{ message: string; proposalId: string }> {
  return await clientFetch<{ message: string; proposalId: string }>(
    `/api/v1/admin/appointments/${appointmentId}/propose-cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ reason })
    }
  );
}
