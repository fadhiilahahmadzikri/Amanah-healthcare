'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface DoctorSessionPatientCardProps {
  patient: BookedPatientItem;
  onSelect: (patient: BookedPatientItem) => void;
  className?: string;
}

/**
 * Compact Session Patient Card
 * Minimal pill/card displaying strictly the patient name.
 * Shell hugs content, with ellipsis on text overflow.
 */
export function DoctorSessionPatientCard({
  patient,
  onSelect,
  className
}: DoctorSessionPatientCardProps) {
  const fullName = patient.patient?.fullName || 'Pasien';

  return (
    <button
      type='button'
      onClick={() => onSelect(patient)}
      title={fullName}
      className={cn(
        'group flex items-center justify-center px-2.5 py-1.5 rounded-lg text-left',
        'border border-border/70 bg-card hover:bg-accent/80 hover:border-primary/50',
        'text-card-foreground shadow-2xs hover:shadow-xs transition-all cursor-pointer min-w-0 w-full',
        className
      )}
    >
      <span className='truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors select-none'>
        {fullName}
      </span>
    </button>
  );
}
