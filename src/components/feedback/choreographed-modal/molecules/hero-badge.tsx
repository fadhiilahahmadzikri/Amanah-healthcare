'use client';

import React from 'react';
import { OrbitingSparklesAtom } from '../atoms/orbiting-sparkles';
import { ScallopStampAtom } from '../atoms/scallop-stamp';
import { StrokeIconAtom } from '../atoms/stroke-icon';

export interface HeroBadgeMoleculeProps {
  iconType?: 'check' | 'info' | 'warning' | 'error' | 'reward';
  shadowColor?: string;
  className?: string;
}

/**
 * Molecule: HeroBadgeMolecule
 * Harmonic composition of Orbiting Sparkles, Scallop Seal Stamp, and Animated Center Stroke Icon.
 */
export function HeroBadgeMolecule({
  iconType = 'check',
  shadowColor,
  className
}: HeroBadgeMoleculeProps) {
  return (
    <div className={`relative w-56 h-44 flex items-center justify-center mb-1 ${className || ''}`}>
      <OrbitingSparklesAtom />
      <div className='relative size-28 flex items-center justify-center mt-2'>
        <ScallopStampAtom shadowColor={shadowColor} />
        <StrokeIconAtom iconType={iconType} />
      </div>
    </div>
  );
}
