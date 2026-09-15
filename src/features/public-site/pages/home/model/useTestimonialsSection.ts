'use client';

import { useRef } from 'react';
import { useTestimonialsConfetti } from './useTestimonialsConfetti';
import { useTestimonialsSectionMotion } from './useTestimonialsSectionMotion';

export function useTestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const confetti = useTestimonialsConfetti({ sectionRef });

  useTestimonialsSectionMotion({
    carouselContainerRef,
    headerRef,
    sectionRef,
    triggerConfetti: confetti.triggerConfetti
  });

  return {
    refs: {
      sectionRef,
      headerRef,
      carouselContainerRef,
      ...confetti.refs
    }
  };
}
