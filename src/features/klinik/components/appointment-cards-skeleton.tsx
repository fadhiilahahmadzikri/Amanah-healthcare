import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface AppointmentCardsSkeletonProps {
  count?: number;
  className?: string;
}

export function AppointmentCardsSkeleton({
  count = 6,
  className
}: AppointmentCardsSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col justify-between rounded-[20px] border border-border/60 bg-card p-3.5 sm:p-4 space-y-3.5 shadow-none'
        >
          {/* Header: Avatar, Name/Specialty, Status Pill */}
          <div className='flex items-start justify-between gap-2.5'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <Skeleton className='size-11 sm:size-12 rounded-full shrink-0 ring-1 ring-border/40' />
              <div className='space-y-1.5 flex-1 min-w-0'>
                <Skeleton className='h-4 w-3/4 rounded-md' />
                <Skeleton className='h-3 w-1/2 rounded-md' />
              </div>
            </div>
            <Skeleton className='h-6 w-20 rounded-full shrink-0' />
          </div>

          {/* Meta Row: Date & Location */}
          <div className='flex items-center justify-between gap-3 pt-1'>
            <Skeleton className='h-3.5 w-24 rounded-md' />
            <Skeleton className='h-3.5 w-32 rounded-md' />
          </div>

          {/* Trajectory: Start & End Times */}
          <div className='rounded-xl border border-border/40 bg-muted/20 p-2.5 flex items-center justify-between gap-2'>
            <div className='space-y-1'>
              <Skeleton className='h-2.5 w-12 rounded' />
              <Skeleton className='h-3.5 w-16 rounded' />
            </div>
            <Skeleton className='h-1.5 flex-1 mx-3 rounded-full' />
            <div className='space-y-1 text-right flex flex-col items-end'>
              <Skeleton className='h-2.5 w-12 rounded' />
              <Skeleton className='h-3.5 w-16 rounded' />
            </div>
          </div>

          {/* Footer: Queue Box & Detail Pill Button */}
          <div className='flex items-center justify-between gap-3 pt-2.5 border-t border-border/40'>
            <Skeleton className='h-7 w-16 rounded-md' />
            <div className='flex items-center gap-2'>
              <Skeleton className='size-7 rounded-md' />
              <Skeleton className='h-7.5 w-24 rounded-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
