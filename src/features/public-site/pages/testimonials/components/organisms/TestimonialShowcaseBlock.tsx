'use client';

import type { TestimonialShowcaseItem } from '../../types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { SectionHeader } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { TestimonialVideoPlayer } from '../atoms/TestimonialVideoPlayer';
import { TestimonialHeaderIcons } from '../molecules/TestimonialHeaderIcons';
import { TestimonialStoryContent } from '../molecules/TestimonialStoryContent';

gsap.registerPlugin(ScrollTrigger);

type TestimonialShowcaseBlockProps = {
  item: TestimonialShowcaseItem;
  className?: string;
  showDivider?: boolean;
};

export function TestimonialShowcaseBlock({ item, className }: TestimonialShowcaseBlockProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isReversed = Boolean(item.reversed);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      // Animate on scroll: Header pixel icons pop-in stagger & heading reveal
      if (headerRef.current) {
        const iconItems = headerRef.current.querySelectorAll('[data-header-icon]');
        const heading = headerRef.current.querySelector('[data-mask-text]');

        if (iconItems.length > 0) {
          gsap.fromTo(
            iconItems,
            { scale: 0.35, y: 18, opacity: 0 },
            {
              scale: 1,
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      // Animate on scroll: Card container entrance
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Animate on scroll: Story text staggered reveal
      if (contentRef.current) {
        const textElements = contentRef.current.querySelectorAll('[data-content-item]');
        if (textElements.length > 0) {
          gsap.fromTo(
            textElements,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cardRef.current ?? sectionRef.current,
                start: 'top 78%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      // Animate on scroll: Video container scale & fade
      if (videoWrapperRef.current) {
        gsap.fromTo(
          videoWrapperRef.current,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current ?? sectionRef.current,
              start: 'top 78%',
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
      id={item.id}
      className={cn(
        `
          relative w-full overflow-hidden bg-background py-14
          sm:py-20
          md:py-24
        `,
        className
      )}
    >
      <SectionHeader
        ref={headerRef}
        className='
          mb-10 w-full px-4
          sm:mb-12
          md:mb-14
        '
        eyebrow={<TestimonialHeaderIcons icons={item.pixelIcons} />}
        headingSize='section'
        title={item.title}
      />

      {/* Wrapper mentok kanan-kiri tanpa padding/margin luar, bersatu dengan shell rails */}
      <div ref={cardRef} className='w-full border-y border-line bg-card text-card-foreground'>
        <div
          className='
            flex w-full flex-col
            lg:flex-row lg:items-stretch
          '
        >
          {/* Sisi Konten Narasi: default kiri, reversed kanan */}
          <div
            ref={contentRef}
            className={cn(
              'order-2 flex flex-1 flex-col justify-between',
              isReversed ? 'lg:order-2' : 'lg:order-1'
            )}
          >
            <TestimonialStoryContent item={item} />
          </div>

          {/* Sisi Video 9:16: default kanan, reversed kiri */}
          <div
            ref={videoWrapperRef}
            className={cn(
              `
                relative order-1 flex w-full shrink-0 items-center
                justify-center overflow-hidden border-b border-line bg-muted/30
                lg:w-[380px] lg:border-b-0
                xl:w-[420px]
              `,
              isReversed ? 'lg:order-1 lg:border-r' : 'lg:order-2 lg:border-l'
            )}
          >
            <TestimonialVideoPlayer video={item.video} />
          </div>
        </div>
      </div>
    </section>
  );
}
