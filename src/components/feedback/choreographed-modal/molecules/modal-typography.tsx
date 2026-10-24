'use client';

import React from 'react';
import { StatusPillAtom } from '../atoms/status-pill';

export interface ModalTypographyMoleculeProps {
  statusText?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Molecule: ModalTypographyMolecule
 * Staggered presentation of the status capsule, bold multiline message, and explanatory subtext.
 */
export function ModalTypographyMolecule({
  statusText,
  title,
  subtitle,
  className
}: ModalTypographyMoleculeProps) {
  return (
    <div className={`flex flex-col items-center text-center w-full px-2 ${className || ''}`}>
      {statusText && (
        <div className='stagger-item stagger-1 mb-2.5'>
          <StatusPillAtom text={statusText} />
        </div>
      )}

      <h2 className='stagger-item stagger-2 text-lg sm:text-[19px] leading-snug font-extrabold text-foreground px-2 whitespace-pre-line'>
        {title}
      </h2>

      {subtitle && (
        <p className='stagger-item stagger-3 text-xs text-muted-foreground font-medium mt-1.5 max-w-[320px]'>
          {subtitle}
        </p>
      )}
    </div>
  );
}
