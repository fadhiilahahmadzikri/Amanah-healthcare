import { queryOptions } from '@tanstack/react-query';
import { getPatients, getPatientSummary, getPatientById } from './service';
import type { Patient, PatientFilters } from './types';

export type { Patient };

export const patientKeys = {
  all: ['patients'] as const,
  list: (filters: PatientFilters) => [...patientKeys.all, 'list', filters] as const,
  summary: () => [...patientKeys.all, 'summary'] as const,
  detail: (id: number) => [...patientKeys.all, 'detail', id] as const
};

export const patientsQueryOptions = (filters: PatientFilters) =>
  queryOptions({
    queryKey: patientKeys.list(filters),
    queryFn: () => getPatients(filters)
  });

export const patientSummaryQueryOptions = () =>
  queryOptions({
    queryKey: patientKeys.summary(),
    queryFn: () => getPatientSummary()
  });

export const patientByIdOptions = (id: number) =>
  queryOptions({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientById(id)
  });
