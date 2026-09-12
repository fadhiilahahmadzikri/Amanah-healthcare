import type { ReactNode } from 'react';
import type { ServiceCardItem } from '../../types';
import Image from 'next/image';
import { HealthcareHeading, HealthcareText } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceCardAffordance } from '../atoms/ServiceCardAffordance';

type ServiceBentoCardProps = {
  item: ServiceCardItem;
  className?: string;
  imageSlot?: ReactNode;
  affordanceSlot?: ReactNode;
  contentSlot?: ReactNode;
};

export function ServiceBentoCard({
  item,
  className,
  imageSlot,
  affordanceSlot,
  contentSlot
}: ServiceBentoCardProps) {
  return (
    <article
      data-service-card
      className={cn(
        `
          group relative flex flex-col justify-end overflow-hidden border
          border-line bg-card text-foreground transition-colors duration-300
          select-none
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-offset-2 focus-visible:outline-none
        `,
        item.colSpanClass ??
          `
          col-span-12
          md:col-span-6
        `,
        item.heightClass ??
          `
          min-h-[220px]
          md:min-h-[240px]
        `,
        className
      )}
    >
      {/* Background Visual Layer */}
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
        {imageSlot ?? (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes='(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw'
            className='
              object-cover object-center transition-all duration-500 ease-out
              group-hover:scale-105 group-hover:blur-[6px]
            '
          />
        )}

        {/* Smooth upward masking: shorter height and softer density in default state */}
        <div
          className='
            absolute inset-x-0 bottom-0 h-[65%] bg-linear-to-t
            from-background/85 via-background/45 to-transparent transition-all
            duration-500
            group-hover:h-[82%] group-hover:from-background/95
            group-hover:via-background/75 group-hover:to-transparent
          '
        />
      </div>

      {/* Trailing Interaction Indicator with Glassmorphism */}
      <div
        className='
          pointer-events-none absolute top-3 right-3 z-20 transition-transform
          duration-300
          sm:top-3.5 sm:right-3.5
        '
      >
        {affordanceSlot ?? <ServiceCardAffordance ariaLabel={`Buka detail ${item.title}`} />}
      </div>

      {/* Contextual Information Layer (Revealed on Hover / Focus) */}
      <div
        className='
        relative z-10 p-3.5
        sm:p-4
        md:p-4.5
      '
      >
        {contentSlot ?? (
          <div className='flex flex-col gap-1'>
            <HealthcareHeading
              as='h3'
              size='compact'
              className='
                text-foreground transition-transform duration-300
                group-hover:-translate-y-0.5
              '
            >
              {item.title}
            </HealthcareHeading>

            {/* Description revealed on hover / focus, gently visible on mobile */}
            <div
              className='
                max-h-0 overflow-hidden opacity-0 transition-all duration-300
                ease-out
                group-hover:max-h-24 group-hover:opacity-100
                group-focus-visible:max-h-24 group-focus-visible:opacity-100
                max-md:max-h-24 max-md:opacity-90
              '
            >
              <HealthcareText
                size='caption'
                className='
                  text-muted-foreground
                  dark:text-slate-300
                '
              >
                {item.description}
              </HealthcareText>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
