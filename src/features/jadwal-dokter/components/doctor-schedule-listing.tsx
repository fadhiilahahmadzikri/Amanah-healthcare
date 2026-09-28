import { Suspense } from 'react';
import { DoctorScheduleView } from './doctor-schedule-view';
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

export default function DoctorScheduleListingPage() {
  return (
    <Suspense fallback={<DoctorScheduleCardsSkeleton />}>
      <DoctorScheduleView />
    </Suspense>
  );
}
