'use client';

import type { FacilityItem } from '../types';
import Image from 'next/image';
import {
  HealthcareHeading,
  HealthcareText,
  PixelMeshBackground,
  PixelIcon
} from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { useFacilityCardMotion } from '../model/useFacilityCardMotion';

type FacilityCardProps = {
  facility: FacilityItem;
  index: number;
  className?: string;
  isActive: boolean;
  isPaused: boolean;
  progressDuration?: number;
  onProgressComplete: (index: number) => void;
  onCardHover: (index: number) => void;
  onCardClick?: (index: number) => void;
};

export function FacilityCard({
  facility,
  index,
  className,
  isActive,
  isPaused,
  progressDuration = 4.5,
  onProgressComplete,
  onCardHover,
  onCardClick
}: FacilityCardProps) {
  const motion = useFacilityCardMotion({
    index,
    isActive,
    isPaused,
    onProgressComplete,
    progressDuration
  });

  return (
    <div
      ref={motion.cardRef}
      onMouseEnter={() => onCardHover(index)}
      onClick={() => onCardClick?.(index)}
      onFocus={() => onCardHover(index)}
      tabIndex={0}
      role='button'
      aria-label={facility.title}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCardClick?.(index);
        }
      }}
      className={cn(
        `
          group relative flex min-h-[300px] cursor-pointer flex-col
          justify-between overflow-hidden p-8 select-none
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-primary
          md:min-h-[320px]
          xl:min-h-[344px] xl:px-9 xl:py-10
        `,
        index % 2 === 0 ? 'bg-background' : 'bg-card',
        className
      )}
    >
      {/* Interval Progressive Bar (active only on desktop) */}
      <div
        aria-hidden='true'
        className='
          pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[3.5px]
          overflow-hidden bg-line/20
          md:block
          dark:bg-white/10
        '
      >
        <div
          ref={motion.progressBarRef}
          className='
            size-full origin-left scale-x-0 bg-amanah-blue
            shadow-[0_1px_6px_rgba(49,113,222,0.4)] will-change-transform
            dark:bg-amanah-blue dark:shadow-[0_1px_8px_rgba(49,113,222,0.6)]
          '
        />
      </div>

      {/* Top-Right Corner Pixel Mesh Texture (Active when closed, behind photo layer) */}
      <div
        ref={motion.cornerMeshRef}
        aria-hidden='true'
        className='
          pointer-events-none absolute -top-1 -right-1 z-0 size-44
          overflow-hidden select-none will-change-[transform,opacity]
          sm:size-52
        '
      >
        <PixelMeshBackground
          initialProgress={1}
          progress={1}
          maskGradient='radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.65) 45%, rgba(0, 0, 0, 0.2) 68%, transparent 85%)'
          className='size-full opacity-60 dark:opacity-75'
        />
      </div>

      {/* Slot 5: Background Layer (z-1 covers corner mesh cleanly) */}
      <div
        ref={motion.bgRef}
        aria-hidden='true'
        data-card-bg
        className='
          pointer-events-none absolute inset-0 z-1 opacity-0
          will-change-[transform,opacity]
        '
      >
        <Image
          src={facility.image.src}
          alt={facility.image.alt}
          fill
          sizes='(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw'
          className='object-cover object-center'
        />

        {/* Liquid Glass progressive blur mask - comfortably encases text section */}
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-x-0 bottom-0 h-[62%]
            backdrop-blur-md
            [mask-image:linear-gradient(to_top,black_0%,black_65%,rgba(0,0,0,0.5)_85%,transparent_100%)]
            [-webkit-mask-image:linear-gradient(to_top,black_0%,black_65%,rgba(0,0,0,0.5)_85%,transparent_100%)]
            md:h-[64%]
            xl:h-[65%]
          '
        />

        {/* Liquid Glass soft translucent gradient tone */}
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-x-0 bottom-0 h-[62%]
            bg-linear-to-t from-white/95 via-white/75 via-50% to-transparent
            dark:from-[#090d24]/95 dark:via-[#090d24]/75 dark:via-50%
            dark:to-transparent
            md:h-[64%]
            xl:h-[65%]
          '
        />
      </div>

      {/* Slot 2: Pixel Botanical Icon (No wrapper, pure pixel art) */}
      <div className='relative z-10'>
        <div
          ref={motion.iconRef}
          data-facility-icon
          className='inline-flex shrink-0 items-center justify-center will-change-[transform,opacity]'
        >
          <PixelIcon
            name={facility.pixelIcon ?? 'sakura'}
            size='responsive'
            svgClassName='size-10 md:size-8 transition-transform duration-300 group-hover:scale-110'
          />
        </div>
      </div>

      {/* Bottom slots wrapper */}
      <div className='relative z-10 mt-auto flex flex-col justify-end'>
        {/* Slot 3: Title / Header (Always visible, lifted naturally when subtitle expands) */}
        <HealthcareHeading
          as='h3'
          data-card-title
          size='card'
          className='text-foreground transition-colors duration-300 select-none'
        >
          {facility.title}
        </HealthcareHeading>

        {/* Slot 4: Subtitle / Description (Smoothly expands from below without collision) */}
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-500 ease-out',
            isActive
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          )}
        >
          <div className='overflow-hidden'>
            <div className='pt-2'>
              <HealthcareText
                className='
                  font-medium text-foreground
                  dark:text-white dark:drop-shadow-sm
                '
              >
                {facility.description}
              </HealthcareText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
