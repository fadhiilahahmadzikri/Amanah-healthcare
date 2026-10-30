import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ServiceCardItem } from '../../types';
import Image from 'next/image';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { HealthcareHeading, HealthcareText } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceCardAffordance } from '../atoms/ServiceCardAffordance';

type ServiceBentoCardProps = ComponentPropsWithoutRef<'article'> & {
  item: ServiceCardItem;
  imageSlot?: ReactNode;
  iconSlot?: ReactNode;
  affordanceSlot?: ReactNode;
  contentSlot?: ReactNode;
};

export function ServiceBentoCard({
  item,
  className,
  imageSlot,
  iconSlot,
  affordanceSlot,
  contentSlot,
  ...articleProps
}: ServiceBentoCardProps) {
  const isInteractive = Boolean(articleProps.onClick) || articleProps.role === 'button';
  const hasImage = Boolean(item.image?.src);

  if (hasImage) {
    return (
      <article
        {...articleProps}
        data-service-card
        className={cn(
          `
            group relative flex flex-col justify-end overflow-hidden border
            border-line bg-card text-foreground transition-colors duration-300
            select-none
            focus-visible:ring-2 focus-visible:ring-primary
            focus-visible:ring-offset-2 focus-visible:outline-none
          `,
          isInteractive && 'cursor-pointer',
          item.colSpanClass ?? 'col-span-12 md:col-span-6',
          item.heightClass ?? 'min-h-[220px] md:min-h-[240px]',
          className
        )}
      >
        {/* Background Visual Layer for Landing Page */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-0 overflow-hidden'
        >
          {imageSlot ?? (
            <Image
              src={item.image!.src}
              alt={item.image!.alt}
              fill
              sizes='(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw'
              className='
                object-cover object-center
                max-md:scale-100 max-md:blur-none max-md:transition-none
                md:transition-all md:duration-500 md:ease-out
                md:group-hover:scale-105 md:group-hover:blur-[6px]
              '
            />
          )}

          <div
            aria-hidden='true'
            className='
              pointer-events-none absolute inset-x-0 bottom-0 h-[52%]
              backdrop-blur-md
              [mask-image:linear-gradient(to_top,black_0%,black_65%,rgba(0,0,0,0.5)_85%,transparent_100%)]
              [-webkit-mask-image:linear-gradient(to_top,black_0%,black_65%,rgba(0,0,0,0.5)_85%,transparent_100%)]
              md:hidden
            '
          />

          <div
            aria-hidden='true'
            className='
              pointer-events-none absolute inset-x-0 bottom-0 h-[52%]
              bg-linear-to-t from-white/95 via-white/75 via-50% to-transparent
              dark:from-[#090d24]/95 dark:via-[#090d24]/75 dark:via-50%
              dark:to-transparent
              md:hidden
            '
          />

          <div
            aria-hidden='true'
            className='
              pointer-events-none absolute inset-x-0 bottom-0 hidden h-[65%]
              bg-linear-to-t from-background/85 via-background/45 to-transparent
              transition-all duration-500
              group-hover:h-[82%] group-hover:from-background/95
              group-hover:via-background/75 group-hover:to-transparent
              md:block
            '
          />
        </div>

        <div
          className='
            pointer-events-none absolute top-3 right-3 z-20
            max-md:transform-none max-md:transition-none
            md:transition-transform md:duration-300
            sm:top-3.5 sm:right-3.5
          '
        >
          {affordanceSlot ?? <ServiceCardAffordance ariaLabel={`Buka detail ${item.title}`} />}
        </div>

        <div className='relative z-10 p-3.5 sm:p-4 md:p-4.5'>
          {contentSlot ?? (
            <div className='flex flex-col gap-1'>
              <HealthcareHeading
                as='h3'
                size='compact'
                className='
                  text-foreground
                  max-md:transform-none max-md:transition-none
                  md:transition-transform md:duration-300
                  md:group-hover:-translate-y-0.5
                '
              >
                {item.title}
              </HealthcareHeading>

              <div
                className='
                  max-md:max-h-28 max-md:opacity-100 max-md:overflow-hidden max-md:transition-none
                  md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:ease-out
                  md:group-hover:max-h-24 md:group-hover:opacity-100
                  md:group-focus-visible:max-h-24 md:group-focus-visible:opacity-100
                '
              >
                <HealthcareText
                  size='caption'
                  className='text-muted-foreground dark:text-slate-300'
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

  // Booking Modal Mode (Icon-driven, minimal, no Image dependency)
  return (
    <article
      {...articleProps}
      data-service-card
      className={cn(
        `
          group relative flex flex-col justify-between overflow-hidden rounded-2xl border
          border-line/70 bg-card p-4 text-foreground transition-all duration-300
          hover:border-primary/50 hover:shadow-md select-none
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-offset-2 focus-visible:outline-none
        `,
        isInteractive && 'cursor-pointer',
        item.colSpanClass ?? 'col-span-12 md:col-span-6',
        item.heightClass ?? 'min-h-[140px]',
        className
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='shrink-0'>
          {iconSlot ?? (
            <ShiftIconDisplay
              icon={item.iconName || 'stethoscope'}
              fallback={item.title.substring(0, 3)}
              size='lg'
              className='size-11 rounded-xl bg-primary/10 text-primary'
            />
          )}
        </div>

        <div>
          {affordanceSlot ?? <ServiceCardAffordance ariaLabel={`Buka detail ${item.title}`} />}
        </div>
      </div>

      <div className='mt-3 flex flex-col gap-1'>
        {contentSlot ?? (
          <>
            <HealthcareHeading
              as='h3'
              size='compact'
              className='
                text-foreground font-semibold text-base leading-tight
                transition-transform duration-300
                group-hover:translate-x-0.5
              '
            >
              {item.title}
            </HealthcareHeading>

            {item.description && (
              <HealthcareText
                size='caption'
                className='text-muted-foreground line-clamp-2 text-xs pt-0.5'
              >
                {item.description}
              </HealthcareText>
            )}
          </>
        )}
      </div>
    </article>
  );
}
