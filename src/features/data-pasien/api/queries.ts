import { queryOptions } from '@tanstack/react-query';
import {
  getPatientById,
  getPatientHistory,
  getPatients,
  getPatientSummary,
} from './service';
import type { Patient, PatientFilters } from './types';

export type { Patient };

export const patientKeys = {
  all: ['patients'] as const,
  list: (filters: PatientFilters) =>
    [...patientKeys.all, 'list', filters] as const,
  summary: () => [...patientKeys.all, 'summary'] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
  history: (id: string) => [...patientKeys.all, 'history', id] as const,
};

export const patientsQueryOptions = (filters: PatientFilters) =>
  queryOptions({
    queryKey: patientKeys.list(filters),
    queryFn: ({ signal }) => getPatients(filters, signal),
  });

export const patientSummaryQueryOptions = () =>
  queryOptions({
    queryKey: patientKeys.summary(),
    queryFn: () => getPatientSummary(),
  });

export const patientByIdOptions = (id: string) =>
  queryOptions({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: Boolean(id),
  });

export const patientHistoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: patientKeys.history(id),
    queryFn: () => getPatientHistory(id),
    enabled: Boolean(id),
  });
