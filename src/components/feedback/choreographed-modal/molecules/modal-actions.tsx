'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export interface ModalActionsMoleculeProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  className?: string;
}

/**
 * Molecule: ModalActionsMolecule
 * Dual action buttons with staggered entrance animation and active theme pill styling.
 */
export function ModalActionsMolecule({
  primaryLabel = 'Selesai',
  secondaryLabel,
  onPrimary,
  onSecondary,
  className
}: ModalActionsMoleculeProps) {
  return (
    <div className={`stagger-item stagger-4 w-full mt-6 space-y-2.5 ${className || ''}`}>
      <Button
        type='button'
        onClick={onPrimary}
        shape='pill'
        size='lg'
        className='w-full font-bold text-xs tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer'
      >
        {primaryLabel}
      </Button>

      {secondaryLabel && (
        <button
          type='button'
          onClick={onSecondary}
          className='w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
        >
          <Icons.eye className='size-3.5 text-muted-foreground' />
          <span>{secondaryLabel}</span>
        </button>
      )}
    </div>
  );
}
