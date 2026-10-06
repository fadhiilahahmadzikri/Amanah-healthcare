import { Skeleton } from '@/components/ui/skeleton';

export function QueueViewSkeleton() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 flex-1 min-h-0 items-stretch overflow-hidden'>
      <div className='lg:col-span-7 xl:col-span-7 flex flex-col min-h-0 h-full overflow-hidden'>
        <div className='flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-6 h-full space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-8 w-48 rounded-lg' />
            </div>
            <Skeleton className='h-8 w-28 rounded-full' />
          </div>
          <div className='space-y-4 py-8 flex flex-col items-center justify-center'>
            <Skeleton className='h-6 w-36 rounded-md' />
            <Skeleton className='h-20 w-48 rounded-2xl' />
            <Skeleton className='h-4 w-40 rounded-md' />
          </div>
          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border/40'>
            <Skeleton className='h-14 rounded-xl' />
            <Skeleton className='h-14 rounded-xl' />
          </div>
        </div>
      </div>

      <div className='lg:col-span-5 xl:col-span-5 rounded-[22px] border border-border/50 bg-card p-5 sm:p-6 shadow-none flex flex-col justify-between min-h-0 h-full overflow-hidden space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-5 w-28 rounded-md' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
          <Skeleton className='h-9 w-full rounded-xl' />
        </div>
        <div className='grid grid-cols-5 gap-2 sm:gap-2.5 py-2'>
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full rounded-xl' />
          ))}
        </div>
        <div className='pt-2 border-t border-border/40 flex items-center justify-between'>
          <Skeleton className='h-4 w-24 rounded-md' />
          <Skeleton className='h-7 w-20 rounded-md' />
        </div>
      </div>
    </div>
  );
}
