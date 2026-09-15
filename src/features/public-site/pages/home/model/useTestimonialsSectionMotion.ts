'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

type UseTestimonialsSectionMotionParams = {
  carouselContainerRef: RefObject<HTMLDivElement | null>;
  headerRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
  triggerConfetti: () => void;
};

export function useTestimonialsSectionMotion({
  carouselContainerRef,
  headerRef,
  sectionRef,
  triggerConfetti
}: UseTestimonialsSectionMotionParams) {
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

      if (carouselContainerRef.current) {
        gsap.fromTo(
          carouselContainerRef.current,
          { y: 50, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: carouselContainerRef.current,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        onEnter: triggerConfetti,
        onEnterBack: triggerConfetti
      });
    },
    { scope: sectionRef }
  );
}
