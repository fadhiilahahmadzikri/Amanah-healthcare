import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { appointmentQueryOptions, queueNavigationQueryOptions } from '../api/queries';
import { getAppointmentsOnServer, getQueueNavigationOnServer } from '../api/server';
import { normalizeFilters } from '../api/types';
import { prefetchClinicCatalog } from '@/features/klinik/api/server';
import { AppointmentTable, AppointmentTableSkeleton } from './appointment-tables';
import { Suspense } from 'react';

export default async function AppointmentListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name') || searchParamsCache.get('search');
  const pageLimit = searchParamsCache.get('perPage');
  const status = searchParamsCache.get('status');
  const sort = searchParamsCache.get('sort');
  const poliklinikId = searchParamsCache.get('poliklinikId');
  const doctorId = searchParamsCache.get('doctorId');
  const poli = searchParamsCache.get('poli');

  const filters = normalizeFilters({
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(status && { status }),
    ...(poliklinikId && { poliklinikId }),
    ...(doctorId && { doctorId }),
    ...(poli && { poli }),
    ...(sort && { sort })
  });

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      ...appointmentQueryOptions(filters),
      queryFn: () => getAppointmentsOnServer(filters)
    }),
    queryClient.prefetchQuery({
      ...queueNavigationQueryOptions(),
      queryFn: () => getQueueNavigationOnServer()
    }),
    prefetchClinicCatalog(queryClient)
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AppointmentTableSkeleton />}>
        <AppointmentTable />
      </Suspense>
    </HydrationBoundary>
  );
}
