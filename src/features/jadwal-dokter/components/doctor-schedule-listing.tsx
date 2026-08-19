import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { doctorScheduleQueryOptions } from '../api/queries';
import { DoctorScheduleView } from './doctor-schedule-view';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function DoctorScheduleCardsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <Skeleton className='h-9 w-64 rounded-lg' />
        <Skeleton className='h-9 w-32 rounded-lg' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-[230px] rounded-[20px]' />
        ))}
      </div>
    </div>
  );
}

export default async function DoctorScheduleListingPage() {
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('search') || searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage') || 6;

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(doctorScheduleQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DoctorScheduleCardsSkeleton />}>
        <DoctorScheduleView />
      </Suspense>
    </HydrationBoundary>
  );
}
