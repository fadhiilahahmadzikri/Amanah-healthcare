import { clientFetch } from '@/lib/client-fetch';
import type {
  MedicalRecordEntity,
  MedicalRecordFilterOptions,
  MedicalRecordListResponse,
  PatientAppointmentHistoryResponse
} from './types';

/**
 * Mengambil daftar seluruh rekam medis dengan paginasi, pencarian, dan filter tanggal.
 */
export async function getMedicalRecords(
  filters: MedicalRecordFilterOptions = {},
  signal?: AbortSignal
): Promise<MedicalRecordListResponse> {
  const query: Record<string, unknown> = {};

  if (filters.page) query.page = filters.page;
  if (filters.limit) query.limit = filters.limit;
  if (filters.search) query.search = filters.search.trim();
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.practitionerId) query.practitionerId = filters.practitionerId;
  if (filters.serviceId) query.serviceId = filters.serviceId;
  if (filters.status) query.status = filters.status;
  if (filters.startDate) query.startDate = filters.startDate;
  if (filters.endDate) query.endDate = filters.endDate;
  if (filters.cursor) query.cursor = filters.cursor;

  return clientFetch<MedicalRecordListResponse>('/api/v1/medical-records', {
    method: 'GET',
    query,
    signal
  });
}

/**
 * Mengambil detail rekam medis klinis berdasarkan ID encounter.
 */
export async function getMedicalRecordById(
  id: string,
  signal?: AbortSignal
): Promise<MedicalRecordEntity> {
  return clientFetch<MedicalRecordEntity>(`/api/v1/medical-records/${id}`, {
    method: 'GET',
    signal
  });
}

/**
 * Mengambil rekam jejak medis kronologis seluruh encounter milik satu pasien.
 */
export async function getMedicalRecordsByPatient(
  patientId: string,
  signal?: AbortSignal
): Promise<MedicalRecordEntity[]> {
  if (!patientId) return [];
  return clientFetch<MedicalRecordEntity[]>(`/api/v1/medical-records/patient/${patientId}`, {
    method: 'GET',
    signal
  });
}

/**
 * Mengambil riwayat janji temu terminal pasien untuk grid bulanan dan garis waktu.
 */
export async function getPatientAppointmentHistory(
  patientId: string,
  signal?: AbortSignal
): Promise<PatientAppointmentHistoryResponse> {
  if (!patientId) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  return clientFetch<PatientAppointmentHistoryResponse>(
    `/api/v1/appointments/history/patient/${patientId}`,
    {
      method: 'GET',
      signal
    }
  );
}
