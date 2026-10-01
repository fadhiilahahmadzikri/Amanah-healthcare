import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getDoctorScheduleById,
  getDoctorSchedules,
  getDoctorScheduleFilterOptions,
  getClinicRooms,
  getDoctorOccupancyOverview,
  checkRescheduleEligibility,
  getSessionPatients,
  getScheduleProjection,
  getScheduleReferenceOptions,
  getScheduleContexts,
  getScheduleSlotAvailability
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

export const doctorOccupancyOverviewQueryOptions = (params: {
  date: string;
  staffId: string;
  roomId?: string;
  existingSessions?: {
    jam_mulai: string;
    jam_selesai: string;
    nama_sesi?: string;
    id?: string;
    status_sesi?: string;
    slot_tersedia?: number;
  }[];
}) =>
  queryOptions({
    queryKey: [
      'schedules',
      'occupancy-overview',
      params.date,
      params.staffId,
      params.roomId,
      params.existingSessions
    ] as const,
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

export const scheduleProjectionQueryOptions = (params: {
  scheduleContextId?: string;
  startTime?: string;
  endTime?: string;
  practitionerId?: string;
  shift?: string;
  date?: string;
  slotsCount?: number;
  fillShift?: boolean;
}) =>
  queryOptions({
    queryKey: ['schedules', 'projection', params] as const,
    queryFn: () => getScheduleProjection(params),
    staleTime: 60 * 1000,
    enabled: Boolean(params.startTime || params.shift || params.scheduleContextId)
  });

export const scheduleReferenceOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ['schedules', 'reference-options'] as const,
    queryFn: () => getScheduleReferenceOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

export const scheduleContextsQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: ['schedules', 'contexts', date] as const,
    queryFn: () => getScheduleContexts(date),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: Boolean(date && date.trim().length > 0)
  });

export const scheduleSlotAvailabilityQueryOptions = (params: {
  date: string;
  shift: string;
  roomId: string;
  scheduleId?: string;
  staffId?: string;
}) =>
  queryOptions({
    queryKey: [
      'schedules',
      'slot-availability',
      params.date,
      params.shift,
      params.roomId,
      params.scheduleId,
      params.staffId
    ] as const,
    queryFn: () => getScheduleSlotAvailability(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: Boolean(
      params.date &&
      params.shift &&
      params.roomId &&
      params.date.trim().length > 0 &&
      params.shift.trim().length > 0 &&
      params.roomId.trim().length > 0
    )
  });

export { doctorScheduleKeys };
