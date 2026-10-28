import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { medicalRecordKeys } from './query-keys';
import {
  getMedicalRecords,
  getMedicalRecordById,
  getMedicalRecordsByPatient,
  getPatientAppointmentHistory
} from './service';
import type { MedicalRecordFilterOptions } from './types';

export function medicalRecordInfiniteQueryOptions(filters: MedicalRecordFilterOptions = {}) {
  return infiniteQueryOptions({
    queryKey: medicalRecordKeys.infinite(filters),
    queryFn: ({ pageParam, signal }) =>
      getMedicalRecords(
        {
          ...filters,
          page: typeof pageParam === 'number' ? pageParam : 1,
          limit: filters.limit ?? 20
        },
        signal
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 30_000
  });
}

export function medicalRecordsByPatientQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: medicalRecordKeys.byPatient(patientId),
    queryFn: ({ signal }) => getMedicalRecordsByPatient(patientId, signal),
    enabled: Boolean(patientId),
    staleTime: 60_000
  });
}

export function patientAppointmentHistoryQueryOptions(patientId: string) {
  return queryOptions({
    queryKey: medicalRecordKeys.patientAppointments(patientId),
    queryFn: ({ signal }) => getPatientAppointmentHistory(patientId, signal),
    enabled: Boolean(patientId),
    staleTime: 60_000
  });
}

export function medicalRecordDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: ({ signal }) => getMedicalRecordById(id, signal),
    enabled: Boolean(id),
    staleTime: 60_000
  });
}
