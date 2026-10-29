'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export interface UseAttentionEmojiLoopOptions {
  emojis?: string[];
  intervalMs?: number;
  enabled?: boolean;
}

const DEFAULT_ATTENTION_EMOJIS = ['👋', '🌅', '☀️', '🌤️', '🌙', '🩺', '🍉', '⭐', '🕒'];

/**
 * Agnostic GSAP-powered custom hook that cycles through emojis with an eye-catching
 * pop & bounce animation to draw user attention until an option is selected.
 */
export function useAttentionEmojiLoop({
  emojis = DEFAULT_ATTENTION_EMOJIS,
  intervalMs = 2600,
  enabled = true
}: UseAttentionEmojiLoopOptions = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const currentEmoji = emojis[currentIndex] ?? emojis[0] ?? '👋';

  // Play a one-shot playful bounce effect on click/interaction
  const triggerPlayfulBounce = useCallback(() => {
    if (!elementRef.current) return;
    gsap.killTweensOf(elementRef.current);
    gsap
      .timeline()
      .to(elementRef.current, {
        scale: 1.35,
        rotation: 12,
        duration: 0.15,
        ease: 'back.out(3)'
      })
      .to(elementRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.2,
        ease: 'elastic.out(1, 0.4)'
      });
  }, []);

  useEffect(() => {
    if (!enabled || emojis.length <= 1) {
      if (elementRef.current) {
        gsap.killTweensOf(elementRef.current);
        gsap.set(elementRef.current, { scale: 1, opacity: 1, rotation: 0 });
      }
      return;
    }

    const timer = setInterval(() => {
      if (!elementRef.current) return;

      timelineRef.current?.kill();
      timelineRef.current = gsap
        .timeline()
        .to(elementRef.current, {
          scale: 0.5,
          opacity: 0,
          rotation: -12,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            setCurrentIndex((prev) => (prev + 1) % emojis.length);
          }
        })
        .to(elementRef.current, {
          scale: 1.25,
          opacity: 1,
          rotation: 8,
          duration: 0.28,
          ease: 'back.out(2)'
        })
        .to(elementRef.current, {
          scale: 1,
          rotation: 0,
          duration: 0.18,
          ease: 'power1.out'
        });
    }, intervalMs);

    return () => {
      clearInterval(timer);
      timelineRef.current?.kill();
    };
  }, [enabled, emojis, intervalMs]);

  return {
    currentEmoji,
    elementRef,
    triggerPlayfulBounce
  };
}
