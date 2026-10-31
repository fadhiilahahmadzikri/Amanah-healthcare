import React, { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { userInfiniteQueryOptions } from '../api/queries';
import { UserTable, UserTableSkeleton } from './user-tables';

export default async function UserListingPage() {
  const search = searchParamsCache.get('search') || searchParamsCache.get('name');
  const roleId = searchParamsCache.get('role');
  const status = searchParamsCache.get('status');
  const pageLimit = searchParamsCache.get('perPage');

  const filters = {
    limit: pageLimit || 25,
    ...(search && { search }),
    ...(roleId && { roleId }),
    ...(status && { status })
  };

  const queryClient = getQueryClient();

  // Prefetch first page on server
  await queryClient
    .prefetchInfiniteQuery({
      ...userInfiniteQueryOptions(filters)
    })
    .catch(() => {
      // Graceful fallback to client fetching
    });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<UserTableSkeleton />}>
        <UserTable />
      </Suspense>
    </HydrationBoundary>
  );
}
