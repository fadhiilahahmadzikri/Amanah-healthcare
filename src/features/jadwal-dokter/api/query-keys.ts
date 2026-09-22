import type { DoctorScheduleDetailParams, DoctorScheduleFilters } from './types';

export const doctorScheduleKeys = {
  all: ['doctor-schedules'] as const,
  lists: () => [...doctorScheduleKeys.all, 'list'] as const,
  list: (filters: DoctorScheduleFilters) => [...doctorScheduleKeys.lists(), filters] as const,
  details: () => [...doctorScheduleKeys.all, 'detail'] as const,
  detail: (id: string, params: DoctorScheduleDetailParams = {}) =>
    [...doctorScheduleKeys.details(), id, params] as const,
  filterOptions: () => [...doctorScheduleKeys.all, 'filter-options'] as const
};
