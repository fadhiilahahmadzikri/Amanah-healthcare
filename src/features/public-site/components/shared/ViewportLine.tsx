import { cn } from '@/features/public-site/lib/helpers';

type ViewportLineProps = {
  className?: string;
  position: 'bottom' | 'top';
};

const positionClassNames: Record<ViewportLineProps['position'], string> = {
  bottom: 'bottom-0',
  top: 'top-0'
};

export function ViewportLine({ className, position }: ViewportLineProps) {
  return (
    <span
      aria-hidden
      className={cn(
        `
          pointer-events-none absolute left-1/2 h-[1.5px] w-screen
          -translate-x-1/2 bg-line
        `,
        positionClassNames[position],
        className
      )}
    />
  );
}
