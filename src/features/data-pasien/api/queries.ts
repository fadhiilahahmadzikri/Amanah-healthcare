import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getPatientById, getPatientHistory, getPatients, getPatientSummary } from './service';
import type { Patient, PatientFilters } from './types';

export type { Patient };

export const patientKeys = {
  all: ['patients'] as const,
  list: (filters: PatientFilters) => [...patientKeys.all, 'list', filters] as const,
  infiniteList: (filters: PatientFilters) =>
    [...patientKeys.all, 'infinite-list', filters] as const,
  summary: () => [...patientKeys.all, 'summary'] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
  history: (id: string) => [...patientKeys.all, 'history', id] as const
};

export const patientsQueryOptions = (filters: PatientFilters) =>
  queryOptions({
    queryKey: patientKeys.list(filters),
    queryFn: ({ signal }) => getPatients(filters, signal)
  });

export const patientInfiniteQueryOptions = (filters: PatientFilters) =>
  infiniteQueryOptions({
    queryKey: patientKeys.infiniteList(filters),
    queryFn: ({ pageParam = 1, signal }) =>
      getPatients({ ...filters, page: pageParam as number, limit: filters.limit ?? 30 }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const limit = filters.limit ?? 30;
      if (!lastPage?.patients || lastPage.patients.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    }
  });

export const patientSummaryQueryOptions = () =>
  queryOptions({
    queryKey: patientKeys.summary(),
    queryFn: () => getPatientSummary()
  });

export const patientByIdOptions = (id: string) =>
  queryOptions({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: Boolean(id)
  });

export const patientHistoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: patientKeys.history(id),
    queryFn: () => getPatientHistory(id),
    enabled: Boolean(id)
  });
