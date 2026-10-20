import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';
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

export const doctorScheduleInfiniteQueryOptions = (filters: DoctorScheduleFilters = {}) =>
  infiniteQueryOptions({
    queryKey: doctorScheduleKeys.infiniteList(filters),
    queryFn: ({ pageParam = 1 }) =>
      getDoctorSchedules({ ...filters, page: pageParam as number, limit: filters.limit ?? 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const limit = filters.limit ?? 20;
      if (!lastPage?.doctors || lastPage.doctors.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  });

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
  filters: { status?: string; search?: string; date?: string } = {}
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
