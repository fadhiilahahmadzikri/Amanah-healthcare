'use client';

import React from 'react';

export interface ScallopStampAtomProps {
  shadowColor?: string;
  className?: string;
}

/**
 * Atom: ScallopStampAtom
 * 12-lobed organic SVG seal badge with dynamic theme drop-shadow and entrance animation.
 */
export function ScallopStampAtom({ shadowColor, className }: ScallopStampAtomProps) {
  const effectiveShadow = shadowColor || 'var(--theme-shadow, rgba(22, 163, 74, 0.28))';

  return (
    <svg
      className={`size-full overflow-visible badge-scallop ${className || ''}`}
      style={{ filter: `drop-shadow(0 12px 24px ${effectiveShadow})` }}
      viewBox='0 0 120 120'
      aria-hidden='true'
    >
      <path
        fill='var(--theme-badge-bg, var(--primary))'
        d='M 106.0,60.0 C 106.0,66.2 98.7,71.3 96.8,76.9 C 94.9,82.6 97.6,90.9 94.1,95.7 C 90.6,100.5 81.9,100.3 77.1,103.8 C 72.3,107.3 69.8,115.6 64.1,117.5 C 58.5,119.3 52.0,113.8 46.0,113.8 C 40.0,113.8 33.5,119.3 27.9,117.5 C 22.2,115.6 19.7,107.3 14.9,103.8 C 10.1,100.3 1.4,100.5 -2.1,95.7 C -5.6,90.9 -2.9,82.6 -4.8,76.9 C -6.7,71.3 -14.0,66.2 -14.0,60.0 C -14.0,53.8 -6.7,48.7 -4.8,43.1 C -2.9,37.4 -5.6,29.1 -2.1,24.3 C 1.4,19.5 10.1,19.7 14.9,16.2 C 19.7,12.7 22.2,4.4 27.9,2.5 C 33.5,0.7 40.0,6.2 46.0,6.2 C 52.0,6.2 58.5,0.7 64.1,2.5 C 69.8,4.4 72.3,12.7 77.1,16.2 C 81.9,19.7 90.6,19.5 94.1,24.3 C 97.6,29.1 94.9,37.4 96.8,43.1 C 98.7,48.7 106.0,53.8 106.0,60.0 Z'
        transform='translate(14, 0)'
      />
    </svg>
  );
}
