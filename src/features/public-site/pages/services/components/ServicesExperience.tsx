'use client';

import type { ServiceCategoryContext } from '../types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import { SectionContainer } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { generalPractitionerSection, midwiferySection } from '../data';
import { ServiceStickyIndicator } from './molecules/ServiceStickyIndicator';
import { ServiceCategoryBlock } from './organisms/ServiceCategoryBlock';

gsap.registerPlugin(ScrollTrigger);

type ServicesExperienceProps = {
  className?: string;
};

export function ServicesExperience({ className }: ServicesExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeContext, setActiveContext] =
    useState<ServiceCategoryContext>('general-practitioner');

  useGSAP(
    () => {
      const generalEl = document.getElementById(generalPractitionerSection.id);
      const midwiferyEl = document.getElementById(midwiferySection.id);

      if (!generalEl || !midwiferyEl) {
        return;
      }

      ScrollTrigger.create({
        trigger: generalEl,
        start: 'top 60%',
        end: 'bottom 45%',
        onEnter: () => setActiveContext('general-practitioner'),
        onEnterBack: () => setActiveContext('general-practitioner')
      });

      ScrollTrigger.create({
        trigger: midwiferyEl,
        start: 'top 55%',
        end: 'bottom 40%',
        onEnter: () => setActiveContext('midwifery'),
        onEnterBack: () => setActiveContext('midwifery'),
        onLeaveBack: () => setActiveContext('general-practitioner')
      });
    },
    { scope: containerRef }
  );

  const handleSelectContext = (context: ServiceCategoryContext) => {
    setActiveContext(context);
    const targetId =
      context === 'general-practitioner' ? generalPractitionerSection.id : midwiferySection.id;

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      if (typeof window !== 'undefined' && window.publicSiteLenis) {
        window.publicSiteLenis.scrollTo(targetEl, {
          offset: -105,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t))
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative bg-background', className)}>
      <SectionContainer
        className='
        px-0
        sm:px-0
      '
      >
        <div
          className='
          flex flex-col
          lg:flex-row lg:items-stretch
        '
        >
          {/* Left Column: Dedicated panel extending directly through shell and rail boundaries */}
          <aside
            className='
              sticky top-12 z-30 shrink-0 border-b border-line bg-background/95
              p-0 backdrop-blur-md
              lg:static lg:top-auto lg:z-auto lg:mb-[72px] lg:w-[220px]
              lg:border-r lg:border-b-0 lg:bg-background lg:pt-[72px]
              lg:backdrop-blur-none
              xl:mb-20 xl:w-[240px] xl:pt-20
            '
          >
            <div
              className='
              w-full
              lg:sticky lg:top-20 lg:z-20
            '
            >
              <ServiceStickyIndicator
                activeContext={activeContext}
                onSelectContext={handleSelectContext}
                className='w-full'
              />
            </div>
          </aside>

          {/* Right Column: Independent sections for the service content */}
          <div className='min-w-0 flex-1 divide-y divide-line'>
            {/* Block 1: Pelayanan Dokter Umum */}
            <div
              className='
              p-4
              sm:p-6
              lg:p-8
              xl:p-10
            '
            >
              <ServiceCategoryBlock section={generalPractitionerSection} />
            </div>

            {/* Block 2: Layanan Kesehatan Ibu dan Anak */}
            <div
              className='
              p-4
              sm:p-6
              lg:p-8
              xl:p-10
            '
            >
              <ServiceCategoryBlock section={midwiferySection} />
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
