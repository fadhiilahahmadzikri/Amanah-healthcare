import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type ServiceContextItemProps = {
  label: string;
  sublabel?: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

export function ServiceContextItem({
  label,
  sublabel,
  isActive,
  onClick,
  className
}: ServiceContextItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        `
          group relative flex w-full cursor-pointer items-center justify-between
          gap-3 px-4 py-3.5 text-left amanah-type-caption font-semibold
          transition-all duration-300 select-none
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-offset-1 focus-visible:outline-none
          sm:px-5 sm:py-4
        `,
        isActive
          ? `
            bg-primary text-primary-foreground shadow-xs
            dark:bg-amanah-blue dark:text-white
          `
          : `
            bg-background text-muted-foreground
            hover:bg-accent/60 hover:text-foreground
            dark:bg-card/40 dark:text-muted-foreground
            dark:hover:bg-accent/40 dark:hover:text-foreground
          `,
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          `
            pointer-events-none absolute transition-all duration-300 ease-out
            max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-0.5
            lg:inset-y-0 lg:left-0 lg:w-1
          `,
          isActive
            ? `
              bg-amanah-sky opacity-100
              dark:bg-white
            `
            : 'opacity-0'
        )}
      />

      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='truncate amanah-type-caption font-semibold'>{label}</span>

        {sublabel && (
          <span
            className={cn(
              `
                truncate amanah-type-caption font-normal transition-colors
                duration-300
              `,
              isActive
                ? `
                  text-primary-foreground/80
                  dark:text-white/80
                `
                : 'text-muted-foreground/70'
            )}
          >
            {sublabel}
          </span>
        )}
      </div>

      <ArrowRightIcon
        className={cn(
          'size-4 shrink-0 transition-all duration-300 ease-out',
          isActive
            ? 'translate-x-0 opacity-100'
            : `
              -translate-x-1.5 opacity-0
              group-hover:translate-x-0 group-hover:opacity-60
            `
        )}
        aria-hidden='true'
      />
    </button>
  );
}
