'use client';

import React from 'react';
import { ReplacementCard } from '../replacement-card';
import type { ActiveDragState } from './types';

export interface ReplacementDragOverlayProps {
  dragState: ActiveDragState | null;
  rotationDeg: number;
}

export function ReplacementDragOverlay({ dragState, rotationDeg }: ReplacementDragOverlayProps) {
  if (!dragState) return null;

  return (
    <div
      className='fixed pointer-events-none z-50 transition-none will-change-transform'
      style={{
        left: 0,
        top: 0,
        width: dragState.width || 320,
        transform: `translate3d(${dragState.x}px, ${dragState.y}px, 0)`
      }}
    >
      <div
        style={{
          transform: `rotate(${rotationDeg}deg) scale(1.035)`,
          transition: 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease'
        }}
        className='rounded-[22px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.22),0_8px_16px_-6px_rgba(0,0,0,0.12)] ring-2 ring-primary/40 opacity-95'
      >
        <ReplacementCard
          opportunity={dragState.opportunity}
          onSelect={() => {}}
          className='pointer-events-none'
          noShadow={true}
          disableHoverAnimate={true}
        />
      </div>
    </div>
  );
}
