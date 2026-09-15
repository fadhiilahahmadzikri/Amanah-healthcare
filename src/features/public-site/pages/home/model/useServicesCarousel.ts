'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

type UseServicesCarouselParams = {
  itemCount: number;
};

export function useServicesCarousel({ itemCount }: UseServicesCarouselParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      if (!viewportRef.current) {
        return;
      }

      const slides = viewportRef.current.querySelectorAll('[data-service-index]');
      gsap.fromTo(
        slides,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    },
    { scope: containerRef }
  );

  const scrollToService = useCallback(
    (index: number) => {
      if (itemCount === 0) {
        return;
      }

      const nextIndex = (index + itemCount) % itemCount;
      const viewport = viewportRef.current;
      const targetSlide = viewport?.querySelector<HTMLElement>(
        `[data-service-index="${nextIndex}"]`
      );

      setActiveIndex(nextIndex);

      if (!viewport || !targetSlide) {
        return;
      }

      viewport.scrollTo({
        behavior: 'smooth',
        left:
          targetSlide.offsetLeft -
          (viewport.dataset.initialOffset ? Number(viewport.dataset.initialOffset) : 0)
      });
    },
    [itemCount]
  );

  const scrollToPreviousService = useCallback(() => {
    scrollToService(activeIndex - 1);
  }, [activeIndex, scrollToService]);

  const scrollToNextService = useCallback(() => {
    scrollToService(activeIndex + 1);
  }, [activeIndex, scrollToService]);

  const syncActiveService = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('[data-service-index]'));

    const nearestSlide = slides.reduce<HTMLElement | null>((nearest, slide) => {
      if (!nearest) {
        return slide;
      }

      const currentDistance = Math.abs(slide.offsetLeft - viewport.scrollLeft);
      const nearestDistance = Math.abs(nearest.offsetLeft - viewport.scrollLeft);

      return currentDistance < nearestDistance ? slide : nearest;
    }, null);

    const nextIndex = Number(nearestSlide?.dataset.serviceIndex ?? 0);
    setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
  }, []);

  return {
    refs: {
      containerRef,
      viewportRef
    },
    state: {
      activeIndex
    },
    actions: {
      scrollToService,
      scrollToPreviousService,
      scrollToNextService,
      syncActiveService
    }
  };
}
