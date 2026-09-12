'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { aboutSlides } from '../../data';
import { AboutCarousel } from '../molecules/AboutCarousel';

gsap.registerPlugin(ScrollTrigger);

export function AboutCarouselSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headerRef.current) {
        return;
      }

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
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id='tentang-kami-carousel' className='overflow-hidden bg-background'>
      <SectionContainer
        className='
        px-0
        sm:px-0
      '
      >
        <div
          className='
          overflow-hidden bg-card pt-12
          md:pt-20
        '
        >
          <SectionHeader
            ref={headerRef}
            className='px-6'
            eyebrow='Tentang Kami'
            title='Kenali Klinik Amanah'
            headingSize='display'
            description='Memberikan pelayanan kesehatan yang profesional, nyaman, dan terpercaya untuk Anda dan keluarga.'
            descriptionSize='lead'
          />

          <AboutCarousel slides={aboutSlides} />
        </div>
      </SectionContainer>
    </section>
  );
}
