'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface QueueWaitingRoomSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function QueueWaitingRoomSvg({ className, ...props }: QueueWaitingRoomSvgProps) {
  return (
    <svg
      viewBox='0 0 800 450'
      preserveAspectRatio='xMidYMid slice'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('w-full h-full block select-none pointer-events-none', className)}
      {...props}
    >
      <defs>
        <style>{`
          text {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            user-select: none;
          }
        `}</style>

        {/* Global Lighting & Soft Vignette */}
        <radialGradient id='qwr-vignette' cx='30%' cy='30%' r='75%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.6' />
          <stop offset='70%' stopColor='#ffffff' stopOpacity='0.05' />
          <stop offset='100%' stopColor='var(--primary, #0284c7)' stopOpacity='0.15' />
        </radialGradient>

        {/* Room Gradients Derived from Theme */}
        <linearGradient id='qwr-floor-grad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 12%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 3%, white)' />
        </linearGradient>

        <linearGradient id='qwr-left-wall-grad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 4%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 10%, white)' />
        </linearGradient>

        <linearGradient id='qwr-right-wall-grad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 6%, white)' />
        </linearGradient>

        {/* Cushion Gradients (Crisp Pure White with Theme Ambient Tint) */}
        <linearGradient id='qwr-cushion-top' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 4%, white)' />
        </linearGradient>

        <linearGradient id='qwr-cushion-left' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 4%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 16%, white)' />
        </linearGradient>

        <linearGradient id='qwr-cushion-right' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 22%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 32%, white)' />
        </linearGradient>

        {/* Tubular Frame Gradients (Defined Theme Accent Metal) */}
        <linearGradient id='qwr-frame-top' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 38%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 55%, white)' />
        </linearGradient>

        <linearGradient id='qwr-frame-side' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 65%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 85%, white)' />
        </linearGradient>

        <linearGradient id='qwr-frame-front' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 48%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 72%, white)' />
        </linearGradient>

        {/* Screen Gradients */}
        <linearGradient id='qwr-screen-bezel-top' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 8%, white)' />
        </linearGradient>

        <linearGradient id='qwr-screen-bezel-side' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 35%, white)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 50%, white)' />
        </linearGradient>

        <linearGradient id='qwr-screen-display' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 3%, white)' />
        </linearGradient>

        {/* Plant Gradients (Rich Theme Botanical Tones) */}
        <linearGradient id='qwr-pot-grad' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 25%, white)' />
          <stop offset='35%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 35%, white)' />
        </linearGradient>

        <linearGradient id='qwr-leaf-bright' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='color-mix(in oklab, var(--primary) 65%, white)' />
          <stop offset='100%' stopColor='var(--primary)' />
        </linearGradient>

        <linearGradient id='qwr-leaf-dark' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='var(--primary)' />
          <stop offset='100%' stopColor='color-mix(in oklab, var(--primary) 75%, black)' />
        </linearGradient>

        {/* Soft Natural Shadows */}
        <filter id='qwr-shadow-soft' x='-40%' y='-40%' width='180%' height='180%'>
          <feGaussianBlur stdDeviation='9' />
        </filter>
        <filter id='qwr-shadow-contact' x='-40%' y='-40%' width='180%' height='180%'>
          <feGaussianBlur stdDeviation='4' />
        </filter>

        {/* Floor Grid Pattern */}
        <pattern id='qwr-grid' width='70' height='70' patternUnits='userSpaceOnUse'>
          <path
            d='M 70 0 L 0 0 0 70'
            fill='none'
            stroke='#ffffff'
            strokeWidth='1.8'
            strokeOpacity='0.85'
          />
        </pattern>
      </defs>

      {/* Background Base */}
      <rect width='100%' height='100%' fill='color-mix(in oklab, var(--primary) 12%, white)' />

      {/* Center origin: cx=400, cy=180 */}

      {/* Right Wall (XZ Plane) */}
      <g transform='matrix(1, 0.5, 0, 1, 400, 180)'>
        <rect x='0' y='-400' width='600' height='400' fill='url(#qwr-right-wall-grad)' />
        {/* Skirting baseboard */}
        <rect
          x='0'
          y='-8'
          width='600'
          height='8'
          fill='color-mix(in oklab, var(--primary) 22%, white)'
        />
      </g>

      {/* Left Wall (YZ Plane) */}
      <g transform='matrix(-1, 0.5, 0, 1, 400, 180)'>
        <rect x='0' y='-400' width='600' height='400' fill='url(#qwr-left-wall-grad)' />
        {/* Skirting baseboard */}
        <rect
          x='0'
          y='-8'
          width='600'
          height='8'
          fill='color-mix(in oklab, var(--primary) 26%, white)'
        />
      </g>

      {/* Floor (XY Plane) */}
      <g transform='matrix(1, 0.5, -1, 0.5, 400, 180)'>
        <rect x='0' y='0' width='600' height='600' fill='url(#qwr-floor-grad)' />
        <rect x='0' y='0' width='600' height='600' fill='url(#qwr-grid)' />

        {/* Diffuse Soft Shadow under Sofa Base */}
        <rect
          x='6'
          y='50'
          width='78'
          height='298'
          rx='14'
          fill='color-mix(in oklab, var(--primary) 65%, black)'
          opacity='0.22'
          filter='url(#qwr-shadow-soft)'
        />
        {/* Deep Contact Ambient Shadow under Rail/Legs */}
        <rect
          x='12'
          y='56'
          width='54'
          height='286'
          rx='6'
          fill='color-mix(in oklab, var(--primary) 85%, black)'
          opacity='0.28'
          filter='url(#qwr-shadow-contact)'
        />
      </g>

      {/* Corner Seam Line */}
      <path
        d='M 400 180 L 400 -220'
        stroke='color-mix(in oklab, var(--primary) 18%, white)'
        strokeWidth='2'
      />
      {/* Floor Border Lines */}
      <path d='M 400 180 L 800 380' stroke='#ffffff' strokeWidth='3' opacity='0.9' />
      <path d='M 400 180 L 0 380' stroke='#ffffff' strokeWidth='3' opacity='0.9' />

      {/* Screen Mounted on Right Wall */}
      <g transform='translate(460, 65)'>
        {/* Top Face */}
        <g transform='translate(0, -140) matrix(1, 0.5, -1, 0.5, 0, 0)'>
          <rect width='260' height='10' rx='4' fill='url(#qwr-screen-bezel-top)' />
        </g>
        {/* Left Face */}
        <g transform='translate(260, -10) matrix(-1, 0.5, 0, 1, 0, 0)'>
          <rect width='10' height='140' rx='4' fill='url(#qwr-screen-bezel-side)' />
        </g>
        {/* Right Face (Display) */}
        <g transform='translate(-10, -135) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect
            x='-6'
            y='-6'
            width='272'
            height='152'
            rx='12'
            fill='color-mix(in oklab, var(--primary) 65%, black)'
            opacity='0.22'
            filter='url(#qwr-shadow-soft)'
          />
          <rect
            width='260'
            height='140'
            rx='10'
            fill='#ffffff'
            stroke='color-mix(in oklab, var(--primary) 18%, white)'
            strokeWidth='1.5'
          />
          <rect
            x='8'
            y='8'
            width='244'
            height='124'
            rx='6'
            fill='url(#qwr-screen-display)'
            stroke='color-mix(in oklab, var(--primary) 10%, white)'
            strokeWidth='1'
          />
        </g>
      </g>

      {/* Corner Plant */}
      <g id='qwr-potted-plant'>
        {/* Ground Shadow */}
        <ellipse
          cx='405'
          cy='207.5'
          rx='20'
          ry='10'
          fill='color-mix(in oklab, var(--primary) 70%, black)'
          opacity='0.3'
          filter='url(#qwr-shadow-soft)'
        />
        <ellipse
          cx='405'
          cy='207.5'
          rx='12'
          ry='6'
          fill='color-mix(in oklab, var(--primary) 90%, black)'
          opacity='0.35'
          filter='url(#qwr-shadow-contact)'
        />

        {/* Back Leaves */}
        <path d='M 405,172 Q 418,135 442,142 Q 430,162 405,172' fill='url(#qwr-leaf-dark)' />
        <path d='M 405,172 Q 380,128 368,140 Q 385,164 405,172' fill='url(#qwr-leaf-dark)' />
        <path d='M 405,172 Q 405,122 424,118 Q 418,148 405,172' fill='url(#qwr-leaf-dark)' />

        {/* Pot Body */}
        <path
          d='M 388,172 L 392,206 A 13 6.5 0 0 0 418,206 L 422,172 Z'
          fill='url(#qwr-pot-grad)'
          stroke='color-mix(in oklab, var(--primary) 30%, white)'
          strokeWidth='1'
        />
        <ellipse
          cx='405'
          cy='172'
          rx='17'
          ry='8.5'
          fill='#ffffff'
          stroke='color-mix(in oklab, var(--primary) 25%, white)'
          strokeWidth='1'
        />
        <ellipse
          cx='405'
          cy='172'
          rx='14'
          ry='7'
          fill='color-mix(in oklab, var(--primary) 50%, white)'
        />

        {/* Front Leaves */}
        <path
          d='M 405,172 Q 375,155 362,168 Q 380,186 405,172'
          fill='url(#qwr-leaf-bright)'
          stroke='var(--primary)'
          strokeWidth='0.75'
        />
        <path
          d='M 405,172 Q 436,160 448,174 Q 430,188 405,172'
          fill='url(#qwr-leaf-bright)'
          stroke='var(--primary)'
          strokeWidth='0.75'
        />
        <path
          d='M 405,172 Q 396,138 388,132 Q 396,158 405,172'
          fill='url(#qwr-leaf-bright)'
          stroke='var(--primary)'
          strokeWidth='0.75'
        />
        <path d='M 405,172 Q 412,142 426,146 Q 416,166 405,172' fill='url(#qwr-leaf-bright)' />
      </g>

      {/* ===== SOFA WITH DISTINCT PUFFY CUSHIONS & METALLIC TUBULAR FRAME ===== */}

      {/* Under-Seat Base Rails */}
      <g transform='translate(362, 212)'>
        <g transform='translate(68, 14) matrix(-1, 0.5, 0, 1, 0, 0)'>
          <rect width='288' height='6' rx='2' fill='url(#qwr-frame-side)' />
        </g>
        <g transform='translate(-288, 158) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect width='68' height='6' rx='2' fill='url(#qwr-frame-front)' />
        </g>
      </g>

      {/* Left Armrest Frame */}
      <g transform='translate(352, 204)'>
        <g transform='translate(6, -42) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect
            width='6'
            height='48'
            rx='2.5'
            fill='url(#qwr-frame-front)'
            stroke='color-mix(in oklab, var(--primary) 45%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(74, -8) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect
            width='6'
            height='48'
            rx='2.5'
            fill='url(#qwr-frame-front)'
            stroke='color-mix(in oklab, var(--primary) 45%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(0, -48) matrix(1, 0.5, -1, 0.5, 0, 0)'>
          <rect
            width='80'
            height='7'
            rx='3.5'
            fill='url(#qwr-frame-top)'
            stroke='color-mix(in oklab, var(--primary) 35%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(0, -22) matrix(1, 0.5, -1, 0.5, 0, 0)'>
          <rect width='80' height='5' rx='2.5' fill='url(#qwr-frame-top)' />
        </g>
      </g>

      {/* CUSHIONS 1 to 4 */}
      {[
        { t1: [344, 182], t2: [360, 202] },
        { t1: [272, 218], t2: [288, 238] },
        { t1: [200, 254], t2: [216, 274] },
        { t1: [128, 290], t2: [144, 310] }
      ].map((cushion, idx) => (
        <React.Fragment key={idx}>
          <g transform={`translate(${cushion.t1[0]}, ${cushion.t1[1]})`}>
            <g transform='translate(14, -36) matrix(-1, 0.5, 0, 1, 0, 0)'>
              <rect
                width='68'
                height='44'
                rx='5'
                fill='url(#qwr-cushion-left)'
                stroke='color-mix(in oklab, var(--primary) 20%, white)'
                strokeWidth='0.75'
              />
            </g>
            <g transform='translate(-68, -8) matrix(1, 0.5, 0, 1, 0, 0)'>
              <rect
                width='14'
                height='44'
                rx='5'
                fill='url(#qwr-cushion-right)'
                stroke='color-mix(in oklab, var(--primary) 25%, white)'
                strokeWidth='0.75'
              />
            </g>
            <g transform='translate(0, -44) matrix(1, 0.5, -1, 0.5, 0, 0)'>
              <rect
                width='14'
                height='68'
                rx='5'
                fill='url(#qwr-cushion-top)'
                stroke='color-mix(in oklab, var(--primary) 15%, white)'
                strokeWidth='0.75'
              />
            </g>
          </g>
          <g transform={`translate(${cushion.t2[0]}, ${cushion.t2[1]})`}>
            <g transform='translate(62, 18) matrix(-1, 0.5, 0, 1, 0, 0)'>
              <rect
                width='68'
                height='14'
                rx='4'
                fill='url(#qwr-cushion-left)'
                stroke='color-mix(in oklab, var(--primary) 20%, white)'
                strokeWidth='0.75'
              />
            </g>
            <g transform='translate(-68, 21) matrix(1, 0.5, 0, 1, 0, 0)'>
              <rect
                width='62'
                height='14'
                rx='4'
                fill='url(#qwr-cushion-right)'
                stroke='color-mix(in oklab, var(--primary) 25%, white)'
                strokeWidth='0.75'
              />
            </g>
            <g transform='translate(0, -14) matrix(1, 0.5, -1, 0.5, 0, 0)'>
              <rect
                width='62'
                height='68'
                rx='4'
                fill='url(#qwr-cushion-top)'
                stroke='color-mix(in oklab, var(--primary) 15%, white)'
                strokeWidth='0.75'
              />
            </g>
          </g>
        </React.Fragment>
      ))}

      {/* Right Armrest Frame */}
      <g transform='translate(52, 354)'>
        <g transform='translate(6, -42) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect
            width='6'
            height='48'
            rx='2.5'
            fill='url(#qwr-frame-front)'
            stroke='color-mix(in oklab, var(--primary) 45%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(74, -8) matrix(1, 0.5, 0, 1, 0, 0)'>
          <rect
            width='6'
            height='48'
            rx='2.5'
            fill='url(#qwr-frame-front)'
            stroke='color-mix(in oklab, var(--primary) 45%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(0, -48) matrix(1, 0.5, -1, 0.5, 0, 0)'>
          <rect
            width='80'
            height='7'
            rx='3.5'
            fill='url(#qwr-frame-top)'
            stroke='color-mix(in oklab, var(--primary) 35%, white)'
            strokeWidth='0.5'
          />
        </g>
        <g transform='translate(0, -22) matrix(1, 0.5, -1, 0.5, 0, 0)'>
          <rect width='80' height='5' rx='2.5' fill='url(#qwr-frame-top)' />
        </g>
      </g>

      {/* Global Subtle Lighting Overlay */}
      <rect
        width='100%'
        height='100%'
        fill='url(#qwr-vignette)'
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
}
