import { Skeleton } from '@/components/ui/skeleton';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';

export function DoctorScheduleCardsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <Skeleton className='h-9 w-64 rounded-lg' />
        <Skeleton className='h-9 w-32 rounded-lg' />
      </div>
      <EntityCardGridSkeleton count={10} />
    </div>
  );
}
