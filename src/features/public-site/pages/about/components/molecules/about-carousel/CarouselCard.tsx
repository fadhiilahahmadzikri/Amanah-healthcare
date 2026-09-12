import type { Ref } from 'react';
import type { AboutSlide } from '../../../types';
import Image from 'next/image';
import { memo } from 'react';
import {
  HealthcareEyebrow,
  HealthcareHeading,
  HealthcareText
} from '@/features/public-site/components/shared';

type CarouselCardProps = {
  index: number;
  isPriority: boolean;
  onClick: () => void;
  ref?: Ref<HTMLDivElement>;
  slide: AboutSlide;
  totalSlides: number;
};

export const CarouselCard = memo(
  ({ index, isPriority, onClick, ref, slide, totalSlides }: CarouselCardProps) => {
    return (
      <div
        ref={ref}
        className='
        absolute size-full max-w-4xl cursor-pointer overflow-hidden bg-card
        shadow-2xl will-change-[transform,opacity,filter] select-none
        backface-hidden transform-3d
      '
        data-card-item
        data-index={index}
        role='button'
        tabIndex={0}
        aria-label={slide.title}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {/* Image container with upward offset and seamless alpha fade into the card podium */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div
            className='
            relative h-[calc(100%+5rem)] w-full -translate-y-20
            sm:h-[calc(100%+6rem)] sm:-translate-y-24
            md:h-[calc(100%+7rem)] md:-translate-y-28
          '
            style={{
              maskImage:
                'linear-gradient(to bottom, black 0%, black 38%, rgba(0, 0, 0, 0.7) 58%, transparent 86%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 38%, rgba(0, 0, 0, 0.7) 58%, transparent 86%)'
            }}
          >
            <Image
              src={slide.image.src}
              alt={slide.title}
              fill
              priority={isPriority}
              sizes='(min-width: 1200px) 1022px, calc(100vw - 2rem)'
              className='pointer-events-none size-full object-cover object-bottom'
            />
          </div>

          {/* Seamless gradient overlay blending into the card podium */}
          <div
            className='
            pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-linear-to-t
            from-card via-card/85 via-40% to-transparent
            sm:h-80
            md:h-96
          '
          />

          {/* Gradual liquid glass blur fading out softly without harsh boundaries */}
          <div
            className='
            pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56
            overflow-hidden
            sm:h-64
            md:h-72
          '
            style={{
              maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.8) 35%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to top, black 0%, rgba(0,0,0,0.8) 35%, transparent 100%)'
            }}
          >
            <div
              className='absolute inset-0'
              style={{
                backdropFilter: 'blur(3px)'
              }}
            />
            <div
              className='absolute inset-0'
              style={{
                backdropFilter: 'blur(8px)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)'
              }}
            />
          </div>
        </div>

        <div
          className='
          pointer-events-none absolute top-4 right-4 z-10
          sm:top-6 sm:right-6
        '
        >
          <div
            className='
            rounded-lg border border-white/30 bg-white/15 px-3 py-1 font-mono
            amanah-type-caption font-semibold text-foreground
            shadow-[0_8px_30px_rgb(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)]
            backdrop-blur-xl
            sm:px-3.5 sm:py-1.5
            dark:border-white/20 dark:bg-white/10
          '
          >
            <span>{index + 1}</span>
            <span className='px-1.5 opacity-60'>/</span>
            <span className='opacity-60'>{totalSlides}</span>
          </div>
        </div>

        <div
          className='
          pointer-events-none absolute inset-x-0 bottom-0 z-10 flex max-w-3xl
          flex-col gap-1.5 p-5 pb-16 text-left text-foreground
          sm:gap-2 sm:p-8 sm:pb-20
          md:gap-3 md:px-10 md:pb-24
          lg:p-10 lg:pb-24
        '
        >
          <HealthcareEyebrow
            data-card-tag
            className='
            text-muted-foreground drop-shadow-sm
            will-change-[transform,opacity,filter]
          '
          >
            {slide.eyebrow}
          </HealthcareEyebrow>
          <HealthcareHeading
            as='h2'
            data-card-title
            size='subsection'
            className='
            font-sans font-semibold text-foreground drop-shadow-md
            will-change-[transform,opacity,filter]
          '
          >
            {slide.title}
          </HealthcareHeading>
          <HealthcareText
            data-card-desc
            size='body'
            className='
            line-clamp-3 max-w-3xl font-normal text-muted-foreground
            drop-shadow-sm will-change-[transform,opacity,filter]
          '
          >
            {slide.description}
          </HealthcareText>
        </div>
      </div>
    );
  }
);
