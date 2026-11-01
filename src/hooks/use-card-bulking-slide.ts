'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export interface UseCardBulkingSlideOptions {
  selected?: boolean;
  isBulkingActive?: boolean;
}

/**
 * Central agnostic GSAP-powered hook that smoothly slides the selection checkbox
 * in from left to right when a card is hovered, or locks it visible when selected
 * or when global bulking mode is active.
 */
export function useCardBulkingSlide({
  selected = false,
  isBulkingActive = false
}: UseCardBulkingSlideOptions = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  const shouldShow = selected || isBulkingActive || isHovered;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (shouldShow) {
        gsap.set(el, {
          width: 18,
          marginRight: 10,
          x: 0,
          opacity: 1
        });
      } else {
        gsap.set(el, {
          width: 0,
          marginRight: 0,
          x: -14,
          opacity: 0
        });
      }
      return;
    }

    if (shouldShow) {
      gsap.to(el, {
        width: 18,
        marginRight: 10,
        x: 0,
        opacity: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else {
      gsap.to(el, {
        width: 0,
        marginRight: 0,
        x: -14,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        overwrite: 'auto'
      });
    }
  }, [shouldShow]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    wrapperRef,
    isHovered,
    isVisible: shouldShow,
    containerProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
}
