import { clientFetch } from '@/lib/client-fetch';
import type {
  AdminAppointment,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentSummary,
  AppointmentDetailResponse,
  LiveStatus,
  BackendAppointmentRecord,
  DoctorCandidatesResult,
  RoomCandidateItem
} from './types';

const emptyAppointmentSummary: AppointmentSummary = {
  total: 0,
  sudah_datang: 0,
  sudah_buat_janji: 0,
  menunggu: 0,
  sedang_periksa: 0,
  selesai: 0,
  tidak_ada_dokter: 0
};

export async function getAdminAppointments(
  filters: AppointmentFilters
): Promise<AppointmentResponse> {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;

  try {
    const queryParams: Record<string, unknown> = {
      page,
      limit
    };

    if (filters.status && typeof filters.status === 'string') {
      queryParams.status = mapLiveStatusToBackendStatus(filters.status as LiveStatus);
    }

    const response = await clientFetch<
      { data?: BackendAppointmentRecord[]; meta?: { total?: number } } | BackendAppointmentRecord[]
    >('/api/v1/appointments', {
      query: queryParams
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
        poliFilter.some((p) => p.toLowerCase() === apt.layanan_poli.toLowerCase())
      );
    }

    if (filters.search) {
      const query = filters.search.trim().toLowerCase();
      appointments = appointments.filter((apt) =>
        [
          apt.pasien,
          apt.id_pasien,
          apt.no_antrian,
          apt.dokter,
          apt.layanan_poli,
          apt.keluhan_pasien
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
  } catch (error) {
    console.warn('Failed to load admin appointments from backend:', error);
    return {
      success: false,
      time: new Date().toISOString(),
      total_appointments: 0,
      offset: 0,
      limit,
      appointments: [],
      summary: emptyAppointmentSummary
    };
  }
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

export async function updateAdminLiveStatus(id: number | string, status: LiveStatus) {
  const backendStatus = mapLiveStatusToBackendStatus(status);

  try {
    const updated = await clientFetch<
      { data?: BackendAppointmentRecord } | BackendAppointmentRecord
    >(`/api/v1/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: backendStatus })
    });
    const rawUpdated =
      updated && typeof updated === 'object' && 'data' in updated && updated.data
        ? (updated.data as BackendAppointmentRecord)
        : (updated as BackendAppointmentRecord);

    if (!rawUpdated || !rawUpdated.id) {
      return {
        success: false,
        message: 'Gagal memperbarui status live antrean'
      };
    }

    return {
      success: true,
      message: 'Status live antrean berhasil diperbarui',
      appointment: mapToAdminAppointment(rawUpdated)
    };
  } catch (error) {
    return {
      success: false,
      message: `Gagal memperbarui status live antrean: ${String(error)}`
    };
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

export async function getDoctorCandidates(
  appointmentId: string
): Promise<DoctorCandidatesResult> {
  return clientFetch<DoctorCandidatesResult>(
    `/api/v1/admin/appointments/${appointmentId}/candidates/doctors`
  );
}

export async function getRoomCandidates(
  appointmentId: string
): Promise<RoomCandidateItem[]> {
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
        reason: options?.reason,
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

function computeSummary(records: AdminAppointment[]): AppointmentSummary {
  if (records.length === 0) return emptyAppointmentSummary;

  const countOf = (status: string) =>
    records.filter((r) => r.live_status.toUpperCase() === status).length;

  return {
    total: records.length,
    sudah_datang: countOf('SUDAH DATANG'),
    sudah_buat_janji: countOf('SUDAH BUAT JANJI'),
    menunggu: countOf('MENUNGGU'),
    sedang_periksa: countOf('SEDANG PERIKSA'),
    selesai: countOf('SELESAI'),
    tidak_ada_dokter: countOf('TIDAK ADA DOKTER')
  };
}

function mapToAdminAppointment(item: BackendAppointmentRecord): AdminAppointment {
  const liveStatus = mapBackendStatusToLiveStatus(item.status);
  const patientName = item.patientName || item.patientProfile?.fullName || 'Pasien Amanah';
  const doctorName =
    item.doctorName || item.practitioner?.staffProfile?.fullName || 'Dokter Amanah';
  const poliName = item.poliklinikName || item.clinicRoom?.clinicUnit?.name || 'Poli Umum';
  const queueNo = item.queueNumber || item.queueTickets?.[0]?.queueNumber || '-';
  const bookingDate =
    item.appointmentDate ||
    (item.createdAt ? String(item.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const bookingTime = item.scheduledStartTime || item.session || '-';

  return {
    id: item.id,
    no_antrian: queueNo,
    nomor_antrian: queueNo,
    pasien: patientName,
    nama_pasien: patientName,
    nama_lengkap: patientName,
    id_pasien: item.patientId || String(item.id),
    avatar: '', // Zero avatar strictly enforced
    tanggal_booking: bookingDate,
    tanggal_reservasi: bookingDate,
    jam_booking: bookingTime,
    jam_slot_booking: bookingTime,
    dokter: doctorName,
    dokter_tujuan: doctorName,
    layanan_poli: poliName,
    poliklinik_layanan: poliName,
    live_status: liveStatus,
    status_kunjungan: liveStatus,
    tipe_kunjungan: item.visitType || 'Pemeriksaan Baru',
    jenis_kelamin: item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
    nomor_telepon_wa: item.phone || '-',
    email_pasien: item.email || '-',
    keluhan_pasien: item.complaint || '-',
    created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    updated_at: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
  };
}

function mapBackendStatusToLiveStatus(status?: string): LiveStatus {
  switch (status?.toUpperCase()) {
    case 'SUDAH_DATANG':
      return 'SUDAH DATANG';
    case 'SEDANG_DIPERIKSA':
    case 'SEDANG_PERIKSA':
    case 'IN_SERVICE':
      return 'SEDANG PERIKSA';
    case 'MENUNGGU':
    case 'WAITING':
    case 'CHECKED_IN':
      return 'MENUNGGU';
    case 'SELESAI':
    case 'COMPLETED':
      return 'SELESAI';
    case 'BATAL':
    case 'CANCELLED':
    case 'TIDAK_ADA_DOKTER':
      return 'TIDAK ADA DOKTER';
    case 'SUDAH_BUAT_JANJI':
    default:
      return 'SUDAH BUAT JANJI';
  }
}

function mapLiveStatusToBackendStatus(status: LiveStatus): string {
  switch (status) {
    case 'SUDAH DATANG':
      return 'SUDAH_DATANG';
    case 'SEDANG PERIKSA':
      return 'SEDANG_DIPERIKSA';
    case 'MENUNGGU':
      return 'MENUNGGU';
    case 'SELESAI':
      return 'SELESAI';
    case 'TIDAK ADA DOKTER':
      return 'BATAL';
    case 'SUDAH BUAT JANJI':
    default:
      return 'SUDAH_BUAT_JANJI';
  }
}
