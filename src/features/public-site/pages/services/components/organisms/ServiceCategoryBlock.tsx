'use client';

import type { ServiceCategorySection } from '../../types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceInfoPanel } from '../molecules/ServiceInfoPanel';
import { ServiceBentoGrid } from './ServiceBentoGrid';

gsap.registerPlugin(ScrollTrigger);

type ServiceCategoryBlockProps = {
  section: ServiceCategorySection;
  className?: string;
};

export function ServiceCategoryBlock({ section, className }: ServiceCategoryBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const isBentoLeft = section.layout === 'bento-left';

  useGSAP(
    () => {
      if (!blockRef.current) {
        return;
      }

      // Animate on scroll: staggered wave for bento cards (susul-susulan)
      const cards = blockRef.current.querySelectorAll('[data-service-card]');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: blockRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: blockRef }
  );

  return (
    <div
      ref={blockRef}
      id={section.id}
      data-service-section={section.contextKey}
      className={cn(
        `
        scroll-mt-24 py-6
        md:py-8
        lg:py-10
      `,
        className
      )}
    >
      <div
        className='
        grid grid-cols-1 gap-6
        lg:grid-cols-12 lg:items-start lg:gap-6
        xl:gap-8
      '
      >
        {/* Bento Grid Slot */}
        <div
          className={cn(
            'lg:col-span-8',
            isBentoLeft
              ? `
                order-2
                lg:order-1
              `
              : `
                order-2
                lg:order-2
              `
          )}
        >
          <ServiceBentoGrid items={section.services} />
        </div>

        {/* Informational Panel Slot */}
        <div
          className={cn(
            'lg:sticky lg:top-28 lg:col-span-4',
            isBentoLeft
              ? `
                order-1
                lg:order-2
              `
              : `
                order-1
                lg:order-1
              `
          )}
        >
          <ServiceInfoPanel
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />
        </div>
      </div>
    </div>
  );
}
