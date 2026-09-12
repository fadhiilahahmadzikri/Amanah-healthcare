'use client';

import type { TestimonialsHeroData } from '../../types';
import type { PixelMeshBackgroundHandle } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { PixelMeshBackground } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { cn } from '@/features/public-site/lib/helpers';

type TestimonialsHeroSectionProps = {
  data: TestimonialsHeroData;
  className?: string;
};

export function TestimonialsHeroSection({ data, className }: TestimonialsHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pixelMeshRef = useRef<PixelMeshBackgroundHandle>(null);
  const pixelContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Hero entrance timeline: executes on load / reload (identik dengan ulasan)
      const entranceTl = gsap.timeline({
        delay: 0.1,
        defaults: { ease: 'expo.out' }
      });

      // Pixel texture organic crawl from bottom to top
      const crawlState = { progress: 0 };
      entranceTl.to(
        crawlState,
        {
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            pixelMeshRef.current?.setProgress(crawlState.progress);
          },
          progress: 1
        },
        0
      );

      // Header mask text lines (eyebrow script, title heading, description lead)
      if (headerRef.current) {
        const maskLines = headerRef.current.querySelectorAll('[data-mask-text]');
        if (maskLines.length > 0) {
          entranceTl.fromTo(
            maskLines,
            { yPercent: 120, opacity: 0 },
            {
              duration: 1.2,
              ease: 'expo.out',
              opacity: 1,
              stagger: 0.12,
              yPercent: 0
            },
            0.15
          );
        }
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className={cn(
        `
          relative overflow-hidden bg-background py-14
          sm:py-16
          md:py-20
        `,
        className
      )}
    >
      {/* Curved soft-blend pixel texture background (identik dengan halaman ulasan) */}
      <div
        ref={pixelContainerRef}
        data-pixel-background
        aria-hidden='true'
        className='
          pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px]
          overflow-hidden select-none
          sm:h-[520px]
          md:h-[580px]
        '
      >
        <PixelMeshBackground
          ref={pixelMeshRef}
          initialProgress={0}
          maskGradient='radial-gradient(ellipse 80% 70% at 50% 15%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.85) 40%, rgba(0, 0, 0, 0.45) 65%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)'
          className='
            size-full opacity-35
            dark:opacity-55
          '
        />
      </div>

      <SectionContainer
        className='
        relative z-10 px-4
        sm:px-6
      '
      >
        <SectionHeader
          ref={headerRef}
          eyebrow={data.eyebrow}
          headingAs='h1'
          headingSize='display'
          title={data.title}
          description={data.subtitle}
          descriptionSize='lead'
          className='mx-auto max-w-4xl text-center'
        />
      </SectionContainer>
    </section>
  );
}
