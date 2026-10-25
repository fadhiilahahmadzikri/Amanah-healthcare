import { Skeleton } from '@/components/ui/skeleton';

export function QueueViewSkeleton() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 flex-1 min-h-0 items-stretch overflow-hidden'>
      {/* Column 1: Calling Card Skeleton */}
      <div className='lg:col-span-7 xl:col-span-7 flex flex-col min-h-0 h-full overflow-hidden'>
        <div className='rounded-[22px] border border-border/50 bg-card p-5 sm:p-7 flex flex-col justify-between flex-1 h-full min-h-0 overflow-hidden space-y-4'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between gap-3 shrink-0'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-6 w-36 rounded-md' />
              <Skeleton className='size-2 rounded-full' />
            </div>
            <Skeleton className='h-6 w-28 rounded-full' />
          </div>

          {/* Mobile Calling Card Layout Skeleton */}
          <div className='lg:hidden flex-1 flex flex-col justify-between py-1 space-y-4'>
            <div className='flex flex-row items-center gap-4 my-auto py-2'>
              <Skeleton className='size-24 min-w-[96px] rounded-2xl shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-8 w-28 rounded-md' />
                <Skeleton className='h-5 w-36 rounded-md' />
              </div>
            </div>

            <div className='space-y-2.5 pt-2 border-t border-border/40'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-center gap-2.5'>
                  <Skeleton className='size-4 rounded shrink-0' />
                  <Skeleton className='h-4 w-44 rounded-md' />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Calling Card Layout Skeleton */}
          <div className='hidden lg:flex flex-col flex-1 justify-between py-2'>
            <div className='flex items-center gap-8 my-auto'>
              <Skeleton className='size-48 xl:size-52 min-w-[192px] xl:min-w-[208px] rounded-3xl shrink-0' />
              <div className='flex-1 space-y-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-28 rounded-md' />
                  <Skeleton className='h-12 w-44 rounded-lg' />
                  <Skeleton className='h-7 w-52 rounded-md' />
                </div>
                <Skeleton className='h-16 max-w-md rounded-xl' />
              </div>
            </div>

            <div className='border-t border-border/40 shrink-0 my-3' />

            <div className='flex flex-row items-center justify-between gap-6 lg:gap-8 shrink-0'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <Skeleton className='size-7 rounded-lg shrink-0' />
                  <div className='space-y-1.5'>
                    <Skeleton className='h-3 w-16 rounded' />
                    <Skeleton className='h-5 w-24 rounded' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Desktop Right Column Skeleton */}
      <div className='hidden lg:flex lg:col-span-5 xl:col-span-5 rounded-[22px] border border-border/50 bg-card p-5 sm:p-6 shadow-none flex-col justify-between min-h-0 h-full overflow-hidden space-y-4'>
        <div className='space-y-3 shrink-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-28 rounded-md' />
              <Skeleton className='h-5 w-16 rounded-full' />
            </div>
            <Skeleton className='h-4 w-20 rounded-md' />
          </div>
          <Skeleton className='h-9 w-full rounded-lg' />
        </div>

        <div className='grid grid-cols-5 gap-2 sm:gap-2.5 py-2 flex-1 my-auto'>
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full rounded-[13px]' />
          ))}
        </div>

        <div className='pt-2.5 border-t border-border/40 flex items-center justify-between shrink-0'>
          <Skeleton className='h-4 w-28 rounded-md' />
          <Skeleton className='h-6.5 w-36 rounded-md' />
        </div>
      </div>
    </div>
  );
}
