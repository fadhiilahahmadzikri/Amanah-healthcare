import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { doctorScheduleQueryOptions } from '../api/queries';
import { fetchAdminDoctorSchedules } from '../api/doctor-schedule-service';
import type { DoctorScheduleFilters } from '../api/types';
import { DoctorScheduleView } from './doctor-schedule-view';
import { DoctorScheduleCardsSkeleton } from './doctor-schedule-cards-skeleton';

export { DoctorScheduleCardsSkeleton };

export default async function DoctorScheduleListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('search');
  const perPage = searchParamsCache.get('perPage');

  const filters: DoctorScheduleFilters = {
    page: page || 1,
    limit: perPage || 6,
    ...(search && { search })
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    ...doctorScheduleQueryOptions(filters),
    queryFn: async () => {
      const data = await fetchAdminDoctorSchedules(filters);
      return {
        doctors: data.doctors,
        total_doctors: data.meta.total_doctors,
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
