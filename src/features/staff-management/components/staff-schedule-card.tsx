'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  MasterEntityCard,
  EntityCardPrimaryAction,
  EntityCardSecondaryAction
} from '@/components/cards/master-entity-card';
import type { StaffMember } from '../api/staff-management.api';
import { StaffRoleBadge, StaffAttendanceBadge } from './staff-card-atoms';

export interface StaffScheduleCardProps {
  staff: StaffMember;
  onOpenRoster?: (staff: StaffMember) => void;
  onOpenDetail?: (staff: StaffMember) => void;
  onExport?: (staff: StaffMember) => void;
  isSelected?: boolean;
  className?: string;
}

export function StaffScheduleCard({
  staff,
  onOpenRoster,
  onOpenDetail,
  onExport: _onExport,
  isSelected,
  className
}: StaffScheduleCardProps) {
  // Derive operational account status strictly from backend contract (No Dummy Data)
  const statusKey = staff.leaveInfo?.isOnLeave ? 'CUTI' : staff.isActive ? 'AKTIF' : 'NONAKTIF';

  const statusLabel = staff.leaveInfo?.isOnLeave ? 'Cuti' : staff.isActive ? 'Aktif' : 'Non-Aktif';

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
        <span
          title={staff.profession || 'Staf Medis'}
          className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight truncate block mt-0.5'
        >
          {staff.profession || 'Staf Medis'}
        </span>
      }
      avatarUrl={staff.photoUrl}
      contentSlot={
        <div className='flex items-center gap-1.5 flex-wrap min-w-0'>
          <StaffRoleBadge staffType={staff.staffType} />
          {staff.todayAttendance && <StaffAttendanceBadge attendance={staff.todayAttendance} />}
          {staff.leaveInfo?.isOnLeave && (
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate'>
              <Icons.calendar className='size-2.5 text-sky-500 shrink-0' />
              <span>Sedang Cuti</span>
              {staff.leaveInfo.substituteName && (
                <span className='text-muted-foreground font-normal truncate'>
                  (Ganti: {staff.leaveInfo.substituteName})
                </span>
              )}
            </span>
          )}
        </div>
      }
      secondaryAction={secondaryAction}
      primaryAction={primaryAction}
      showActions={true}
      onCardClick={handleContainerClick}
      onTitleClick={(e) => {
        e.stopPropagation();
        onOpenDetail?.(staff);
      }}
      className={cn('h-[196px] max-h-[196px]', className)}
    />
  );
}
