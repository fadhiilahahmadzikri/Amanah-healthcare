import { queryOptions } from '@tanstack/react-query';
import { getDoctorScheduleById, getDoctorSchedules } from './service';
import type { DoctorScheduleFilters } from './types';

export const doctorScheduleKeys = {
  all: ['doctor-schedules'] as const,
  lists: () => [...doctorScheduleKeys.all, 'list'] as const,
  list: (filters: DoctorScheduleFilters) => [...doctorScheduleKeys.lists(), filters] as const,
  details: () => [...doctorScheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorScheduleKeys.details(), id] as const
};

export const doctorScheduleQueryOptions = (filters: DoctorScheduleFilters = {}) =>
  queryOptions({
    queryKey: doctorScheduleKeys.list(filters),
    queryFn: () => getDoctorSchedules(filters),
    staleTime: 5 * 1000
  });

export const doctorScheduleDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: doctorScheduleKeys.detail(id),
    queryFn: () => getDoctorScheduleById(id),
    staleTime: 5 * 1000,
    enabled: !!id
  });
