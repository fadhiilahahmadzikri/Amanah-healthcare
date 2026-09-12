'use client';

import confetti, { create as createConfetti } from 'canvas-confetti';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export type HeroConfettiRef = {
  fire: () => void;
};

type HeroConfettiProps = {
  className?: string;
};

export const HeroConfetti = forwardRef<HeroConfettiRef, HeroConfettiProps>(({ className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);
  const lastFiredRef = useRef<number>(0);

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

  const fire = () => {
    const now = Date.now();
    if (now - lastFiredRef.current < 1800) {
      return;
    }
    lastFiredRef.current = now;

    const myConfetti = confettiInstanceRef.current ?? confetti;
    const canvas = canvasRef.current;

    if (
      canvas &&
      (canvas.width === 0 || canvas.height === 0 || canvas.width !== canvas.offsetWidth)
    ) {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    // Amanah brand & celebratory colors (brand blue spectrum + festive gold + clean white)
    const colors = ['#3171de', '#5e98c2', '#38bdf8', '#4382e8', '#60a5fa', '#f59e0b', '#ffffff'];

    // Wave 1: Confetti explosion bursting right at the icon (index 2) + side cannon accents
    myConfetti({
      particleCount: 45,
      spread: 85,
      startVelocity: 38,
      gravity: 0.85,
      ticks: 320,
      origin: { x: 0.54, y: 0.44 },
      colors,
      scalar: 1.1
    });

    myConfetti({
      particleCount: 30,
      angle: 58,
      spread: 55,
      startVelocity: 40,
      gravity: 0.85,
      drift: 0.05,
      ticks: 320,
      origin: { x: 0.18, y: 0.62 },
      colors,
      scalar: 1.0
    });

    myConfetti({
      particleCount: 30,
      angle: 122,
      spread: 55,
      startVelocity: 40,
      gravity: 0.85,
      drift: -0.05,
      ticks: 320,
      origin: { x: 0.82, y: 0.62 },
      colors,
      scalar: 1.0
    });

    // Wave 2: Slower, wider floating flutter spray
    setTimeout(() => {
      const activeConfetti = confettiInstanceRef.current ?? confetti;

      activeConfetti({
        particleCount: 35,
        angle: 68,
        spread: 75,
        startVelocity: 35,
        gravity: 0.75,
        ticks: 400,
        origin: { x: 0.22, y: 0.58 },
        colors,
        scalar: 1.25
      });

      activeConfetti({
        particleCount: 35,
        angle: 112,
        spread: 75,
        startVelocity: 35,
        gravity: 0.75,
        ticks: 400,
        origin: { x: 0.78, y: 0.58 },
        colors,
        scalar: 1.25
      });
    }, 220);
  };

  useImperativeHandle(ref, () => ({
    fire
  }));

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      className={`
          pointer-events-none absolute inset-0 size-full
          ${className ?? ''}
        `}
    />
  );
});
