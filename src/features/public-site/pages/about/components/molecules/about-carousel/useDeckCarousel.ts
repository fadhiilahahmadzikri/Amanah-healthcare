import type { PointerEvent, RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDeckSlot,
  getInitialIndex,
  getOffset,
  getWrappedIndex,
  MOUSE_SWIPE_THRESHOLD_PX,
  TOUCH_SWIPE_THRESHOLD_PX
} from './carouselGeometry';

type UseDeckCarouselOptions = {
  getCardElements: () => HTMLElement[];
  scopeRef: RefObject<HTMLElement | null>;
  totalSlides: number;
};

const AUTOPLAY_DELAY_MS = 2800;

gsap.registerPlugin(useGSAP);

export function useDeckCarousel({
  getCardElements,
  scopeRef,
  totalSlides
}: UseDeckCarouselOptions) {
  const initialIndex = getInitialIndex(totalSlides);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const activeIndexRef = useRef(initialIndex);
  const isAnimatingRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  const animateCardContent = useCallback(
    (index: number) => {
      const cards = getCardElements();
      const activeCard = cards[index];

      if (!activeCard) {
        return;
      }

      const tag = activeCard.querySelector('.card-tag, [data-card-tag]');
      const title = activeCard.querySelector('.card-title, [data-card-title]');
      const desc = activeCard.querySelector('.card-desc, [data-card-desc]');

      if (tag && title && desc) {
        gsap.fromTo(
          [tag, title, desc],
          {
            filter: 'blur(16px)',
            opacity: 0,
            scale: 0.98,
            y: -35
          },
          {
            delay: 0.15,
            duration: 0.6,
            ease: 'power3.out',
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            y: 0
          }
        );
      }
    },
    [getCardElements]
  );

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (totalSlides === 0 || isAnimatingRef.current) {
        return;
      }

      const normalizedIndex = getWrappedIndex(targetIndex, totalSlides);

      if (normalizedIndex === activeIndexRef.current) {
        return;
      }

      isAnimatingRef.current = true;

      const prevIndex = activeIndexRef.current;
      activeIndexRef.current = normalizedIndex;
      setCurrentIndex(normalizedIndex);

      const cards = getCardElements();
      const oldActiveCard = cards[prevIndex];

      cards.forEach((card) => {
        gsap.killTweensOf(card);
      });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      });

      if (oldActiveCard) {
        tl.to(oldActiveCard, {
          duration: 0.2,
          ease: 'power2.in',
          filter: 'blur(2.5px) brightness(0.6)',
          scale: 0.8,
          z: -140
        });
      }

      cards.forEach((card, idx) => {
        const targetSlot = getDeckSlot(idx, normalizedIndex, totalSlides);

        tl.to(
          card,
          {
            duration: 0.5,
            ease: 'power3.out',
            filter: targetSlot.filter,
            onStart: () => {
              if (idx === normalizedIndex) {
                card.style.zIndex = '30';
              } else if (idx === prevIndex) {
                card.style.zIndex = '20';
              } else {
                card.style.zIndex = String(targetSlot.zIndex);
              }
              card.style.pointerEvents = targetSlot.pointerEvents;
            },
            opacity: targetSlot.opacity,
            scale: targetSlot.scale,
            xPercent: targetSlot.xPercent,
            z: targetSlot.z
          },
          '<+=0.03'
        );
      });

      animateCardContent(normalizedIndex);
    },
    [animateCardContent, getCardElements, totalSlides]
  );

  const prevSlide = useCallback(() => {
    goToSlide(activeIndexRef.current - 1);
  }, [goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide(activeIndexRef.current + 1);
  }, [goToSlide]);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayTimerRef.current = setInterval(() => {
      if (!isInteractingRef.current && !isAnimatingRef.current) {
        nextSlide();
      }
    }, AUTOPLAY_DELAY_MS);
  }, [nextSlide, stopAutoplay]);

  const { contextSafe } = useGSAP(
    () => {
      const cards = getCardElements();

      cards.forEach((card, index) => {
        const isCenter = index === activeIndexRef.current;

        gsap.set(card, {
          filter: isCenter ? 'blur(0px) brightness(1)' : 'blur(4px) brightness(0.4)',
          opacity: isCenter ? 1 : 0.6,
          scale: isCenter ? 1 : 0.9,
          xPercent: 0,
          z: isCenter ? 0 : -80,
          zIndex: isCenter ? 30 : 10
        });
      });

      const introTimeline = gsap.timeline({
        onComplete: () => {
          animateCardContent(activeIndexRef.current);
          startAutoplay();
        }
      });

      cards.forEach((card, index) => {
        const slot = getDeckSlot(index, activeIndexRef.current, totalSlides);

        introTimeline.to(
          card,
          {
            duration: 0.8,
            ease: 'power3.out',
            filter: slot.filter,
            opacity: slot.opacity,
            scale: slot.scale,
            xPercent: slot.xPercent,
            z: slot.z,
            onStart: () => {
              card.style.zIndex = String(slot.zIndex);
              card.style.pointerEvents = slot.pointerEvents;
            }
          },
          0.05
        );
      });
    },
    {
      dependencies: [totalSlides],
      scope: scopeRef
    }
  );

  const handleCardClick = useCallback(
    (index: number) => {
      if (isAnimatingRef.current) {
        return;
      }
      const diff = getOffset(index, activeIndexRef.current, totalSlides);
      if (diff === -1) {
        prevSlide();
      }
      if (diff === 1) {
        nextSlide();
      }
    },
    [nextSlide, prevSlide, totalSlides]
  );

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isInteractingRef.current = true;
    dragStartXRef.current = event.clientX;
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      isInteractingRef.current = false;

      if (dragStartXRef.current === null) {
        return;
      }

      const diffX = event.clientX - dragStartXRef.current;
      dragStartXRef.current = null;

      const threshold =
        event.pointerType === 'touch' ? TOUCH_SWIPE_THRESHOLD_PX : MOUSE_SWIPE_THRESHOLD_PX;

      if (diffX > threshold) {
        prevSlide();
        return;
      }

      if (diffX < -threshold) {
        nextSlide();
      }
    },
    [nextSlide, prevSlide]
  );

  const handlePointerCancel = useCallback(() => {
    isInteractingRef.current = false;
    dragStartXRef.current = null;
  }, []);

  const handlePointerEnter = useCallback(() => {
    isInteractingRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isInteractingRef.current = false;
    dragStartXRef.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        prevSlide();
      }

      if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopAutoplay();
    };
  }, [nextSlide, prevSlide, stopAutoplay]);

  const safeGoToSlide = contextSafe((targetIndex: number) => {
    goToSlide(targetIndex);
  });

  return {
    currentIndex,
    goToSlide: safeGoToSlide,
    handleCardClick,
    handlePointerCancel,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerUp,
    nextSlide,
    prevSlide
  };
}
