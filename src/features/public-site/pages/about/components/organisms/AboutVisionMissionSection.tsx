'use client';

import type { AboutVisionMissionData } from '../../types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { VisionMissionBlock } from '../molecules/VisionMissionBlock';

gsap.registerPlugin(ScrollTrigger);

type AboutVisionMissionSectionProps = {
  className?: string;
  data: AboutVisionMissionData;
  hasBorderBottom?: boolean;
};

export function AboutVisionMissionSection({
  className,
  data,
  hasBorderBottom = false
}: AboutVisionMissionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      // 1. Pixel Icon Badges pop in with elastic spring
      const icons = sectionRef.current.querySelectorAll('[data-vm-icon]');
      if (icons.length > 0) {
        gsap.fromTo(
          icons,
          { opacity: 0, scale: 0.5, y: 24 },
          {
            duration: 0.9,
            ease: 'back.out(1.8)',
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              start: 'top 88%',
              toggleActions: 'play none none reverse',
              trigger: sectionRef.current
            },
            stagger: 0.15,
            y: 0
          }
        );
      }

      // 2. Titles and descriptions reveal with upward mask transition
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
              start: 'top 88%',
              toggleActions: 'play none none reverse',
              trigger: sectionRef.current
            },
            stagger: 0.1,
            yPercent: 0
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
        <div
          className='
          border-b border-line
          lg:border-r lg:border-b-0
        '
        >
          <VisionMissionBlock
            description={data.vision.description}
            icon={data.vision.icon}
            title={data.vision.title}
          />
        </div>
        <div>
          <VisionMissionBlock
            description={data.mission.description}
            icon={data.mission.icon}
            title={data.mission.title}
          />
        </div>
      </div>
    </section>
  );
}
