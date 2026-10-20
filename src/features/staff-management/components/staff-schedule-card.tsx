'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import {
  MasterEntityCard,
  EntityCardPrimaryAction,
  EntityCardSecondaryAction
} from '@/components/cards/master-entity-card';
import type { StaffMember } from '../api/staff-management.api';
import { STAFF_ROLE_LABELS } from '../constants/staff.constants';
import { StaffRoleBadge, StaffAttendanceBadge } from './staff-card-atoms';

export interface StaffScheduleCardProps {
  staff: StaffMember;
  onOpenRoster?: (staff: StaffMember) => void;
  onOpenDetail?: (staff: StaffMember) => void;
  isSelected?: boolean;
  className?: string;
}

export function StaffScheduleCard({
  staff,
  onOpenRoster,
  onOpenDetail,
  isSelected,
  className
}: StaffScheduleCardProps) {
  // Derive operational account status strictly from backend contract (No Dummy Data)
  const statusKey = staff.leaveInfo?.isOnLeave ? 'CUTI' : staff.isActive ? 'AKTIF' : 'NONAKTIF';

  const statusLabel = staff.leaveInfo?.isOnLeave ? 'Cuti' : staff.isActive ? 'Aktif' : 'Non-Aktif';

  const initials = React.useMemo(() => {
    const raw = (staff.fullName || '').replace(/^(dr|drg|prof)\.\s*/i, '').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'S').toUpperCase();
  }, [staff.fullName]);

  const handleContainerClick = () => {
    onOpenDetail?.(staff);
  };

  const secondaryAction = onOpenRoster ? (
    <EntityCardSecondaryAction
      label='Atur Shift'
      shortLabel='Roster'
      onClick={(e) => {
        e.stopPropagation();
        onOpenRoster(staff);
      }}
      title='Atur Shift Roster Mingguan'
    />
  ) : null;

  const primaryAction = (
    <EntityCardPrimaryAction
      label='Detail Staf'
      onClick={(e) => {
        e.stopPropagation();
        onOpenDetail?.(staff);
      }}
      title='Lihat Detail & Profil Staf'
    />
  );

  return (
    <MasterEntityCard
      status={statusKey}
      statusLabel={statusLabel}
      isSelected={isSelected}
      name={staff.fullName}
      subtitle={
        <p className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-0.5 truncate'>
          {staff.profession || STAFF_ROLE_LABELS[staff.staffType] || 'Staf Klinik'}
        </p>
      }
      avatarUrl={staff.photoUrl}
      initials={initials}
      contentSlot={
        staff.leaveInfo?.isOnLeave ? (
          <span className='inline-flex items-center gap-1.5 px-2.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-[10.5px] xl:text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate'>
            <Icons.calendar className='size-3 sm:size-2.5 text-sky-500 shrink-0' />
            <span>Sedang Cuti</span>
            {staff.leaveInfo.substituteName && (
              <span className='text-muted-foreground font-normal truncate'>
                (Ganti: {staff.leaveInfo.substituteName})
              </span>
            )}
          </span>
        ) : (
          <div className='flex items-center gap-1.5 flex-wrap min-w-0'>
            <StaffRoleBadge staffType={staff.staffType} />
            {staff.todayAttendance && <StaffAttendanceBadge attendance={staff.todayAttendance} />}
            {!staff.todayAttendance && staff.email && (
              <span className='inline-flex items-center gap-1 text-[11px] sm:text-[10.5px] xl:text-[10px] text-muted-foreground/80 font-normal truncate'>
                <Icons.mail className='size-3 shrink-0' />
                <span className='truncate'>{staff.email}</span>
              </span>
            )}
          </div>
        )
      }
      secondaryAction={secondaryAction}
      primaryAction={primaryAction}
      showActions={true}
      onCardClick={handleContainerClick}
      onTitleClick={(e) => {
        e.stopPropagation();
        onOpenDetail?.(staff);
      }}
      className={className}
    />
  );
}
