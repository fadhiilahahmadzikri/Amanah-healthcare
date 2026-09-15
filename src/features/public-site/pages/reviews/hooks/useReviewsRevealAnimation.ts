'use client';

import type { RefObject } from 'react';
import type { PixelMeshBackgroundHandle } from '@/features/public-site/components/shared';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type UseReviewsRevealAnimationOptions<TElement extends HTMLElement = HTMLElement> = {
  pixelMeshRef?: RefObject<PixelMeshBackgroundHandle | null>;
  rootRef: RefObject<TElement | null>;
};

export function useReviewsRevealAnimation<TElement extends HTMLElement>(
  target: RefObject<TElement | null> | UseReviewsRevealAnimationOptions<TElement>,
  legacyPixelMeshRef?: RefObject<PixelMeshBackgroundHandle | null>
) {
  const rootRef = 'current' in target ? target : target.rootRef;
  const pixelMeshRef =
    'current' in target ? legacyPixelMeshRef : (target.pixelMeshRef ?? legacyPixelMeshRef);

  useGSAP(
    () => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      // 1. Hero entrance timeline
      const entranceTl = gsap.timeline({
        delay: 0.1,
        defaults: { ease: 'expo.out' }
      });

      if (pixelMeshRef?.current) {
        const crawlState = { progress: 0 };
        entranceTl.to(
          crawlState,
          {
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              pixelMeshRef.current?.setProgress(crawlState.progress);
            },
            progress: 1
          },
          0
        );
      }

      const maskLines = Array.from(root.querySelectorAll<HTMLElement>('[data-mask-text]'));
      const fallbackReveals =
        maskLines.length > 0
          ? []
          : Array.from(root.querySelectorAll<HTMLElement>('[data-reviews-reveal]'));
      const headerTargets = maskLines.length > 0 ? maskLines : fallbackReveals;

      if (headerTargets.length > 0) {
        entranceTl.fromTo(
          headerTargets,
          { opacity: 0, yPercent: 120 },
          {
            duration: 1.2,
            opacity: 1,
            stagger: 0.12,
            yPercent: 0
          },
          0.1
        );
      }

      entranceTl.call(() => {
        ScrollTrigger.refresh();
      });

      // 2. Parallax background scrub
      const pixelContainer = root.querySelector<HTMLElement>('[data-pixel-background]');
      if (pixelContainer) {
        gsap.to(pixelContainer, {
          ease: 'none',
          scrollTrigger: {
            end: 'bottom top',
            scrub: true,
            start: 'top top',
            trigger: root
          },
          yPercent: 20
        });
      }

      // 3. Review cards on scroll
      const cardsGrid = root.querySelector<HTMLElement>('[data-reviews-grid]');
      const reviewCards = Array.from(root.querySelectorAll<HTMLElement>('[data-review-card]'));

      if (reviewCards.length > 0) {
        gsap.fromTo(
          reviewCards,
          { opacity: 0, y: 50 },
          {
            duration: 1,
            ease: 'expo.out',
            opacity: 1,
            scrollTrigger: {
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              trigger: cardsGrid ?? root
            },
            stagger: 0.08,
            y: 0
          }
        );
      }

      // 4. Optional summary block
      const summaryBlocks = Array.from(root.querySelectorAll<HTMLElement>('[data-review-summary]'));
      if (summaryBlocks.length > 0) {
        gsap.fromTo(
          summaryBlocks,
          { opacity: 0, scale: 0.98, y: 36 },
          {
            duration: 1.1,
            ease: 'expo.out',
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              trigger: summaryBlocks[0] ?? root
            },
            y: 0
          }
        );
      }
    },
    { scope: rootRef }
  );
}
