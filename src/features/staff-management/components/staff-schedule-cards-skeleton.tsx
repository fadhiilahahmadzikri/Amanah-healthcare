import { Skeleton } from '@/components/ui/skeleton';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';

export function StaffScheduleCardsSkeleton() {
  return (
    <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
      {/* Responsive Toolbar Skeleton */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
        <div className='flex flex-wrap items-center gap-2.5 flex-1'>
          <Skeleton className='h-9 w-full sm:w-72 rounded-lg' />
          <Skeleton className='h-9 w-48 rounded-lg' />
        </div>
        <div className='flex items-center gap-2 shrink-0 justify-end'>
          <Skeleton className='h-9 w-32 rounded-lg' />
        </div>
      </div>

      {/* Cards Grid Skeleton (Identical 5-column responsive layout) */}
      <div className='pt-1'>
        <EntityCardGridSkeleton count={10} />
      </div>
    </div>
  );
}
