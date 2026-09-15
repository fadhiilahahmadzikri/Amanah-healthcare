'use client';

import type { ServiceItem } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/features/public-site/components/ui/button';
import { cn } from '@/features/public-site/lib/helpers';
import { useServicesCarousel } from '../model/useServicesCarousel';

type ServicesCarouselProps = {
  services: ServiceItem[];
};

export function ServicesCarousel({ services }: ServicesCarouselProps) {
  const { refs, state, actions } = useServicesCarousel({ itemCount: services.length });

  if (services.length === 0) {
    return null;
  }

  return (
    <div ref={refs.containerRef} className='relative overflow-visible'>
      <div
        className='
          pointer-events-none absolute inset-0 z-20 flex items-center
          justify-between
        '
        aria-label='Navigasi poster layanan'
      >
        <Button
          type='button'
          size='icon-lg'
          variant='outline'
          className='
            pointer-events-auto -translate-x-1/2 rounded-xl border-line
            bg-background/95 text-foreground shadow-sm backdrop-blur-sm
            hover:border-primary hover:bg-accent hover:text-primary
          '
          aria-label='Lihat layanan sebelumnya'
          onClick={actions.scrollToPreviousService}
        >
          <ArrowLeftIcon data-icon='inline-start' />
        </Button>
        <Button
          type='button'
          size='icon-lg'
          variant='outline'
          className='
            pointer-events-auto translate-x-1/2 rounded-xl border-line
            bg-background/95 text-foreground shadow-sm backdrop-blur-sm
            hover:border-primary hover:bg-accent hover:text-primary
          '
          aria-label='Lihat layanan berikutnya'
          onClick={actions.scrollToNextService}
        >
          <ArrowRightIcon data-icon='inline-start' />
        </Button>
      </div>

      <div
        ref={refs.viewportRef}
        onScroll={actions.syncActiveService}
        className='
          scroll-px-6 scrollbar-none overflow-x-auto scroll-smooth px-6
          md:scroll-px-10 md:px-10
          [&::-webkit-scrollbar]:hidden
        '
      >
        <div className='flex w-max snap-x snap-mandatory gap-6'>
          {services.map((service, index) => (
            <article
              key={service.title}
              data-service-index={index}
              className='
                relative aspect-376/428 w-[min(78vw,376px)] shrink-0 snap-start
                overflow-hidden border-t border-line bg-muted
              '
            >
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                sizes='(min-width: 768px) 376px, 78vw'
                className='object-cover'
              />
            </article>
          ))}
        </div>
      </div>

      <div
        className='
        absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center
        gap-1.5 rounded-lg border border-line bg-background/85 px-3 py-2
        backdrop-blur-md
      '
      >
        {services.map((service, index) => (
          <button
            key={service.title}
            type='button'
            className='flex h-3 w-8 items-center justify-center'
            aria-label={`Tampilkan layanan ${index + 1}`}
            aria-pressed={index === state.activeIndex}
            onClick={() => actions.scrollToService(index)}
          >
            <span
              className={cn(
                'block h-1.5 rounded-full transition-all',
                index === state.activeIndex
                  ? 'w-8 bg-primary shadow-sm'
                  : `
                    size-1.5 bg-primary/30
                    hover:bg-primary/60
                  `
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
