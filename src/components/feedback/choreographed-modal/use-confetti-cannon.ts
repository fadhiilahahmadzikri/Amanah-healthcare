'use client';

import { useEffect, type RefObject } from 'react';
import type { ModalVariantKey } from './types';

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  w: number;
  h: number;
  color: string;
  shape: 'rect' | 'ribbon' | 'circle' | 'star';
  opacity: number;
  fadeDelay: number;
  tick: number;
}

const DEFAULT_CONFETTI_PALETTES: Record<ModalVariantKey, string[]> = {
  success: ['#16a34a', '#22c55e', '#4ade80', '#fbbf24', '#38bdf8', '#a3e635'],
  info: ['#0284c7', '#38bdf8', '#7dd3fc', '#fbbf24', '#818cf8', '#60a5fa'],
  warning: ['#d97706', '#fbbf24', '#fde047', '#fb923c', '#f87171', '#f59e0b'],
  error: ['#e11d48', '#fb7185', '#fda4af', '#94a3b8', '#f43f5e', '#f87171'],
  reward: ['#7c3aed', '#a855f7', '#fbbf24', '#f472b6', '#38bdf8', '#c084fc']
};

export function useConfettiCannon(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  variantKey: ModalVariantKey = 'success',
  animationKey = 0,
  confettiCount = 65
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    canvas.width = parent?.clientWidth || 370;
    canvas.height = parent?.clientHeight || 520;

    const originX = canvas.width / 2;
    const originY = 136;
    const shapes: ('rect' | 'ribbon' | 'circle' | 'star')[] = ['rect', 'ribbon', 'circle', 'star'];
    const palette = DEFAULT_CONFETTI_PALETTES[variantKey] || DEFAULT_CONFETTI_PALETTES.success;

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < confettiCount; i++) {
      const angleDeg = -90 + (Math.random() - 0.5) * 145;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = 5.5 + Math.random() * 9.5;

      particles.push({
        x: originX + (Math.random() - 0.5) * 24,
        y: originY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angleRad) * speed + (Math.random() - 0.5) * 2.5,
        vy: Math.sin(angleRad) * speed - Math.random() * 2,
        gravity: 0.26 + Math.random() * 0.12,
        drag: 0.982,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.08 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        tiltAngle: Math.random() * Math.PI,
        tiltSpeed: 0.12 + Math.random() * 0.18,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
        fadeDelay: 45 + Math.random() * 35,
        tick: 0
      });
    }

    let animId: number | null = null;

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tick++;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.9;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;

        if (p.tick > p.fadeDelay) {
          p.opacity -= 0.018;
        }

        if (p.opacity > 0 && p.y < canvas.height + 30) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(1, Math.cos(p.tiltAngle));
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          } else if (p.shape === 'ribbon') {
            ctx.fillRect(-p.w * 0.8, -p.h * 0.35, p.w * 1.6, p.h * 0.7);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.42, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'star') {
            ctx.beginPath();
            const r = p.w * 0.55;
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (activeCount > 0) {
        animId = requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(renderFrame);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [canvasRef, variantKey, animationKey, confettiCount]);
}
