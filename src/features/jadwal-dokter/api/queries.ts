import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getDoctorScheduleById,
  getDoctorSchedules,
  getDoctorScheduleFilterOptions,
  getClinicRooms,
  getSessionPatients,
  getScheduleReferenceOptions
} from './service';
import { doctorScheduleKeys } from './query-keys';
import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';

export const doctorScheduleQueryOptions = (filters: DoctorScheduleFilters = {}) =>
  queryOptions({
    queryKey: doctorScheduleKeys.list(filters),
    queryFn: () => getDoctorSchedules(filters),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  });

export const doctorScheduleDetailQueryOptions = (
  id: string,
  params: DoctorScheduleDetailParams = {}
) =>
  queryOptions({
    queryKey: doctorScheduleKeys.detail(id, params),
    queryFn: () => getDoctorScheduleById(id, params),
    staleTime: 5 * 1000,
    enabled: !!id
  });

export const doctorScheduleFilterOptionsQueryOptions = () =>
  queryOptions({
    queryKey: doctorScheduleKeys.filterOptions(),
    queryFn: () => getDoctorScheduleFilterOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

export const clinicRoomsQueryOptions = (params?: {
  poliklinikId?: string;
  clinicUnitId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  excludePractitionerId?: string;
}) =>
  queryOptions({
    queryKey: ['schedules', 'reference-rooms', params] as const,
    queryFn: () => getClinicRooms(params),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

export const sessionPatientsQueryOptions = (
  doctorId: string,
  sessionId: string,
  filters: { status?: string; search?: string } = {}
) =>
  queryOptions({
    queryKey: doctorScheduleKeys.sessionPatients(doctorId, sessionId, filters),
    queryFn: () => getSessionPatients(doctorId, sessionId, filters),
    staleTime: 5 * 1000,
    enabled: Boolean(doctorId && sessionId)
  });

export const scheduleReferenceOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ['schedules', 'reference-options'] as const,
    queryFn: () => getScheduleReferenceOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

export { doctorScheduleKeys };
