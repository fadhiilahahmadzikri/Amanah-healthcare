import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { appointmentQueryOptions } from '../api/queries';
import { AppointmentTable, AppointmentTableSkeleton } from './appointment-tables';
import { Suspense } from 'react';

export default async function AppointmentListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name') || searchParamsCache.get('search');
  const pageLimit = searchParamsCache.get('perPage');
  const status = searchParamsCache.get('status');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(status && { status }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(appointmentQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AppointmentTableSkeleton />}>
        <AppointmentTable />
      </Suspense>
    </HydrationBoundary>
  );
}
