'use client';

import type React from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type AbstractPuzzleBackgroundProps = {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

// Preset grid pattern (6 rows x 10 columns) with curated color tints & kinetic behaviors
const puzzleTiles = [
  // Row 0
  {
    anim: 'slide-x',
    delay: '0s',
    dur: '9s',
    h: 1,
    id: 'tile-r0-c0',
    tone: 'sky-subtle',
    w: 2,
    x: 0,
    y: 0
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r0-c2',
    tone: 'navy-deep',
    w: 1,
    x: 2,
    y: 0
  },
  {
    anim: 'elevate',
    delay: '1.2s',
    dur: '7s',
    h: 1,
    id: 'tile-r0-c3',
    tone: 'blue-accent',
    w: 2,
    x: 3,
    y: 0
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r0-c5',
    tone: 'surface',
    w: 1,
    x: 5,
    y: 0
  },
  {
    anim: 'rotate',
    delay: '0.8s',
    dur: '11s',
    h: 1,
    id: 'tile-r0-c6',
    tone: 'sky-bold',
    w: 1,
    x: 6,
    y: 0
  },
  {
    anim: 'slide-y',
    delay: '2.1s',
    dur: '8s',
    h: 1,
    id: 'tile-r0-c7',
    tone: 'mint-accent',
    w: 1,
    x: 7,
    y: 0
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r0-c8',
    tone: 'blue-subtle',
    w: 2,
    x: 8,
    y: 0
  },

  // Row 1
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r1-c0',
    tone: 'surface',
    w: 1,
    x: 0,
    y: 1
  },
  {
    anim: 'rotate',
    delay: '2.5s',
    dur: '10s',
    h: 1,
    id: 'tile-r1-c1',
    tone: 'blue-accent',
    w: 1,
    x: 1,
    y: 1
  },
  {
    anim: 'slide-x',
    delay: '1.4s',
    dur: '8.5s',
    h: 1,
    id: 'tile-r1-c2',
    tone: 'navy-mid',
    w: 2,
    x: 2,
    y: 1
  },
  {
    anim: 'elevate',
    delay: '0.5s',
    dur: '6.5s',
    h: 1,
    id: 'tile-r1-c4',
    tone: 'sky-subtle',
    w: 1,
    x: 4,
    y: 1
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r1-c5',
    tone: 'navy-deep',
    w: 2,
    x: 5,
    y: 1
  },
  {
    anim: 'slide-y',
    delay: '3.2s',
    dur: '9.5s',
    h: 1,
    id: 'tile-r1-c7',
    tone: 'blue-bold',
    w: 1,
    x: 7,
    y: 1
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r1-c8',
    tone: 'surface',
    w: 2,
    x: 8,
    y: 1
  },

  // Row 2 (Center Level)
  {
    anim: 'elevate',
    delay: '1.8s',
    dur: '8s',
    h: 1,
    id: 'tile-r2-c0',
    tone: 'blue-subtle',
    w: 2,
    x: 0,
    y: 2
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r2-c2',
    tone: 'sky-bold',
    w: 1,
    x: 2,
    y: 2
  },
  {
    anim: 'slide-x',
    delay: '2.8s',
    dur: '9s',
    h: 1,
    id: 'tile-r2-c3',
    tone: 'surface',
    w: 2,
    x: 3,
    y: 2
  },
  {
    anim: 'rotate',
    delay: '1.6s',
    dur: '12s',
    h: 1,
    id: 'tile-r2-c5',
    tone: 'navy-deep',
    w: 1,
    x: 5,
    y: 2
  },
  {
    anim: 'slide-y',
    delay: '0.9s',
    dur: '7.5s',
    h: 1,
    id: 'tile-r2-c6',
    tone: 'blue-accent',
    w: 2,
    x: 6,
    y: 2
  },
  {
    anim: 'elevate',
    delay: '2.2s',
    dur: '8.5s',
    h: 1,
    id: 'tile-r2-c8',
    tone: 'sky-subtle',
    w: 2,
    x: 8,
    y: 2
  },

  // Row 3 (Lower Level)
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r3-c0',
    tone: 'navy-mid',
    w: 1,
    x: 0,
    y: 3
  },
  {
    anim: 'slide-x',
    delay: '0.6s',
    dur: '10s',
    h: 1,
    id: 'tile-r3-c1',
    tone: 'blue-bold',
    w: 2,
    x: 1,
    y: 3
  },
  {
    anim: 'rotate',
    delay: '3.4s',
    dur: '11s',
    h: 1,
    id: 'tile-r3-c3',
    tone: 'mint-accent',
    w: 1,
    x: 3,
    y: 3
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r3-c4',
    tone: 'surface',
    w: 2,
    x: 4,
    y: 3
  },
  {
    anim: 'elevate',
    delay: '1.1s',
    dur: '7s',
    h: 1,
    id: 'tile-r3-c6',
    tone: 'sky-bold',
    w: 1,
    x: 6,
    y: 3
  },
  {
    anim: 'slide-x',
    delay: '2.0s',
    dur: '8s',
    h: 1,
    id: 'tile-r3-c7',
    tone: 'navy-deep',
    w: 2,
    x: 7,
    y: 3
  },
  {
    anim: 'static',
    delay: '0s',
    dur: '0s',
    h: 1,
    id: 'tile-r3-c9',
    tone: 'blue-subtle',
    w: 1,
    x: 9,
    y: 3
  }
];

// Grid intersection dots for technical/editorial wireframe aesthetic
const cornerPins = [
  { col: 1, row: 1 },
  { col: 9, row: 1 },
  { col: 1, row: 3 },
  { col: 9, row: 3 }
];

export function AbstractPuzzleBackground({ className, ref }: AbstractPuzzleBackgroundProps) {
  return (
    <div
      ref={ref}
      aria-hidden='true'
      className={cn(
        `
          pointer-events-none absolute inset-0 size-full overflow-hidden
          select-none
        `,
        className
      )}
    >
      <style>
        {`
        @keyframes puzzleSlideH {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8%); }
        }
        @keyframes puzzleSlideV {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7%); }
        }
        @keyframes puzzleRotateStep {
          0%, 25% { transform: rotate(0deg); }
          50%, 75% { transform: rotate(90deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes puzzleElevateZ {
          0%, 100% { transform: scale(1) translateZ(0); filter: brightness(1); }
          50% { transform: scale(1.04) translateZ(12px); filter: brightness(1.18); box-shadow: 0 16px 32px rgba(49, 113, 222, 0.16); }
        }
      `}
      </style>

      {/* Grid container spanning full expanding shell */}
      <div
        className='
        relative grid size-full border-collapse grid-cols-10 grid-rows-4
        opacity-90
      '
      >
        {puzzleTiles.map((tile) => {
          let toneClasses = '';
          switch (tile.tone) {
            case 'blue-accent':
              toneClasses = 'bg-[#3171de]/25 dark:bg-[#3171de]/45 border-[#3171de]/40';
              break;
            case 'blue-bold':
              toneClasses = 'bg-[#192aa0]/30 dark:bg-[#3171de]/60 border-[#3171de]/50';
              break;
            case 'blue-subtle':
              toneClasses = 'bg-[#3171de]/12 dark:bg-[#182256]/60 border-line/40';
              break;
            case 'sky-bold':
              toneClasses = 'bg-[#5e98c2]/35 dark:bg-[#5e98c2]/50 border-[#5e98c2]/45';
              break;
            case 'sky-subtle':
              toneClasses = 'bg-[#5e98c2]/15 dark:bg-[#12183e]/80 border-line/40';
              break;
            case 'navy-deep':
              toneClasses = 'bg-[#13195c]/20 dark:bg-[#090d24]/90 border-line/50';
              break;
            case 'navy-mid':
              toneClasses = 'bg-[#13195c]/14 dark:bg-[#0f1538]/85 border-line/40';
              break;
            case 'mint-accent':
              toneClasses = 'bg-[#34d399]/20 dark:bg-[#34d399]/35 border-[#34d399]/40';
              break;
            case 'surface':
            default:
              toneClasses = 'bg-surface/60 dark:bg-[#0b102e]/75 border-line/30';
              break;
          }

          let animStyle: React.CSSProperties = {};
          if (tile.anim === 'slide-x') {
            animStyle = {
              animation: `puzzleSlideH ${tile.dur} cubic-bezier(0.4, 0, 0.2, 1) infinite ${tile.delay}`
            };
          } else if (tile.anim === 'slide-y') {
            animStyle = {
              animation: `puzzleSlideV ${tile.dur} cubic-bezier(0.4, 0, 0.2, 1) infinite ${tile.delay}`
            };
          } else if (tile.anim === 'rotate') {
            animStyle = {
              animation: `puzzleRotateStep ${tile.dur} cubic-bezier(0.65, 0, 0.35, 1) infinite ${tile.delay}`
            };
          } else if (tile.anim === 'elevate') {
            animStyle = {
              animation: `puzzleElevateZ ${tile.dur} ease-in-out infinite ${tile.delay}`
            };
          }

          return (
            <div
              key={tile.id}
              style={{
                gridColumn: `${tile.x + 1} / span ${tile.w}`,
                gridRow: `${tile.y + 1} / span ${tile.h}`
              }}
              className='relative p-0.5'
            >
              <div
                style={animStyle}
                className={cn(
                  `
                    size-full rounded-xs border transition-colors duration-500
                    will-change-transform
                  `,
                  toneClasses
                )}
              />
            </div>
          );
        })}

        {/* Intersection corner dots matching editorial wireframe */}
        {cornerPins.map((pin) => (
          <div
            key={`pin-${pin.col}-${pin.row}`}
            style={{
              gridColumn: `${pin.col} / span 1`,
              gridRow: `${pin.row} / span 1`
            }}
            className='pointer-events-none relative z-20'
          >
            <span
              className='
              absolute -top-1 -left-1 size-2 rounded-xs bg-foreground/50
              shadow-xs
              dark:bg-foreground/70
            '
            />
          </div>
        ))}
      </div>

      {/* Radial scrim vignette to ensure center text & pixel icons maintain 100% legibility */}
      <div
        className='
        pointer-events-none absolute inset-0 z-10
        bg-[radial-gradient(ellipse_at_center,var(--color-surface)_0%,transparent_75%)]
        opacity-85
        dark:bg-[radial-gradient(ellipse_at_center,var(--color-background)_0%,transparent_75%)]
        dark:opacity-90
      '
      />
    </div>
  );
}
