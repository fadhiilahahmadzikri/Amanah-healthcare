import { Skeleton } from '@/components/ui/skeleton';

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

      {/* Cards Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 pt-1'>
        {['sk-st-1', 'sk-st-2', 'sk-st-3', 'sk-st-4', 'sk-st-5', 'sk-st-6'].map((id) => (
          <Skeleton key={id} className='h-[200px] rounded-[24px] border border-border/40' />
        ))}
      </div>
    </div>
  );
}
