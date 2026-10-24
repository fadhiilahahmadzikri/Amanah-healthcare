'use client';

import React from 'react';

/**
 * Atom: SunburstRaysAtom
 * Rotating conic-gradient rays that produce a dynamic ambient glow behind the hero badge.
 */
export function SunburstRaysAtom() {
  return (
    <div className='sunburst-wrapper' aria-hidden='true'>
      <div className='sunburst-rays' />
      <div className='sunburst-rays-secondary' />
    </div>
  );
}
