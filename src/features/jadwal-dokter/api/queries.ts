import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getDoctorScheduleById,
  getDoctorSchedules,
  getDoctorScheduleFilterOptions,
  getClinicRooms,
  getDoctorOccupancyOverview,
  checkRescheduleEligibility
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
  date?: string;
  startTime?: string;
  endTime?: string;
}) =>
  queryOptions({
    queryKey: ['schedules', 'reference-rooms', params] as const,
    queryFn: () => getClinicRooms(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

export const doctorOccupancyOverviewQueryOptions = (params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: { jam_mulai: string; jam_selesai: string; nama_sesi?: string; id?: string; status_sesi?: string; slot_tersedia?: number }[];
}) =>
  queryOptions({
    queryKey: ['schedules', 'occupancy-overview', params.date, params.staffId, params.roomId, params.existingSessions] as const,
    queryFn: () => getDoctorOccupancyOverview(params),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: Boolean(params.date && params.staffId)
  });

export const rescheduleEligibilityQueryOptions = (
  id: string,
  sessionId: string,
  params?: {
    targetDate?: string;
    targetStartTime?: string;
    targetRoomId?: string;
  }
) =>
  queryOptions({
    queryKey: ['schedules', 'reschedule-eligibility', id, sessionId, params] as const,
    queryFn: () => checkRescheduleEligibility(id, sessionId, params),
    staleTime: 5 * 1000,
    enabled: Boolean(id && sessionId && params?.targetDate && params?.targetStartTime)
  });

export { doctorScheduleKeys };


