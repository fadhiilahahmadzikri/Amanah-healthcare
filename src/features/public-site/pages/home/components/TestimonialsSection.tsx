'use client';

import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { CardFanCarousel } from '@/features/public-site/components/ui/card-fan-carousel';
import { documentationMoments } from '../data';
import { useTestimonialsSection } from '../model/useTestimonialsSection';

export function TestimonialsSection() {
  const testimonialsSection = useTestimonialsSection();

  return (
    <section
      ref={testimonialsSection.refs.sectionRef}
      id='dokumentasi'
      className='
        relative w-full overflow-hidden bg-background py-10
        sm:py-12
        md:py-16
      '
    >
      {/* Scoped confetti canvas covering section to let particles fall onto carousel cards */}
      <canvas
        ref={testimonialsSection.refs.canvasRef}
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-30 size-full'
      />

      <SectionContainer
        className='
          relative flex flex-col items-center px-4
          sm:px-6
        '
      >
        <div className='relative flex w-full max-w-6xl items-center justify-center'>
          {/* Confetti launch anchors positioned at sides of header */}
          <span
            ref={testimonialsSection.refs.cannonLeftRef}
            className='
              pointer-events-none absolute top-1/2 left-0 size-1 -translate-y-1/2
              opacity-0
              sm:left-2
              md:left-4
            '
            aria-hidden
          />

          <SectionHeader
            ref={testimonialsSection.refs.headerRef}
            className='
              mb-6 w-full px-2
              md:mb-8
            '
            eyebrow='Momen Bersama'
            headingSize='display'
            headingClassName='max-w-5xl'
            title='Bersama Keluarga, Setiap Langkah'
            description='Dokumentasi momen keluarga yang kami dampingi dalam berbagai perjalanan kesehatan.'
            descriptionSize='lead'
          />

          <span
            ref={testimonialsSection.refs.cannonRightRef}
            className='
              pointer-events-none absolute top-1/2 right-0 size-1 -translate-y-1/2
              opacity-0
              sm:right-2
              md:right-4
            '
            aria-hidden
          />
        </div>
      </SectionContainer>

      <div
        ref={testimonialsSection.refs.carouselContainerRef}
        className='relative w-full overflow-x-clip overflow-y-visible'
      >
        <CardFanCarousel cards={documentationMoments} autoPlay={true} autoPlayInterval={2800} />
      </div>
    </section>
  );
}
