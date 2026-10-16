import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { staffsQueryOptions, staffInvitationsQueryOptions } from '../api/queries';
import { StaffManagementView } from './staff-management-view';
import { StaffScheduleCardsSkeleton } from './staff-schedule-cards-skeleton';

export { StaffScheduleCardsSkeleton };

export default async function StaffManagementListingPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(staffsQueryOptions()),
    queryClient.prefetchQuery(staffInvitationsQueryOptions())
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<StaffScheduleCardsSkeleton />}>
        <StaffManagementView />
      </Suspense>
    </HydrationBoundary>
  );
}
