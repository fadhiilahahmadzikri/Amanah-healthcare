'use client';

import type { AboutSlide } from '../../types';
import { useCallback, useRef } from 'react';
import {
  CarouselCard,
  CarouselToolbar,
  INITIAL_SLIDE_INDEX,
  useDeckCarousel
} from './about-carousel';

type AboutCarouselProps = {
  slides: AboutSlide[];
};

export function AboutCarousel({ slides }: AboutCarouselProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  const getCardElements = useCallback(() => {
    return cardsRef.current.filter(Boolean) as HTMLElement[];
  }, []);

  const carousel = useDeckCarousel({
    getCardElements,
    scopeRef: stageRef,
    totalSlides: slides.length
  });

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className='
        relative mt-8 overflow-visible pb-5
        md:mt-20 md:pb-8
      '
    >
      <div
        className='
          relative mx-auto max-w-344 overflow-visible px-4
          md:px-10
        '
      >
        <div
          className='
            relative mx-auto w-full max-w-[1022px] py-2
            sm:py-8
          '
        >
          {/* 3D Perspective Card Deck Stage */}
          <div
            ref={stageRef}
            className='
              relative flex h-[430px] w-full touch-pan-y items-center
              justify-center overflow-visible select-none perspective-distant
              perspective-origin-[50%_50%]
              sm:h-[470px]
              md:h-[537px]
            '
            onPointerCancel={carousel.handlePointerCancel}
            onPointerDown={carousel.handlePointerDown}
            onPointerEnter={carousel.handlePointerEnter}
            onPointerLeave={carousel.handlePointerLeave}
            onPointerUp={carousel.handlePointerUp}
          >
            {slides.map((slide, index) => (
              <CarouselCard
                key={slide.title}
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
                index={index}
                isPriority={index === INITIAL_SLIDE_INDEX}
                slide={slide}
                totalSlides={slides.length}
                onClick={() => carousel.handleCardClick(index)}
              />
            ))}
          </div>

          {/* Controls / Toolbar (Responsive: on mobile placed below cards with indicators on left, navigation on right) */}
          <CarouselToolbar
            currentIndex={carousel.currentIndex}
            totalSlides={slides.length}
            onNext={carousel.nextSlide}
            onPrevious={carousel.prevSlide}
            onSelectSlide={carousel.goToSlide}
          />
        </div>
      </div>
    </div>
  );
}
