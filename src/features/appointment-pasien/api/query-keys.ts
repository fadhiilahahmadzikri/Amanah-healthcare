import { normalizeFilters, type AppointmentFilters } from './types';

export const appointmentKeys = {
  all: ['admin-appointments'] as const,
  list: (filters: AppointmentFilters) =>
    [...appointmentKeys.all, 'list', normalizeFilters(filters)] as const,
  summary: () => [...appointmentKeys.all, 'summary'] as const,
  detail: (id: number | string) => [...appointmentKeys.all, 'detail', id] as const,
  doctorCandidates: (appointmentId: string) =>
    [...appointmentKeys.all, 'candidates', 'doctors', appointmentId] as const,
  roomCandidates: (appointmentId: string) =>
    [...appointmentKeys.all, 'candidates', 'rooms', appointmentId] as const
};
