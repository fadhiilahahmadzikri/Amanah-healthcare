'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  MasterEntityCard,
  EntityCardPrimaryAction,
  EntityCardSecondaryAction
} from '@/components/cards/master-entity-card';
import { getStatusConfig } from '@/styles/clinical-tokens';
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
  showTrailingAvatar?: boolean;
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
  showTrailingAvatar = false,
  className
}: DoctorScheduleCardProps) {
  // Derive operational status strictly from backend contract & centralized clinical tokens
  const cardStatus = getDoctorCardStatus(doctor);
  const statusConfig = getStatusConfig(cardStatus);
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

  const secondaryAction =
    onOpenSettings && !isPending ? (
      <EntityCardSecondaryAction
        label='Lihat Jadwal'
        shortLabel='Jadwal'
        onClick={handleSettings}
        title='Lihat Jadwal Dokter'
      />
    ) : null;

  const primaryAction = isPending ? (
    <Button
      type='button'
      variant='outline'
      onClick={(e) => {
        e.stopPropagation();
        onCardClick?.(doctor);
      }}
      title='Profil Medis Dokter'
      aria-label='Profil Medis Dokter'
      size='sm'
      className='h-8 sm:h-8.5 py-0 px-3 rounded-lg sm:rounded-md text-xs sm:text-[11.5px] font-bold shrink-0 inline-flex items-center gap-1.5 shadow-2xs'
    >
      <Icons.user className='size-3.5 sm:size-3.5 xl:size-3 text-muted-foreground shrink-0' />
      <span>Profil Medis</span>
    </Button>
  ) : (
    <EntityCardPrimaryAction label='Lihat Pasien' onClick={handleDetail} title='Lihat Pasien' />
  );

  return (
    <MasterEntityCard
      status={cardStatus}
      statusLabel={statusConfig.label}
      isSelected={isSelected}
      isPending={isPending}
      variant={variant}
      name={doctor.nama_dokter}
      subtitle={
        <DoctorSpecialtyText
          specialty={doctor.spesialisasi}
          className='text-[12px] sm:text-[11.5px] xl:text-[11px] truncate mt-0.5'
        />
      }
      avatarUrl={doctor.avatar}
      trailingImage={
        showTrailingAvatar ? <DoctorCardImage src={doctor.avatar} alt={doctor.nama_dokter} /> : null
      }
      contentSlot={
        doctor.is_on_leave ? (
          <span className='inline-flex items-center gap-1.5 px-2.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-[10.5px] xl:text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate'>
            <Icons.calendar className='size-3 sm:size-2.5 text-sky-500 shrink-0' />
            <span>Sedang Cuti</span>
            {doctor.substitute_doctor_name && (
              <span className='text-muted-foreground font-normal truncate'>
                (Ganti: {doctor.substitute_doctor_name})
              </span>
            )}
          </span>
        ) : (
          <DoctorCardPatientStack
            patients={doctor.pasien_preview}
            totalPatients={doctor.total_pasien}
            onClick={isPending ? undefined : handleDetail}
          />
        )
      }
      secondaryAction={secondaryAction}
      primaryAction={primaryAction}
      showActions={showActions}
      onCardClick={handleContainerClick}
      onTitleClick={
        isPending
          ? (e) => {
              e.stopPropagation();
              onCardClick?.(doctor);
            }
          : handleDetail
      }
      className={className}
    />
  );
}
