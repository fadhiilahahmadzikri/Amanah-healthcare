'use client';

import React from 'react';

export interface ToastPreLayersProps {
  layers: string[];
  totalPeekPx: number;
}

/**
 * Atom: Pre-layers that peek out on the left side of the card.
 * Animated by the parent GSAP timeline.
 */
export const ToastPreLayers: React.FC<ToastPreLayersProps> = ({ layers, totalPeekPx }) => {
  return (
    <>
      {layers.map((color, index) => (
        <div
          key={index}
          className='st-prelayer absolute top-0 h-full rounded-xl pointer-events-none shadow-xs'
          style={{
            left: `${totalPeekPx}px`,
            width: `calc(100% - ${totalPeekPx}px)`,
            backgroundColor: color,
            zIndex: index + 1
          }}
          aria-hidden='true'
        />
      ))}
    </>
  );
};
