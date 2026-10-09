'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { doctorScheduleDetailQueryOptions } from '../api/queries';
import type { DoctorSchedule } from '../api/types';
import {
  DOCTOR_CARD_STATUS,
  type DoctorCardStatus,
  formatUpcomingFallback,
  getDoctorCardStatus,
  getUpcomingScheduleTime,
  hasConfiguredDoctorSchedule,
  isSessionAvailable,
  isSessionClosed,
  parseDateToIso,
  parseTimeToMinutes,
  type UpcomingScheduleResult
} from '../utils/doctor-schedule-card-utils';
import {
  DoctorCardImage,
  DoctorCardSettingsButton,
  DoctorCutiNotice,
  DoctorInfoRow,
  DoctorQuickCallButton,
  DoctorSpecialtyBadge,
  DoctorSpecialtyText,
  DoctorStatusBadge
} from './doctor-card-atoms';

export type { DoctorCardStatus, UpcomingScheduleResult };
export {
  DOCTOR_CARD_STATUS,
  DoctorCardImage,
  DoctorCutiNotice,
  DoctorInfoRow,
  DoctorQuickCallButton,
  DoctorSpecialtyBadge,
  DoctorSpecialtyText,
  DoctorStatusBadge,
  formatUpcomingFallback,
  getDoctorCardStatus,
  getUpcomingScheduleTime,
  hasConfiguredDoctorSchedule,
  isSessionAvailable,
  isSessionClosed,
  parseDateToIso,
  parseTimeToMinutes
};

export interface DoctorScheduleCardProps {
  doctor: DoctorSchedule;
  date?: string;
  isSelected?: boolean;
  onOpenDetail?: (doctor: DoctorSchedule) => void;
  onOpenEdit?: (doctor: DoctorSchedule) => void;
  onOpenReschedule?: (doctor: DoctorSchedule) => void;
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
  date,
  isSelected,
  onOpenDetail,
  onOpenEdit,
  onOpenReschedule,
  onOpenSettings,
  onCall,
  variant = 'default',
  showActions = true,
  showCallButton = true,
  showStats = true,
  className
}: DoctorScheduleCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  const todayIso = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const cardDate = date || parseDateToIso(doctor.tanggal_praktik) || todayIso;

  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(doctor.id, {
      date: cardDate
    }),
    enabled: Boolean(!doctor.timeline_intervals && !doctor.shifts && doctor.id)
  });
  const effectiveDoctor = detailQuery.data ? { ...doctor, ...detailQuery.data } : doctor;

  const statusLabel = getDoctorCardStatus(effectiveDoctor, undefined, cardDate);
  const isCuti = statusLabel === DOCTOR_CARD_STATUS.CUTI;
  const isUnconfigured = statusLabel === DOCTOR_CARD_STATUS.BELUM_DIATUR;
  const isSelesai = statusLabel === DOCTOR_CARD_STATUS.SELESAI;

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenSettings?.(effectiveDoctor);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) {
      onCall(doctor);
    } else if (doctor.nomor_telepon) {
      window.open(`tel:${doctor.nomor_telepon.replace(/\s+/g, '')}`, '_self');
    }
  };

  const handleReschedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenReschedule) {
      onOpenReschedule(effectiveDoctor);
    } else {
      onOpenEdit?.(effectiveDoctor);
    }
  };

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail?.(effectiveDoctor);
  };

  const hasPill = Boolean(statusLabel && !isSelesai);

  return (
    <div
      ref={cardRef}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 hover:border-primary/60 hover:shadow-md p-5 sm:p-6 min-h-[290px] sm:min-h-[300px] text-card-foreground',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        variant === 'elevated' && 'shadow-sm',
        variant === 'flat' && 'border-transparent shadow-none',
        className
      )}
    >
      <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} />

      {hasPill ? (
        <div className='flex items-center justify-between gap-3 relative z-20'>
          <DoctorStatusBadge status={statusLabel!} />
          <div className='flex items-center gap-1.5'>
            {onOpenSettings && (
              <DoctorCardSettingsButton onClick={handleSettings} />
            )}
            {showCallButton && !isUnconfigured && !isSelesai && (
              <DoctorQuickCallButton
                phoneNumber={doctor.nomor_telepon ?? undefined}
                onClick={handleCall}
              />
            )}
          </div>
        </div>
      ) : (
        <div className='absolute top-5 sm:top-6 right-5 sm:right-6 z-20 flex items-center gap-1.5'>
          {onOpenSettings && (
            <DoctorCardSettingsButton onClick={handleSettings} />
          )}
          {showCallButton && !isUnconfigured && !isSelesai && (
            <DoctorQuickCallButton
              phoneNumber={doctor.nomor_telepon ?? undefined}
              onClick={handleCall}
            />
          )}
        </div>
      )}

      <div className={cn('flex flex-col relative z-20', hasPill ? 'mt-2.5' : 'mt-0')}>
        <h3
          title={doctor.nama_dokter}
          className='text-[17px] sm:text-[18px] font-bold text-card-foreground tracking-tight leading-snug pr-24 sm:pr-28 line-clamp-1'
        >
          {isUnconfigured ? (
            doctor.nama_dokter
          ) : (
            <button
              type='button'
              onClick={handleDetail}
              className='text-left hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline'
            >
              {doctor.nama_dokter}
            </button>
          )}
        </h3>

        <DoctorSpecialtyText specialty={doctor.spesialisasi} className='mt-0.5 mb-2' />

        <DoctorInfoRow
          icon={<Icons.stethoscope className='size-3.5 text-muted-foreground' />}
          text={doctor.ruang_praktik}
        />

        {!isCuti &&
          !isUnconfigured &&
          (effectiveDoctor.tanggal_praktik || doctor.tanggal_praktik) && (
            <DoctorInfoRow
              icon={<Icons.calendar className='size-3.5 text-muted-foreground' />}
              text={effectiveDoctor.tanggal_praktik || doctor.tanggal_praktik || ''}
              className='mt-1'
            />
          )}
      </div>

      {showStats &&
        (isCuti ? (
          <DoctorCutiNotice
            title='Dokter sedang cuti'
            subtitle={doctor.cuti_reason || 'Tidak ada jadwal praktik'}
          />
        ) : isUnconfigured ? (
          <DoctorCutiNotice
            title='Belum ada jadwal praktik'
            subtitle='Dokter ini belum memiliki sesi praktik yang diatur.'
          />
        ) : isSelesai ? (
          <DoctorCutiNotice
            title='Praktik Selesai'
            subtitle='Seluruh sesi praktik dokter untuk tanggal ini telah selesai.'
          />
        ) : null)}

      {showActions && !isUnconfigured && (
        <div
          className={cn(
            'flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20'
          )}
        >
          {Boolean(statusLabel) && !isCuti && !isSelesai && (
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={handleReschedule}
              className='font-semibold'
              leadingIcon={<Icons.calendar className='size-3.5 text-muted-foreground' />}
            >
              Reschedule
            </Button>
          )}

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
