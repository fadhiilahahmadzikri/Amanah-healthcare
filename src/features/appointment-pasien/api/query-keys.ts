import type { AppointmentFilters } from './types';

export const appointmentKeys = {
  all: ['admin-appointments'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.all, 'list', filters] as const,
  summary: () => [...appointmentKeys.all, 'summary'] as const,
  detail: (id: number | string) => [...appointmentKeys.all, 'detail', id] as const
};
