'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PatientOptionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PatientOptionCard({
  isSelected,
  children,
  className,
  ...props
}: PatientOptionCardProps) {
  return (
    <button
      type='button'
      data-slot='patient-option-card'
      data-selected={isSelected}
      className={cn(
        'flex cursor-pointer select-none items-center justify-center rounded-xl border-[1.5px] border-border bg-card p-4 text-center font-medium transition-all duration-200',
        'hover:border-primary hover:bg-accent/40',
        isSelected &&
          'border-primary bg-primary text-primary-foreground hover:bg-primary/95 hover:border-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
