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
  DoctorCardPatientStack,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge
} from './doctor-card-atoms';

export type { DoctorCardStatus };
export {
  DOCTOR_CARD_STATUS,
  DoctorCardImage,
  DoctorCardPatientStack,
  DoctorCardSettingsButton,
  DoctorSpecialtyText,
  DoctorStatusBadge,
  getDoctorCardStatus
};

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  date?: string;
  isSelected?: boolean;
  onCardClick?: (doctor: DoctorSchedule) => void;
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
  onCardClick,
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

  // Derive operational status strictly from backend contract
  const cardStatus = getDoctorCardStatus(doctor);
  const isPending = cardStatus === DOCTOR_CARD_STATUS.PENDING;

  const handleContainerClick = () => {
    if (onCardClick) {
      onCardClick(doctor);
    } else {
      onOpenDetail?.(doctor);
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    onOpenSettings?.(doctor);
  };

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    onOpenDetail?.(doctor);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: card container contains interactive action buttons
    <div
      ref={cardRef}
      role='button'
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContainerClick();
        }
      }}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 p-5 sm:p-6 min-h-[220px] text-card-foreground cursor-pointer',
        isPending
          ? 'opacity-65 border-dashed bg-muted/20'
          : 'hover:border-primary/60 hover:shadow-md',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      {/* 1. Doctor Avatar Background */}
      <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />

      {/* 2. Header: Status Badge (Buka / Tutup / Menunggu Verifikasi) and Settings Action */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <DoctorStatusBadge status={cardStatus} />
        <div className='flex items-center gap-1.5'>
          {onCardClick && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              shape='pill'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(doctor);
              }}
              title='Lihat & Edit Profil Dokter'
              aria-label='Lihat & Edit Profil Dokter'
              className='size-8 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80'
            >
              <Icons.user className='size-3.5' />
            </Button>
          )}
          {onOpenSettings && !isPending && <DoctorCardSettingsButton onClick={handleSettings} />}
        </div>
      </div>

      {/* 3. Core Identity: Doctor Name, Specialty & Patient Stack */}
      <div className='flex flex-col relative z-20 mt-3'>
        <h3
          title={doctor.nama_dokter}
          className='text-[17px] sm:text-[18px] font-bold text-card-foreground tracking-tight leading-snug pr-24 sm:pr-28 line-clamp-1'
        >
          <button
            type='button'
            onClick={
              isPending
                ? (e) => {
                    e.stopPropagation();
                    onCardClick?.(doctor);
                  }
                : handleDetail
            }
            className={cn(
              'text-left transition-colors focus-visible:outline-none cursor-pointer',
              isPending
                ? 'opacity-90 hover:text-primary'
                : 'hover:text-primary focus-visible:underline'
            )}
          >
            {doctor.nama_dokter}
          </button>
        </h3>

        <DoctorSpecialtyText specialty={doctor.spesialisasi} className='mt-2 mb-3' />

        <DoctorCardPatientStack
          patients={doctor.pasien_preview}
          totalPatients={doctor.total_pasien}
          onClick={isPending ? undefined : handleDetail}
          className='mt-0.5'
        />
      </div>

      {/* 4. Footer Actions: Detail */}
      {showActions && (
        <div className='flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20'>
          {isPending ? (
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={(e) => {
                e.stopPropagation();
                onCardClick?.(doctor);
              }}
              className='font-bold text-xs'
            >
              <Icons.user className='size-3 mr-1' />
              Profil Medis
            </Button>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
