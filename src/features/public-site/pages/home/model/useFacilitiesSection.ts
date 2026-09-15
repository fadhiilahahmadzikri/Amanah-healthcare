'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

type UseFacilitiesSectionParams = {
  itemCount: number;
};

export function useFacilitiesSection({ itemCount }: UseFacilitiesSectionParams) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isUserHovering, setIsUserHovering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(media.matches);

    updateMobile();
    media.addEventListener('change', updateMobile);
    return () => media.removeEventListener('change', updateMobile);
  }, []);

  const handleProgressComplete = useCallback(
    (completedIndex: number) => {
      setActiveCardIndex((current) => {
        if (current === completedIndex) {
          return (current + 1) % itemCount;
        }
        return current;
      });
    },
    [itemCount]
  );

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
    [handleCardHover, isMobile]
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
            onLeave: () => setActiveCardIndex((current) => (current === index ? -1 : current)),
            onLeaveBack: () => setActiveCardIndex((current) => (current === index ? -1 : current))
          });
        });
      });

      mm.add('(min-width: 768px)', () => {
        setActiveCardIndex((current) => (current === -1 ? 0 : current));
      });
    },
    { scope: sectionRef }
  );

  return {
    refs: {
      sectionRef,
      headerRef,
      gridRef,
      watermarkRef
    },
    actions: {
      handleProgressComplete,
      handleCardHover,
      handleCardClick,
      handleGridLeave
    },
    getIsCardActive: (index: number) =>
      isMobile ? activeCardIndex === index : isInView && activeCardIndex === index,
    getIsCardPaused: () => (isMobile ? true : isUserHovering || !isInView)
  };
}
