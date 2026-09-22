import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getDoctorScheduleById, getDoctorSchedules } from './service';
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

export { doctorScheduleKeys };
