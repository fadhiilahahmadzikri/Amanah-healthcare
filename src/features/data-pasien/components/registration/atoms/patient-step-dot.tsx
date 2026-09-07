'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PatientStepDotProps {
  active: boolean;
  className?: string;
}

export function PatientStepDot({ active, className }: PatientStepDotProps) {
  return (
    <div
      data-slot='patient-step-dot'
      data-active={active}
      className={cn(
        'h-[2.5px] w-4 rounded-full transition-all duration-300',
        active ? 'bg-primary' : 'bg-muted dark:bg-muted/60',
        className
      )}
    />
  );
}
