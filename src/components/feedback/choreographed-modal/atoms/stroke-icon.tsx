'use client';

import React from 'react';

export interface StrokeIconAtomProps {
  iconType?: 'check' | 'info' | 'warning' | 'error' | 'reward';
  className?: string;
}

/**
 * Atom: StrokeIconAtom
 * Line-drawn SVG center status icon with animated stroke-dashoffset drawing animation.
 */
export function StrokeIconAtom({ iconType = 'check', className }: StrokeIconAtomProps) {
  const renderPaths = () => {
    switch (iconType) {
      case 'info':
        return (
          <>
            <path
              className='icon-stroke-path'
              d='M32 28V46'
              stroke='white'
              strokeWidth='7.5'
              strokeLinecap='round'
            />
            <circle
              className='icon-stroke-path-delay'
              cx='32'
              cy='17.5'
              r='4.2'
              fill='white'
            />
          </>
        );
      case 'warning':
        return (
          <>
            <path
              className='icon-stroke-path'
              d='M32 17V36'
              stroke='white'
              strokeWidth='7.5'
              strokeLinecap='round'
            />
            <circle
              className='icon-stroke-path-delay'
              cx='32'
              cy='46.5'
              r='4.2'
              fill='white'
            />
          </>
        );
      case 'error':
        return (
          <>
            <path
              className='icon-stroke-path'
              d='M20 20L44 44'
              stroke='white'
              strokeWidth='7'
              strokeLinecap='round'
            />
            <path
              className='icon-stroke-path-delay'
              d='M44 20L20 44'
              stroke='white'
              strokeWidth='7'
              strokeLinecap='round'
            />
          </>
        );
      case 'reward':
        return (
          <path
            className='icon-stroke-path'
            d='M32 14L36.6 24.8L48.2 25.8L39.4 33.5L42 45L32 38.8L22 45L24.6 33.5L15.8 25.8L27.4 24.8L32 14Z'
            stroke='white'
            strokeWidth='5.2'
            strokeLinejoin='round'
          />
        );
      case 'check':
      default:
        return (
          <path
            className='icon-stroke-path'
            d='M17.5 33L27.5 43L47.5 21'
            stroke='white'
            strokeWidth='7.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        );
    }
  };

  return (
    <svg
      className={`absolute inset-0 size-full p-4 pointer-events-none ${className || ''}`}
      viewBox='0 0 64 64'
      fill='none'
      aria-hidden='true'
    >
      <g>{renderPaths()}</g>
    </svg>
  );
}
