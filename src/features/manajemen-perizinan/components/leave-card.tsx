'use client';

import React from 'react';
import { MasterEntityCard, EntityCardPrimaryAction } from '@/components/cards/master-entity-card';
import { LeaveBookingDateRoute } from './leave-booking-date-route';
import type { LeaveRequestItem } from '../api/types';

export interface LeaveCardProps {
  leave: LeaveRequestItem;
  onSelect: (leave: LeaveRequestItem) => void;
  isSelected?: boolean;
  className?: string;
  noShadow?: boolean;
  disableHoverAnimate?: boolean;
}

const LEAVE_STATUS_MAP: Record<
  string,
  { key: string; label: string; variant: 'amber' | 'lime' | 'red' | 'blue' }
> = {
  pending: { key: 'PENDING', label: 'Menunggu', variant: 'amber' },
  approved: { key: 'AKTIF', label: 'Disetujui', variant: 'lime' },
  rejected: { key: 'CANCELLED', label: 'Ditolak', variant: 'red' },
  cancelled: { key: 'CANCELLED', label: 'Dibatalkan', variant: 'red' }
};

export function LeaveCard({
  leave,
  onSelect,
  isSelected,
  className,
  noShadow = true,
  disableHoverAnimate = true
}: LeaveCardProps) {
  const staff = leave.staff;

  const statusMeta = LEAVE_STATUS_MAP[leave.status] || {
    key: 'PENDING',
    label: leave.status,
    variant: 'amber' as const
  };

  const handleContainerClick = () => {
    onSelect(leave);
  };

  const primaryAction = (
    <EntityCardPrimaryAction
      label='Lihat Detail'
      onClick={(e) => {
        e.stopPropagation();
        onSelect(leave);
      }}
      title='Lihat Detail Permohonan Izin / Cuti'
    />
  );

  return (
    <MasterEntityCard
      status={statusMeta.key}
      statusLabel={statusMeta.label}
      statusVariant={statusMeta.variant}
      isSelected={isSelected}
      name={staff?.fullName || ''}
      subtitle={
        <div className='flex items-center gap-1.5 truncate mt-0.5'>
          {staff?.roleName && (
            <span className='text-[11px] font-semibold text-primary/80 shrink-0'>
              {staff.roleName}
            </span>
          )}
          {staff?.roleName && staff?.profession && (
            <span className='text-[10px] text-muted-foreground/60'>•</span>
          )}
          <p className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1 truncate'>
            {staff?.profession || ''}
          </p>
        </div>
      }
      avatarUrl={staff?.avatarUrl}
      contentSlot={<LeaveBookingDateRoute leave={leave} />}
      primaryAction={primaryAction}
      showActions={true}
      onCardClick={handleContainerClick}
      onTitleClick={(e) => {
        e.stopPropagation();
        onSelect(leave);
      }}
      className={className}
      noShadow={noShadow}
      disableHoverAnimate={disableHoverAnimate}
    />
  );
}
