'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusDotAtomProps {
  color: string;
  glow: string;
  size?: string;
  className?: string;
  pulse?: boolean;
}

/**
 * Atom: StatusDotAtom
 * Agnostic glowing status dot matching the card-stack-v2 reference design.
 */
export function StatusDotAtom({
  color,
  glow,
  size = 'size-2',
  className,
  pulse = false
}: StatusDotAtomProps) {
  return (
    <span
      className={cn(
        size,
        'rounded-full inline-block shrink-0 transition-all duration-300',
        pulse && 'animate-pulse',
        className
      )}
      style={{
        backgroundColor: color,
        boxShadow: `0 0 8px ${glow}`
      }}
    />
  );
}
