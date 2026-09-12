'use client';

import { useGSAP } from '@gsap/react';
import confetti, { create as createConfetti } from 'canvas-confetti';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useRef } from 'react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { CardFanCarousel } from '@/features/public-site/components/ui/card-fan-carousel';
import { documentationMoments } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cannonLeftRef = useRef<HTMLSpanElement | null>(null);
  const cannonRightRef = useRef<HTMLSpanElement | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);
  const lastFiredRef = useRef<number>(0);

  // Initialize scoped canvas confetti instance
  useEffect(() => {
    if (canvasRef.current) {
      confettiInstanceRef.current = createConfetti(canvasRef.current, {
        resize: true,
        useWorker: false
      });
    }

    return () => {
      if (confettiInstanceRef.current) {
        confettiInstanceRef.current.reset();
        confettiInstanceRef.current = null;
      }
    };
  }, []);

  // Dual cannon confetti burst with realistic gravity drifting down to carousel cards
  const shootConfetti = useCallback(() => {
    const myConfetti = confettiInstanceRef.current;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const leftAnchor = cannonLeftRef.current;
    const rightAnchor = cannonRightRef.current;

    if (!myConfetti || !canvas || !section || !leftAnchor || !rightAnchor) {
      return;
    }

    const sectionRect = section.getBoundingClientRect();
    const leftRect = leftAnchor.getBoundingClientRect();
    const rightRect = rightAnchor.getBoundingClientRect();

    if (sectionRect.width === 0 || sectionRect.height === 0) {
      return;
    }

    // Normalized coordinates inside the scoped canvas
    const leftX = Math.max(
      0.04,
      Math.min(0.4, (leftRect.left + leftRect.width / 2 - sectionRect.left) / sectionRect.width)
    );
    const leftY = Math.max(
      0.05,
      Math.min(0.45, (leftRect.top + leftRect.height / 2 - sectionRect.top) / sectionRect.height)
    );

    const rightX = Math.max(
      0.6,
      Math.min(0.96, (rightRect.right - rightRect.width / 2 - sectionRect.left) / sectionRect.width)
    );
    const rightY = Math.max(
      0.05,
      Math.min(0.45, (rightRect.top + rightRect.height / 2 - sectionRect.top) / sectionRect.height)
    );

    // Amanah brand & celebratory color scheme
    const colors = ['#3171de', '#5e98c2', '#34d399', '#f59e0b', '#ec4899', '#38bdf8', '#ffffff'];

    // Wave 1: Energetic upward launch fanning inward across the header
    myConfetti({
      particleCount: 50,
      angle: 55,
      spread: 65,
      startVelocity: 44,
      gravity: 0.85,
      drift: 0.05,
      ticks: 360,
      origin: { x: leftX, y: leftY },
      colors,
      scalar: 1.05
    });

    myConfetti({
      particleCount: 50,
      angle: 125,
      spread: 65,
      startVelocity: 44,
      gravity: 0.85,
      drift: -0.05,
      ticks: 360,
      origin: { x: rightX, y: rightY },
      colors,
      scalar: 1.05
    });

    // Wave 2: Slower, wider flutter spray floating down across the surface of the carousel cards
    setTimeout(() => {
      if (!confettiInstanceRef.current) {
        return;
      }

      myConfetti({
        particleCount: 35,
        angle: 65,
        spread: 75,
        startVelocity: 36,
        gravity: 0.75,
        ticks: 420,
        origin: { x: leftX, y: leftY },
        colors,
        scalar: 1.25
      });

      myConfetti({
        particleCount: 35,
        angle: 115,
        spread: 75,
        startVelocity: 36,
        gravity: 0.75,
        ticks: 420,
        origin: { x: rightX, y: rightY },
        colors,
        scalar: 1.25
      });
    }, 220);
  }, []);

  const triggerConfetti = useCallback(() => {
    const now = Date.now();
    if (now - lastFiredRef.current < 1800) {
      return;
    }
    lastFiredRef.current = now;
    shootConfetti();
  }, [shootConfetti]);

  useGSAP(
    () => {
      if (!headerRef.current) {
        return;
      }

      const maskLines = headerRef.current.querySelectorAll('[data-mask-text]');

      // Header text entrance reveal
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

      // Carousel cards entrance AOS
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

      // Scroll trigger for natural physics confetti burst
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        onEnter: () => {
          triggerConfetti();
        },
        onEnterBack: () => {
          triggerConfetti();
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id='dokumentasi'
      className='
        relative w-full overflow-hidden bg-background py-10
        sm:py-12
        md:py-16
      '
    >
      {/* Scoped confetti canvas covering section to let particles fall onto carousel cards */}
      <canvas
        ref={canvasRef}
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-30 size-full'
      />

      <SectionContainer
        className='
          relative flex flex-col items-center px-4
          sm:px-6
        '
      >
        <div className='relative flex w-full max-w-6xl items-center justify-center'>
          {/* Confetti launch anchors positioned at sides of header */}
          <span
            ref={cannonLeftRef}
            className='
              pointer-events-none absolute top-1/2 left-0 size-1 -translate-y-1/2
              opacity-0
              sm:left-2
              md:left-4
            '
            aria-hidden
          />

          <SectionHeader
            ref={headerRef}
            className='
              mb-6 w-full px-2
              md:mb-8
            '
            eyebrow='Momen Bersama'
            headingSize='display'
            headingClassName='max-w-5xl'
            title='Bersama Keluarga, Setiap Langkah'
            description='Dokumentasi momen keluarga yang kami dampingi dalam berbagai perjalanan kesehatan.'
            descriptionSize='lead'
          />

          <span
            ref={cannonRightRef}
            className='
              pointer-events-none absolute top-1/2 right-0 size-1 -translate-y-1/2
              opacity-0
              sm:right-2
              md:right-4
            '
            aria-hidden
          />
        </div>
      </SectionContainer>

      <div
        ref={carouselContainerRef}
        className='relative w-full overflow-x-clip overflow-y-visible'
      >
        <CardFanCarousel cards={documentationMoments} autoPlay={true} autoPlayInterval={2800} />
      </div>
    </section>
  );
}
