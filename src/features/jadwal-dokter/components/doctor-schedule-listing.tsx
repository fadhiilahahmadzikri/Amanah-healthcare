import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { doctorScheduleInfiniteQueryOptions } from '../api/queries';
import { fetchAdminDoctorSchedules } from '../api/doctor-schedule-service';
import type { DoctorScheduleFilters } from '../api/types';
import { DoctorScheduleView } from './doctor-schedule-view';
import { DoctorScheduleCardsSkeleton } from './doctor-schedule-cards-skeleton';

export { DoctorScheduleCardsSkeleton };

export default async function DoctorScheduleListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('search');
  const perPage = searchParamsCache.get('perPage');
  const poli = searchParamsCache.get('poli');
  const session = searchParamsCache.get('session');
  const status = searchParamsCache.get('status');

  const filters: DoctorScheduleFilters = {
    page: page || 1,
    limit: perPage || 20,
    ...(search && { search }),
    ...(poli && { poli: poli.split(',').filter(Boolean) }),
    ...(session && { session: session.split(',').filter(Boolean) }),
    ...(status && { status: status.split(',').filter(Boolean) })
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    ...doctorScheduleInfiniteQueryOptions(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchAdminDoctorSchedules({ ...filters, page: pageParam as number });
      return {
        doctors: data.doctors,
        totalDoctors: data.meta.totalDoctors,
        meta: data.meta
      };
    }
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DoctorScheduleCardsSkeleton />}>
        <DoctorScheduleView />
      </Suspense>
    </HydrationBoundary>
  );
}
