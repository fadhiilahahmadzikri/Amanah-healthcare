import { Skeleton } from '@/components/ui/skeleton';

export function AppointmentCardsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col justify-between rounded-2xl border border-border/50 bg-card p-5 h-[240px] space-y-4'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-10 rounded-full' />
              <div className='space-y-1.5'>
                <Skeleton className='h-4 w-28 rounded-md' />
                <Skeleton className='h-3 w-20 rounded-md' />
              </div>
            </div>
            <Skeleton className='h-6 w-16 rounded-full' />
          </div>
          <div className='space-y-2 py-2 border-y border-border/30'>
            <Skeleton className='h-3 w-3/4 rounded-md' />
            <Skeleton className='h-3 w-1/2 rounded-md' />
          </div>
          <div className='flex items-center justify-between pt-1'>
            <Skeleton className='h-8 w-24 rounded-lg' />
            <Skeleton className='h-8 w-24 rounded-lg' />
          </div>
        </div>
      ))}
    </div>
  );
}
