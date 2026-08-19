import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { onboardingQueryOptions } from '../api/queries';
import type { ShippingFilters } from '../api/types';
import { ShippingOnboarding } from './shipping-onboarding';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShippingOnboardingPage({
  initialFilters = {}
}: {
  initialFilters?: ShippingFilters;
}) {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(onboardingQueryOptions(initialFilters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='w-full h-[600px] rounded-xl' />}>
        <ShippingOnboarding initialFilters={initialFilters} />
      </Suspense>
    </HydrationBoundary>
  );
}
