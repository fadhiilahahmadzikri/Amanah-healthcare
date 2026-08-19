import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { patientsQueryOptions } from '../api/queries';
import { PatientTable, PatientTableSkeleton } from './patient-tables';
import { Suspense } from 'react';

export default async function PatientListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name') || searchParamsCache.get('search');
  const pageLimit = searchParamsCache.get('perPage');
  const gender = searchParamsCache.get('gender');
  const status = searchParamsCache.get('status');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(gender && { gender }),
    ...(status && { status }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(patientsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PatientTableSkeleton />}>
        <PatientTable />
      </Suspense>
    </HydrationBoundary>
  );
}
