'use client';

import confetti, { create as createConfetti } from 'canvas-confetti';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

const CONFETTI_COOLDOWN_MS = 1800;
const CONFETTI_COLORS = [
  '#3171de',
  '#5e98c2',
  '#34d399',
  '#f59e0b',
  '#ec4899',
  '#38bdf8',
  '#ffffff'
];

type UseTestimonialsConfettiParams = {
  sectionRef: RefObject<HTMLElement | null>;
};

export function useTestimonialsConfetti({ sectionRef }: UseTestimonialsConfettiParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cannonLeftRef = useRef<HTMLSpanElement | null>(null);
  const cannonRightRef = useRef<HTMLSpanElement | null>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);
  const lastFiredRef = useRef(0);

  useEffect(() => {
    if (canvasRef.current) {
      confettiInstanceRef.current = createConfetti(canvasRef.current, {
        resize: true,
        useWorker: false
      });
    }

    return () => {
      confettiInstanceRef.current?.reset();
      confettiInstanceRef.current = null;
    };
  }, []);

  const shootConfetti = useCallback(() => {
    const myConfetti = confettiInstanceRef.current;
    const section = sectionRef.current;
    const leftAnchor = cannonLeftRef.current;
    const rightAnchor = cannonRightRef.current;

    if (!myConfetti || !section || !leftAnchor || !rightAnchor) {
      return;
    }

    const sectionRect = section.getBoundingClientRect();
    const leftRect = leftAnchor.getBoundingClientRect();
    const rightRect = rightAnchor.getBoundingClientRect();

    if (sectionRect.width === 0 || sectionRect.height === 0) {
      return;
    }

    const leftX = clamp(
      (leftRect.left + leftRect.width / 2 - sectionRect.left) / sectionRect.width,
      0.04,
      0.4
    );
    const leftY = clamp(
      (leftRect.top + leftRect.height / 2 - sectionRect.top) / sectionRect.height,
      0.05,
      0.45
    );
    const rightX = clamp(
      (rightRect.right - rightRect.width / 2 - sectionRect.left) / sectionRect.width,
      0.6,
      0.96
    );
    const rightY = clamp(
      (rightRect.top + rightRect.height / 2 - sectionRect.top) / sectionRect.height,
      0.05,
      0.45
    );

    myConfetti(createConfettiBurst(50, 55, leftX, leftY, 44, 0.85, 0.05, 1.05));
    myConfetti(createConfettiBurst(50, 125, rightX, rightY, 44, 0.85, -0.05, 1.05));

    setTimeout(() => {
      if (!confettiInstanceRef.current) {
        return;
      }

      myConfetti(createConfettiBurst(35, 65, leftX, leftY, 36, 0.75, undefined, 1.25));
      myConfetti(createConfettiBurst(35, 115, rightX, rightY, 36, 0.75, undefined, 1.25));
    }, 220);
  }, [sectionRef]);

  const triggerConfetti = useCallback(() => {
    const now = Date.now();
    if (now - lastFiredRef.current < CONFETTI_COOLDOWN_MS) {
      return;
    }
    lastFiredRef.current = now;
    shootConfetti();
  }, [shootConfetti]);

  return {
    refs: {
      canvasRef,
      cannonLeftRef,
      cannonRightRef
    },
    triggerConfetti
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createConfettiBurst(
  particleCount: number,
  angle: number,
  x: number,
  y: number,
  startVelocity: number,
  gravity: number,
  drift: number | undefined,
  scalar: number
): confetti.Options {
  return {
    particleCount,
    angle,
    spread: particleCount > 40 ? 65 : 75,
    startVelocity,
    gravity,
    drift,
    ticks: particleCount > 40 ? 360 : 420,
    origin: { x, y },
    colors: CONFETTI_COLORS,
    scalar
  };
}
