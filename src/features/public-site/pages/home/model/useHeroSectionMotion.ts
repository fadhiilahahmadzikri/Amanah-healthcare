'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useHeroSectionMotion() {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } });
      const motion = gsap.matchMedia();
      const containerElement = containerRef.current;
      const imageElement = imageRef.current;
      const mobileMetricsRail = containerElement?.querySelector('[data-hero-mobile-metrics-rail]');

      if (imageElement) {
        motion.add(
          {
            isDesktop: '(min-width: 1024px)',
            isMobile: '(max-width: 1023px)',
            reduceMotion: '(prefers-reduced-motion: reduce)'
          },
          (context) => {
            const { isDesktop, isMobile, reduceMotion } = context.conditions ?? {};

            if (reduceMotion) {
              const visibleTargets = mobileMetricsRail
                ? [imageElement, mobileMetricsRail]
                : [imageElement];

              gsap.set(visibleTargets, {
                autoAlpha: 1,
                clearProps: 'transform,visibility'
              });
              return;
            }

            if (isDesktop) {
              tl.fromTo(
                imageElement,
                { scale: 1.1, opacity: 0.3 },
                { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' },
                0
              );

              gsap.to(imageElement, {
                yPercent: 22,
                ease: 'none',
                scrollTrigger: {
                  trigger: containerElement,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true
                }
              });
            }

            if (isMobile) {
              tl.fromTo(
                imageElement,
                { autoAlpha: 0, scale: 0.96, y: 28 },
                {
                  autoAlpha: 1,
                  duration: 1,
                  ease: 'power3.out',
                  scale: 1,
                  y: 0
                },
                0.85
              );

              if (mobileMetricsRail) {
                tl.fromTo(
                  mobileMetricsRail,
                  { autoAlpha: 0, y: 16 },
                  {
                    autoAlpha: 1,
                    duration: 0.75,
                    ease: 'power3.out',
                    y: 0
                  },
                  1.05
                );
              }
            }
          }
        );
      }

      if (contentRef.current) {
        const eyebrow = contentRef.current.querySelector('[data-hero-eyebrow]');
        const maskLines = contentRef.current.querySelectorAll('[data-mask-line]');
        const cta = contentRef.current.querySelector('[data-hero-cta]');
        const pills = contentRef.current.querySelectorAll('[data-hero-pill]');

        if (eyebrow) {
          tl.fromTo(
            eyebrow,
            { y: 30, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' },
            0.1
          );
        }

        if (maskLines.length > 0) {
          tl.fromTo(
            maskLines,
            { yPercent: 120, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12, ease: 'expo.out' },
            0.2
          );
        }

        if (cta) {
          tl.fromTo(
            cta,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' },
            0.55
          );
        }

        if (pills.length > 0) {
          tl.fromTo(
            pills,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
            0.7
          );
        }
      }

      return () => {
        motion.revert();
      };
    },
    { scope: containerRef }
  );

  return {
    containerRef,
    imageRef,
    contentRef
  };
}
