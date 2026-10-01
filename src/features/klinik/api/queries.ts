import { queryOptions } from '@tanstack/react-query';
import { loadStoredAppointments, loadStoredQueues, getDoctors } from './service';

import { klinikKeys } from './query-keys';

export { klinikKeys };

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
