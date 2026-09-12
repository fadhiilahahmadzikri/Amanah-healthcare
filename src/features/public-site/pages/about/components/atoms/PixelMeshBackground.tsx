'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

export type PixelMeshBackgroundHandle = {
  getProgress: () => number;
  setProgress: (progress: number) => void;
};

export type PixelMeshBackgroundProps = {
  className?: string;
  initialProgress?: number;
  maskGradient?: string;
  progress?: number;
};

// Deterministic pseudo-random number generator for consistent SSR and frame rendering
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Pure Amanah blue palette: strictly blues, zero green, zero cyan, zero dark navy
const PALETTE = [
  '#3171de', // amanah-blue (#3171de) - primary brand
  '#5e98c2', // amanah-sky (#5e98c2) - secondary brand
  '#4382e8', // vibrant mid-blue
  '#76a5dc', // soft sky-blue
  '#265ec7', // royal blue
  '#94bce4' // gentle light-blue
];

const TILE_SIZE = 12;
const TILE_GAP = 3;
const STEP = TILE_SIZE + TILE_GAP; // 15px
const CORNER_RADIUS = 2.5;

export const PixelMeshBackground = forwardRef<PixelMeshBackgroundHandle, PixelMeshBackgroundProps>(
  function PixelMeshBackground(
    {
      className,
      initialProgress = 0,
      maskGradient = 'linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.82) 8%, rgba(0, 0, 0, 0.55) 18%, rgba(0, 0, 0, 0.32) 28%, rgba(0, 0, 0, 0.15) 38%, rgba(0, 0, 0, 0.05) 48%, rgba(0, 0, 0, 0.01) 54%, transparent 58%)',
      progress: controlledProgress
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Mutable animation state
    const stateRef = useRef({
      currentProgress: initialProgress,
      targetProgress: initialProgress
    });

    // Imperative API for GSAP ScrollTrigger timeline scrubbing
    useImperativeHandle(
      ref,
      () => ({
        getProgress: () => stateRef.current.targetProgress,
        setProgress: (p: number) => {
          const clamped = Math.max(0, Math.min(1, p));
          stateRef.current.targetProgress = clamped;
        }
      }),
      []
    );

    // Sync controlled progress prop if provided
    useEffect(() => {
      if (typeof controlledProgress === 'number') {
        const clamped = Math.max(0, Math.min(1, controlledProgress));
        stateRef.current.targetProgress = clamped;
      }
    }, [controlledProgress]);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) {
        return;
      }

      let animationFrameId: number;

      const updateDimensions = () => {
        if (!container || !canvas) {
          return;
        }
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) {
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetCanvasWidth = Math.floor(width * dpr);
        const targetCanvasHeight = Math.floor(height * dpr);

        if (canvas.width !== targetCanvasWidth || canvas.height !== targetCanvasHeight) {
          canvas.width = targetCanvasWidth;
          canvas.height = targetCanvasHeight;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(container);

      const render = () => {
        const state = stateRef.current;

        // Smooth fast-response lerp for fluid crawling charging feel
        state.currentProgress += (state.targetProgress - state.currentProgress) * 0.35;
        if (Math.abs(state.targetProgress - state.currentProgress) < 0.0008) {
          state.currentProgress = state.targetProgress;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Check for size changes dynamically (e.g. during GSAP width expansion)
        if (
          canvas.width !== Math.floor(width * dpr) ||
          canvas.height !== Math.floor(height * dpr)
        ) {
          updateDimensions();
        }

        const ctx = canvas.getContext('2d');
        if (ctx && width > 0 && height > 0) {
          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, width, height);

          const currentProg = state.currentProgress;

          // If progress is zero, nothing mounts (clean baseline before scroll)
          if (currentProg > 0.001) {
            const time = performance.now() * 0.001;
            const cols = Math.ceil(width / STEP);
            const rows = Math.ceil(height / STEP);
            const maxRowDenom = Math.max(1, rows - 1);

            for (let row = 0; row < rows; row++) {
              // normY: 0 at the bottom-most row, 1 at top-most row
              const normY = (rows - 1 - row) / maxRowDenom;
              const rowY = row * STEP;

              for (let col = 0; col < cols; col++) {
                // 1. Organic cluster spots ("bercak-bercak pixel") + serpentine creeping tendrils
                const spot1 = Math.sin(col * 0.22 + 0.8) * Math.cos(row * 0.18 + 0.4) * 0.1;
                const spot2 = Math.sin(col * 0.52 + row * 0.35) * 0.06;
                const tendril = Math.sin(col * 0.38) * 0.06;

                // 2. Local pixel-by-pixel serialization jitter (makes pixels within spots mount 1 by 1)
                const pixelJitter = (pseudoRandom(col * 197 + row * 113) - 0.5) * 0.14;

                // 3. Activation threshold: pixels at bottom pass first, forming organic spots that spread & climb
                const threshold = Math.max(
                  0.01,
                  Math.min(0.96, normY * 0.74 + spot1 + spot2 + tendril + pixelJitter)
                );

                const progressDiff = currentProg - threshold;
                if (progressDiff < 0) {
                  // Unmounted: parasite has not reached this pixel yet
                  continue;
                }

                const colX = col * STEP;

                // Pulse rhythm parameters
                const speed = 1.6 + pseudoRandom(col * 47 + row * 31) * 1.8;
                const phase = pseudoRandom(col * 29 + row * 71) * Math.PI * 2;
                const peakOp = 0.48 + pseudoRandom(col * 13 + row * 89) * 0.44;
                const palIndex = Math.floor(pseudoRandom(col * 67 + row * 23) * PALETTE.length);
                const baseColor = PALETTE[palIndex]!;

                let opacity = 0;
                let fillColor = baseColor;
                let currentSize = TILE_SIZE;
                let offset = 0;

                if (progressDiff < 0.055) {
                  // CHARGING SURGE / SERIALIZED BIRTH:
                  // Pixel is actively charging/mounting into existence
                  const chargeRatio = progressDiff / 0.055; // 0 -> 1

                  // Elastic scale pop: 0.35 -> 1.18 -> 1.0
                  const scale =
                    chargeRatio < 0.5
                      ? 0.35 + (chargeRatio / 0.5) * 0.83
                      : 1.18 - ((chargeRatio - 0.5) / 0.5) * 0.18;

                  currentSize = TILE_SIZE * scale;
                  offset = (TILE_SIZE - currentSize) / 2;

                  // Bright electric blue charging spark during early birth
                  if (chargeRatio < 0.38) {
                    fillColor = '#c7e2fe';
                    opacity = 0.96;
                  } else {
                    fillColor = baseColor;
                    opacity = 0.72 + (1 - chargeRatio) * 0.24;
                  }
                } else {
                  // SETTLED BREATHING PULSE:
                  // Gentle pulse cycle going all the way down to 0 opacity
                  const pulseCycle = Math.sin(time * speed + phase);
                  opacity = Math.max(0, peakOp * pulseCycle);
                }

                if (opacity <= 0.015) {
                  continue;
                }

                ctx.globalAlpha = opacity;
                ctx.fillStyle = fillColor;

                const drawX = colX + offset;
                const drawY = rowY + offset;

                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                  ctx.roundRect(drawX, drawY, currentSize, currentSize, CORNER_RADIUS);
                } else {
                  ctx.rect(drawX, drawY, currentSize, currentSize);
                }
                ctx.fill();
              }
            }
          }

          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div
        ref={containerRef}
        aria-hidden='true'
        className={cn(
          `
          pointer-events-none absolute inset-0 size-full overflow-hidden
          select-none
        `,
          className
        )}
        style={{
          WebkitMaskImage: maskGradient,
          maskImage: maskGradient
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 block size-full'
        />
      </div>
    );
  }
);
