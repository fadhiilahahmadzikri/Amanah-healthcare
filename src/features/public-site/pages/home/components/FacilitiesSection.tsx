'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRightIcon, BadgeCheckIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HealthcareText,
  SectionContainer,
  SectionHeader,
  ViewportLine
} from '@/features/public-site/components/shared';
import { facilities, watermark } from '../data';
import { FacilityCard } from './FacilityCard';

gsap.registerPlugin(ScrollTrigger);

const facilityBorderClassNames = [
  'border-b border-line md:border-r xl:border-b-0',
  'border-b border-line md:border-r-0 xl:border-r xl:border-b-0',
  'border-b border-line md:border-r md:border-b-0 xl:border-r xl:border-b-0',
  'border-b-0 md:border-b-0 xl:border-r-0'
];

export function FacilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isUserHovering, setIsUserHovering] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);
    return () => media.removeEventListener('change', updateMobile);
  }, []);

  const handleProgressComplete = useCallback((completedIndex: number) => {
    setActiveCardIndex((current) => {
      if (current === completedIndex) {
        return (current + 1) % facilities.length;
      }
      return current;
    });
  }, []);

  const handleCardHover = useCallback((index: number) => {
    setIsUserHovering(true);
    setActiveCardIndex(index);
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (isMobile) {
        setActiveCardIndex((current) => (current === index ? -1 : index));
      } else {
        handleCardHover(index);
      }
    },
    [isMobile, handleCardHover]
  );

  const handleGridLeave = useCallback(() => {
    setIsUserHovering(false);
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: () => setIsInView(true),
        onLeave: () => setIsInView(false),
        onEnterBack: () => setIsInView(true),
        onLeaveBack: () => setIsInView(false)
      });

      if (watermarkRef.current) {
        gsap.to(watermarkRef.current, {
          yPercent: 25,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

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

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('article');
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      const mm = gsap.matchMedia();

      // Mobile Strada-style scroll accordion
      mm.add('(max-width: 767px)', () => {
        if (!gridRef.current) {
          return;
        }

        const cardElements = gridRef.current.querySelectorAll('article');
        cardElements.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 65%',
            end: 'bottom 35%',
            onEnter: () => setActiveCardIndex(index),
            onEnterBack: () => setActiveCardIndex(index),
            onLeave: () => {
              setActiveCardIndex((current) => (current === index ? -1 : current));
            },
            onLeaveBack: () => {
              setActiveCardIndex((current) => (current === index ? -1 : current));
            }
          });
        });
      });

      // Desktop: restore first card active if none was active
      mm.add('(min-width: 768px)', () => {
        setActiveCardIndex((current) => (current === -1 ? 0 : current));
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id='fasilitas' className='bg-background'>
      <SectionContainer
        className='
        relative px-0
        sm:px-0
      '
      >
        <div
          className='
          relative px-6 py-12
          md:px-10 md:py-16
        '
        >
          <div
            ref={watermarkRef}
            aria-hidden
            className='
              pointer-events-none absolute inset-0 hidden overflow-hidden
              md:block
            '
          >
            <Image
              src={watermark.src}
              alt=''
              width={547}
              height={547}
              className='
                absolute top-0 -right-14 h-auto w-[617px] max-w-none
                opacity-[0.045] brightness-0
                dark:opacity-[0.08] dark:brightness-100
              '
              aria-hidden
            />
          </div>

          <div
            ref={headerRef}
            className='
              relative z-10 grid gap-10
              lg:grid-cols-[1fr_0.9fr] lg:items-center
            '
          >
            <SectionHeader
              align='left'
              eyebrow='Why Choose Us'
              title='Langkah Pertama, Untuk Keluarga'
              headingClassName='max-w-2xl'
            />

            <div className='flex items-center gap-5 text-muted-foreground'>
              <BadgeCheckIcon aria-hidden className='size-6 shrink-0 text-amanah-mint' />
              <div className='flex flex-col gap-2'>
                <HealthcareText className='italic'>Terverifikasi SATUSEHAT</HealthcareText>
                <Link
                  href='/kontak'
                  className='
                    inline-flex w-fit amanah-type-body items-center gap-2
                    border-b border-line pb-1 font-semibold text-primary
                    transition-colors
                    hover:border-primary hover:text-amanah-blue
                  '
                >
                  Jadwalkan Kunjungan Anda
                  <ArrowUpRightIcon aria-hidden />
                </Link>
              </div>
            </div>
          </div>
          <ViewportLine position='bottom' />
        </div>

        <div
          ref={gridRef}
          onMouseLeave={handleGridLeave}
          className='
            relative z-10 grid
            md:grid-cols-2
            xl:grid-cols-4
          '
        >
          {facilities.map((facility, index) => {
            return (
              <FacilityCard
                key={facility.title}
                facility={facility}
                index={index}
                className={facilityBorderClassNames[index]}
                isActive={
                  isMobile ? activeCardIndex === index : isInView && activeCardIndex === index
                }
                isPaused={isMobile ? true : isUserHovering || !isInView}
                progressDuration={4.5}
                onProgressComplete={handleProgressComplete}
                onCardHover={handleCardHover}
                onCardClick={handleCardClick}
              />
            );
          })}
        </div>
      </SectionContainer>
    </section>
  );
}
