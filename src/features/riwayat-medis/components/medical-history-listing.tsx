'use client';

import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MedicalHistoryTable } from './medical-history-table';

export function MedicalHistoryListingSkeleton() {
  return (
    <div className='flex flex-col gap-3.5 p-4 space-y-3'>
      <Skeleton className='h-10 w-full max-w-sm rounded-lg' />
      <Skeleton className='h-12 w-full rounded-lg' />
      <Skeleton className='h-12 w-full rounded-lg' />
      <Skeleton className='h-12 w-full rounded-lg' />
    </div>
  );
}

export function MedicalHistoryListing() {
  return (
    <Suspense fallback={<MedicalHistoryListingSkeleton />}>
      <MedicalHistoryTable />
    </Suspense>
  );
}
