'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useAppointmentSectionMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mobileTextureRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const sectionElement = sectionRef.current;

      if (!sectionElement) {
        return;
      }

      if (watermarkRef.current) {
        gsap.to(watermarkRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      if (mobileTextureRef.current) {
        gsap.fromTo(
          mobileTextureRef.current,
          { autoAlpha: 0, scale: 0.92, y: -10 },
          {
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            scale: 1,
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            },
            y: 0
          }
        );
      }

      if (textRef.current) {
        const maskLines = textRef.current.querySelectorAll<HTMLElement>('[data-mask-text]');
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
              trigger: sectionElement,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return {
    sectionRef,
    textRef,
    imageRef,
    mobileTextureRef,
    watermarkRef
  };
}
