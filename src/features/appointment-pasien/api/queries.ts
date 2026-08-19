import { queryOptions } from '@tanstack/react-query';
import {
  getAdminAppointments,
  getAdminAppointmentSummary,
  getAdminAppointmentById
} from './service';
import type { AdminAppointment, AppointmentFilters } from './types';

export type { AdminAppointment };

export const appointmentKeys = {
  all: ['admin-appointments'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.all, 'list', filters] as const,
  summary: () => [...appointmentKeys.all, 'summary'] as const,
  detail: (id: number) => [...appointmentKeys.all, 'detail', id] as const
};

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

export const appointmentDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAdminAppointmentById(id)
  });
