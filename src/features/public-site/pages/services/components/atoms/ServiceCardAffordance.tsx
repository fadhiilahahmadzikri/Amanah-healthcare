import { ArrowUpRightIcon } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type ServiceCardAffordanceProps = {
  className?: string;
  ariaLabel?: string;
};

export function ServiceCardAffordance({
  className,
  ariaLabel = 'Lihat detail layanan'
}: ServiceCardAffordanceProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        `
          inline-flex size-8 shrink-0 items-center justify-center rounded-full
          border border-white/45 bg-white/85 text-[#13195c]
          shadow-[0_8px_30px_rgb(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)]
          backdrop-blur-xl transition-all duration-300
          group-hover:scale-105 group-hover:border-white/50
          group-hover:bg-white/95
          group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]
          sm:size-9
          dark:border-white/35 dark:bg-white/85 dark:text-[#13195c]
          dark:group-hover:bg-white/95
        `,
        className
      )}
    >
      <ArrowUpRightIcon
        className='
          size-4 transition-transform duration-300
          group-hover:translate-x-0.5 group-hover:-translate-y-0.5
        '
        aria-hidden='true'
      />
    </span>
  );
}
