'use client';

import type { EditorialStoryData } from '../../types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { EditorialInsetFrame } from '../molecules/EditorialInsetFrame';
import { EditorialStoryContent } from '../molecules/EditorialStoryContent';

gsap.registerPlugin(ScrollTrigger);

type EditorialStorySectionProps = {
  className?: string;
  data: EditorialStoryData;
  hasBorderBottom?: boolean;
};

export function EditorialStorySection({
  className,
  data,
  hasBorderBottom = true
}: EditorialStorySectionProps) {
  const isImageLeft = data.imagePosition === 'left';
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      // 1. Text Mask Lines (Title and Description)
      const maskLines = sectionRef.current.querySelectorAll('[data-mask-text]');
      if (maskLines.length > 0) {
        gsap.fromTo(
          maskLines,
          { opacity: 0, yPercent: 120 },
          {
            duration: 1.2,
            ease: 'expo.out',
            opacity: 1,
            scrollTrigger: {
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              trigger: sectionRef.current
            },
            stagger: 0.12,
            yPercent: 0
          }
        );
      }

      // 2. Editorial Image Frame and Picture
      const frame = sectionRef.current.querySelector('[data-editorial-frame]');
      if (frame) {
        gsap.fromTo(
          frame,
          { opacity: 0, y: 35 },
          {
            duration: 1.1,
            ease: 'expo.out',
            opacity: 1,
            scrollTrigger: {
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              trigger: sectionRef.current
            },
            y: 0
          }
        );
      }

      const image = sectionRef.current.querySelector('[data-editorial-image]');
      if (image) {
        gsap.fromTo(
          image,
          { opacity: 0, scale: 1.08 },
          {
            duration: 1.4,
            ease: 'power2.out',
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              start: 'top 82%',
              toggleActions: 'play none none reverse',
              trigger: sectionRef.current
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
      className={cn('w-full bg-background', hasBorderBottom && 'border-b border-line', className)}
    >
      <div
        className='
        grid grid-cols-1
        lg:grid-cols-2
      '
      >
        {isImageLeft ? (
          <>
            <div className='flex items-center justify-center'>
              <EditorialInsetFrame image={data.image} />
            </div>
            <div className='flex items-center'>
              <EditorialStoryContent title={data.title} description={data.description} />
            </div>
          </>
        ) : (
          <>
            <div className='flex items-center'>
              <EditorialStoryContent title={data.title} description={data.description} />
            </div>
            <div className='flex items-center justify-center'>
              <EditorialInsetFrame image={data.image} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
