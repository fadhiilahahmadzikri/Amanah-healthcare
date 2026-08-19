import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { trackerQueryOptions } from '../api/queries';
import { ShippingTracker } from './shipping-tracker';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShippingTrackerPage() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trackerQueryOptions({}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='w-full h-[600px] rounded-xl' />}>
        <ShippingTracker />
      </Suspense>
    </HydrationBoundary>
  );
}
