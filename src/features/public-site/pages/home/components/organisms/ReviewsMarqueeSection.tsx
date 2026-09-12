'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { marqueeBottomReviews, marqueeTopReviews } from '../../data/reviewsMarqueeData';
import { MarqueeTrack } from '../atoms/MarqueeTrack';
import { ReviewMarqueeCard } from '../molecules/ReviewMarqueeCard';
import { ReviewMarqueeFloatingCta } from '../molecules/ReviewMarqueeFloatingCta';

gsap.registerPlugin(ScrollTrigger);

type ReviewsMarqueeSectionProps = {
  className?: string;
};

export function ReviewsMarqueeSection({ className }: ReviewsMarqueeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (headerRef.current) {
        const maskLines = headerRef.current.querySelectorAll('[data-mask-text]');
        gsap.fromTo(
          maskLines,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (marqueeContainerRef.current) {
        gsap.fromTo(
          marqueeContainerRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: marqueeContainerRef.current,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id='ulasan-pasien'
      className={`
        group/marquee-section relative w-full overflow-hidden bg-background
        pt-10 pb-16
        sm:pt-14 sm:pb-20
        md:pt-16 md:pb-24
        ${className ?? ''}
      `}
    >
      <SectionContainer className='px-4 sm:px-6'>
        <div className='mb-8 text-center sm:mb-12 md:mb-14'>
          <SectionHeader
            ref={headerRef}
            eyebrow='Ulasan & Kepercayaan'
            title='Pengalaman Nyata Bersama Kami'
            description='Ulasan tulus dari pasien dan keluarga yang telah mempercayakan layanan kesehatannya di Klinik Amanah Healthcare.'
            descriptionClassName='max-w-xl mx-auto'
          />
        </div>
      </SectionContainer>

      {/* Marquee viewport container with edge masks */}
      <div ref={marqueeContainerRef} className='relative flex w-full flex-col gap-4 sm:gap-6'>
        {/* Left and right vignette fade masks */}
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-y-0 left-0 z-10 w-12
            bg-gradient-to-r from-background via-background/70 to-transparent
            sm:w-24
            md:w-36
            lg:w-48
          '
        />
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-y-0 right-0 z-10 w-12
            bg-gradient-to-l from-background via-background/70 to-transparent
            sm:w-24
            md:w-36
            lg:w-48
          '
        />

        {/* Top row marquee: moving left */}
        <MarqueeTrack direction='left' durationSeconds={50} gapClassName='gap-4 sm:gap-6'>
          {marqueeTopReviews.map((review) => (
            <ReviewMarqueeCard key={review.id} review={review} />
          ))}
        </MarqueeTrack>

        {/* Bottom row marquee: moving right */}
        <MarqueeTrack direction='right' durationSeconds={50} gapClassName='gap-4 sm:gap-6'>
          {marqueeBottomReviews.map((review) => (
            <ReviewMarqueeCard key={review.id} review={review} />
          ))}
        </MarqueeTrack>

        {/* Bottom soft gradient mask for smooth floating CTA emergence */}
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20
            bg-gradient-to-t from-background via-background/60 to-transparent
            sm:h-24
          '
        />
      </div>

      {/* Minimalist text-based floating CTA */}
      <ReviewMarqueeFloatingCta href='/ulasan' label='Lihat Semua Ulasan' />
    </section>
  );
}
