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

  const staffTypeLabel =
    staff?.staffType === 'doctor'
      ? 'Dokter'
      : staff?.staffType === 'midwife'
        ? 'Bidan'
        : 'Staf Operasional';

  const statusMeta = LEAVE_STATUS_MAP[leave.status] || {
    key: 'PENDING',
    label: leave.status,
    variant: 'amber' as const
  };

  const initials = React.useMemo(() => {
    const raw = (staff?.fullName || '').replace(/^(dr|drg|prof)\.\s*/i, '').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'S').toUpperCase();
  }, [staff?.fullName]);

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
      name={staff?.fullName || 'Staf Klinik'}
      subtitle={
        <p className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-0.5 truncate'>
          {staff?.profession || staffTypeLabel}
        </p>
      }
      avatarUrl={staff?.avatarUrl}
      initials={initials}
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
