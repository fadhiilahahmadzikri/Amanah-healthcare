'use client';

import React from 'react';

export interface OrbitingSparklesAtomProps {
  className?: string;
}

/**
 * Atom: OrbitingSparklesAtom
 * Expanding morph rings and 4-point diamond stars orbiting the central seal badge.
 */
export function OrbitingSparklesAtom({ className }: OrbitingSparklesAtomProps) {
  return (
    <svg
      className={`absolute inset-0 size-full pointer-events-none overflow-visible ${className || ''}`}
      viewBox='0 0 220 190'
      aria-hidden='true'
    >
      {/* Morph Expanding Rings */}
      <circle
        cx='110'
        cy='98'
        r='46'
        fill='none'
        stroke='var(--theme-primary, var(--primary))'
        className='morph-ring'
      />
      <circle
        cx='110'
        cy='98'
        r='38'
        fill='none'
        stroke='var(--theme-primary, var(--primary))'
        className='morph-ring'
        style={{ animationDelay: '0.28s' }}
      />

      {/* Top Center 4-Point Diamond Star */}
      <g
        className='sparkle-particle'
        style={{ '--start-x': '0px', '--start-y': '50px' } as React.CSSProperties}
      >
        <path
          d='M110 8 C112.5 17, 114 18.5, 123 21 C114 23.5, 112.5 25, 110 34 C107.5 25, 106 23.5, 97 21 C106 18.5, 107.5 17, 110 8 Z'
          fill='var(--theme-primary, var(--primary))'
        />
      </g>

      {/* Bottom-Left 4-Point Diamond Star */}
      <g
        className='sparkle-particle'
        style={
          {
            '--start-x': '55px',
            '--start-y': '-30px',
            animationDelay: '0.36s'
          } as React.CSSProperties
        }
      >
        <path
          d='M34 132 C35.8 138, 37 139.2, 43 141 C37 142.8, 35.8 144, 34 150 C32.2 144, 31 142.8, 25 141 C31 139.2, 32.2 138, 34 132 Z'
          fill='var(--theme-primary, var(--primary))'
          opacity='0.9'
        />
      </g>

      {/* Right-Middle 4-Point Diamond Star */}
      <g
        className='sparkle-particle'
        style={
          {
            '--start-x': '-60px',
            '--start-y': '0px',
            animationDelay: '0.4s'
          } as React.CSSProperties
        }
      >
        <path
          d='M190 92 C191.5 97, 192.5 98, 197.5 99.5 C192.5 101, 191.5 102, 190 107 C188.5 102, 187.5 101, 182.5 99.5 C187.5 98, 188.5 97, 190 92 Z'
          fill='var(--theme-primary, var(--primary))'
          opacity='0.65'
        />
      </g>

      {/* Orbiting Clean Dots */}
      <circle
        cx='48'
        cy='52'
        r='3'
        fill='var(--theme-primary, var(--primary))'
        className='sparkle-particle'
        style={
          {
            '--start-x': '45px',
            '--start-y': '35px',
            animationDelay: '0.32s'
          } as React.CSSProperties
        }
        opacity='0.75'
      />
      <circle
        cx='172'
        cy='48'
        r='2.5'
        fill='var(--theme-primary, var(--primary))'
        className='sparkle-particle'
        style={
          {
            '--start-x': '-45px',
            '--start-y': '35px',
            animationDelay: '0.38s'
          } as React.CSSProperties
        }
        opacity='0.5'
      />
      <circle
        cx='164'
        cy='146'
        r='2.2'
        fill='var(--theme-primary, var(--primary))'
        className='sparkle-particle'
        style={
          {
            '--start-x': '-35px',
            '--start-y': '-35px',
            animationDelay: '0.44s'
          } as React.CSSProperties
        }
        opacity='0.4'
      />
    </svg>
  );
}
