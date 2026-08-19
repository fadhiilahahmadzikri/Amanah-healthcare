import { queryOptions } from '@tanstack/react-query';
import { loadStoredAppointments, loadStoredQueues, getDoctors } from './service';

export const klinikKeys = {
  all: ['klinik'] as const,
  appointments: () => [...klinikKeys.all, 'appointments'] as const,
  queues: () => [...klinikKeys.all, 'queues'] as const,
  doctors: () => [...klinikKeys.all, 'doctors'] as const
};

export const appointmentsQueryOptions = () =>
  queryOptions({
    queryKey: klinikKeys.appointments(),
    queryFn: () => loadStoredAppointments()
  });

export const queuesQueryOptions = () =>
  queryOptions({
    queryKey: klinikKeys.queues(),
    queryFn: () => loadStoredQueues()
  });

export const doctorsQueryOptions = () =>
  queryOptions({
    queryKey: klinikKeys.doctors(),
    queryFn: () => getDoctors()
  });
