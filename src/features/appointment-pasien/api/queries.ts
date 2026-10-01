import { queryOptions } from '@tanstack/react-query';
import {
  getAdminAppointments,
  getAdminAppointmentSummary,
  getAdminAppointmentById
} from './service';
import { appointmentKeys } from './query-keys';
import type { AdminAppointment, AppointmentFilters } from './types';

export type { AdminAppointment };
export { appointmentKeys };

export const appointmentQueryOptions = (filters: AppointmentFilters) =>
  queryOptions({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => getAdminAppointments(filters)
  });

export const appointmentSummaryQueryOptions = () =>
  queryOptions({
    queryKey: appointmentKeys.summary(),
    queryFn: () => getAdminAppointmentSummary()
  });

export const appointmentDetailQueryOptions = (id: number | string) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAdminAppointmentById(id)
  });
