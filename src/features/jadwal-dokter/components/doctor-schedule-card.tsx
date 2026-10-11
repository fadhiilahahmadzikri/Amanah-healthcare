'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import {
  DOCTOR_CARD_STATUS,
  type DoctorCardStatus,
  getDoctorCardStatus
} from '../utils/doctor-schedule-card-utils';
import {
  DoctorCardImage,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge
} from './doctor-card-atoms';

export type { DoctorCardStatus };
export {
  DOCTOR_CARD_STATUS,
  DoctorCardImage,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge,
  getDoctorCardStatus
};

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  date?: string;
  isSelected?: boolean;
  onOpenDetail?: (doctor: DoctorSchedule) => void;
  onOpenSettings?: (doctor: DoctorSchedule) => void;
  onCall?: (doctor: DoctorSchedule) => void;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  showActions?: boolean;
  showCallButton?: boolean;
  showStats?: boolean;
  className?: string;
}

export function DoctorScheduleCard({
  doctor,
  isSelected,
  onOpenDetail,
  onOpenSettings,
  variant = 'default',
  showActions = true,
  className
}: DoctorScheduleCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  // Derive status strictly from backend contract (Binary: 'Buka' or 'Tutup')
  const statusLabel = getDoctorCardStatus(doctor);
  const isOpen = statusLabel === DOCTOR_CARD_STATUS.OPEN;

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenSettings?.(doctor);
  };

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail?.(doctor);
  };

  return (
    <div
      ref={cardRef}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 hover:border-primary/60 hover:shadow-md p-5 sm:p-6 min-h-[220px] text-card-foreground',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {/* 1. Doctor Avatar Background */}
      <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />

      {/* 2. Header: Status Badge (Buka / Tutup) and Settings Action */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <DoctorStatusBadge status={statusLabel || 'Tutup'} />
        {onOpenSettings && <DoctorCardSettingsButton onClick={handleSettings} />}
      </div>

      {/* 3. Core Identity: Doctor Name & Specialty */}
      <div className='flex flex-col relative z-20 mt-3'>
        <h3
          title={doctor.nama_dokter}
          className='text-[17px] sm:text-[18px] font-bold text-card-foreground tracking-tight leading-snug pr-24 sm:pr-28 line-clamp-1'
        >
          <button
            type='button'
            onClick={handleDetail}
            className='text-left hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline'
          >
            {doctor.nama_dokter}
          </button>
        </h3>

        <DoctorSpecialtyText specialty={doctor.spesialisasi} className='mt-1 mb-2' />
      </div>

      {/* 4. Footer Actions: Detail */}
      {showActions && (
        <div className='flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20'>
          <Button
            type='button'
            variant='default'
            size='card-action'
            shape='pill'
            withTrailingCircleIcon
            onClick={handleDetail}
            className='font-bold'
          >
            Detail
          </Button>
        </div>
      )}
    </div>
  );
}

export default DoctorScheduleCard;
