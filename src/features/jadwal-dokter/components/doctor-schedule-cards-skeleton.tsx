import { Skeleton } from '@/components/ui/skeleton';

export function DoctorScheduleCardsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <Skeleton className='h-9 w-64 rounded-lg' />
        <Skeleton className='h-9 w-32 rounded-lg' />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5'>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className='h-[160px] sm:h-[162px] rounded-[18px] sm:rounded-[20px]' />
        ))}
      </div>
    </div>
  );
}
