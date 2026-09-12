import { cn } from '@/features/public-site/lib/helpers';

type DecorativeMarkerProps = {
  className?: string;
};

export function DecorativeMarker({ className }: DecorativeMarkerProps) {
  return (
    <div aria-hidden='true' className={cn('flex items-center gap-2 text-foreground/45', className)}>
      <span className='size-2.5 rounded-full border border-current' />
      <span className='size-2.5 rounded-full border border-current' />
      <span className='size-2.5 rounded-full border border-current' />
    </div>
  );
}
