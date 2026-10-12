import { queryOptions } from '@tanstack/react-query';
import {
  getAdminAppointments,
  getAdminAppointmentById,
  getDoctorCandidates,
  getRoomCandidates,
  generateCheckInQr
} from './service';
import { appointmentKeys } from './query-keys';
import type { AdminAppointment, AppointmentFilters } from './types';

export type { AdminAppointment };
export { appointmentKeys };

export const appointmentQueryOptions = (filters: AppointmentFilters) =>
  queryOptions({
    queryKey: appointmentKeys.list(filters),
    queryFn: ({ signal }) => getAdminAppointments(filters, signal),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev
  });

export const appointmentDetailQueryOptions = (id: number | string) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAdminAppointmentById(id)
  });

export const doctorCandidatesQueryOptions = (appointmentId: string) =>
  queryOptions({
    queryKey: appointmentKeys.doctorCandidates(appointmentId),
    queryFn: () => getDoctorCandidates(appointmentId),
    enabled: Boolean(appointmentId)
  });

export const roomCandidatesQueryOptions = (appointmentId: string) =>
  queryOptions({
    queryKey: appointmentKeys.roomCandidates(appointmentId),
    queryFn: () => getRoomCandidates(appointmentId),
    enabled: Boolean(appointmentId)
  });

export const checkInQrQueryOptions = (appointmentId: string, enabled = true) =>
  queryOptions({
    queryKey: appointmentKeys.checkInQr(appointmentId),
    queryFn: () => generateCheckInQr(appointmentId),
    enabled: Boolean(appointmentId && enabled),
    staleTime: 60 * 1000,
    retry: 1
  });
