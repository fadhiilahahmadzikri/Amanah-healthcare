'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface DoctorSessionPatientButtonProps {
  bookedCount: number;
  onClick: () => void;
  className?: string;
}

/**
 * Pure Atomic Presentation Component: DoctorSessionPatientButton
 * Single icon-based button for accessing registered patient list of a doctor's session.
 */
export function DoctorSessionPatientButton({
  bookedCount,
  onClick,
  className
}: DoctorSessionPatientButtonProps) {
  return (
    <div className={cn('flex items-center gap-1 shrink-0', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            className='size-7 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer select-none'
            aria-label={`Daftar Pasien (${bookedCount})`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }
            }}
          >
            <Icons.users className='size-4' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='left' className='text-xs font-sans'>
          Daftar Pasien ({bookedCount})
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
