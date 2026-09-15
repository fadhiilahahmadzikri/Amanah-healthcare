'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type UseFacilityCardMotionParams = {
  index: number;
  isActive: boolean;
  isPaused: boolean;
  onProgressComplete: (index: number) => void;
  progressDuration: number;
};

export function useFacilityCardMotion({
  index,
  isActive,
  isPaused,
  onProgressComplete,
  progressDuration
}: UseFacilityCardMotionParams) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const cornerMeshRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTweenRef = useRef<gsap.core.Tween | null>(null);
  const isFirstRender = useRef(true);

  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        gsap.set(iconRef.current, isActive ? activeIconState : inactiveIconState);
        gsap.set(cornerMeshRef.current, { opacity: isActive ? 0 : 1 });
        gsap.set(bgRef.current, isActive ? activeBackgroundState : inactiveBackgroundState);
        return;
      }

      if (isActive) {
        gsap.to(iconRef.current, {
          ...activeIconState,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto'
        });
        gsap.to(cornerMeshRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto'
        });
        gsap.to(bgRef.current, {
          ...activeBackgroundState,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        return;
      }

      gsap.to(iconRef.current, {
        ...inactiveIconState,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(cornerMeshRef.current, {
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(bgRef.current, {
        ...inactiveBackgroundState,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto'
      });
    },
    { dependencies: [isActive], scope: cardRef }
  );

  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) {
      return;
    }

    if (!isActive) {
      progressTweenRef.current?.kill();
      progressTweenRef.current = null;
      gsap.to(bar, { scaleX: 0, duration: 0.2, ease: 'power2.out' });
      return;
    }

    if (!progressTweenRef.current) {
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left' });
      progressTweenRef.current = gsap.to(bar, {
        scaleX: 1,
        duration: progressDuration,
        ease: 'none',
        onComplete: () => {
          progressTweenRef.current = null;
          onProgressComplete(index);
        }
      });
    }

    if (isPaused) {
      progressTweenRef.current?.pause();
    } else {
      progressTweenRef.current?.resume();
    }
  }, [index, isActive, isPaused, onProgressComplete, progressDuration]);

  useEffect(() => {
    return () => {
      progressTweenRef.current?.kill();
    };
  }, []);

  return {
    cardRef,
    bgRef,
    iconRef,
    cornerMeshRef,
    progressBarRef
  };
}

const activeIconState = { y: -14, opacity: 0, scale: 0.75 };
const inactiveIconState = { y: 0, opacity: 1, scale: 1 };
const activeBackgroundState = { opacity: 1, scale: 1.05 };
const inactiveBackgroundState = { opacity: 0, scale: 1 };
