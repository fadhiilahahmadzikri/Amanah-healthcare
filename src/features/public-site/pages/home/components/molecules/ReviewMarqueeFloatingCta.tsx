import Link from 'next/link';
import { cn } from '@/features/public-site/lib/helpers';
import { MarqueeArrowIndicator } from '../atoms/MarqueeArrowIndicator';

type ReviewMarqueeFloatingCtaProps = {
  className?: string;
  href?: string;
  label?: string;
};

export function ReviewMarqueeFloatingCta({
  className,
  href = '/ulasan',
  label = 'Lihat Semua Ulasan'
}: ReviewMarqueeFloatingCtaProps) {
  return (
    <div
      className={cn(
        `
          pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center
          sm:bottom-6
          md:bottom-8
        `,
        className
      )}
    >
      <Link
        href={href}
        className='
          group/cta pointer-events-auto inline-flex items-center gap-3 py-2
          text-xs font-bold tracking-wider text-foreground uppercase
          transition-all duration-300
          hover:text-amanah-blue
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring
          sm:text-sm
          md:translate-y-3 md:opacity-0
          md:group-hover/marquee-section:translate-y-0
          md:group-hover/marquee-section:opacity-100
        '
        aria-label={`${label} di halaman ulasan Klinik Amanah`}
      >
        <span className='relative'>
          {label}
          <span
            className='
            absolute -bottom-0.5 left-0 h-px w-0 bg-amanah-blue transition-all
            duration-300
            group-hover/cta:w-full
          '
          />
        </span>
        <MarqueeArrowIndicator />
      </Link>
    </div>
  );
}
