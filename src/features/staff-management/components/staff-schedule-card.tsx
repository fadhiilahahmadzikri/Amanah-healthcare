'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StaffMember } from '../api/staff-management.api';

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
  const cardRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary) 5%, transparent) 45%, transparent 80%), var(--card)'
      }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 hover:border-primary/60 hover:shadow-md p-5 sm:p-6 min-h-[190px] text-card-foreground',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        className
      )}
    >
      {/* 1. Header: Role Badge, Status Badge & Quick Shift Roster Button */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <div className='flex items-center gap-2'>
          <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium'>
            Staf Operasional
          </Badge>
          <StatusBadge
            status={staff.isActive ? 'Buka' : 'Tutup'}
            label={staff.isActive ? 'Aktif' : 'Non-Aktif'}
            variant='pill'
            size='sm'
          />
        </div>

        {onOpenRoster && (
          <Button
            variant='outline'
            size='icon'
            shape='pill'
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoster(staff);
            }}
            title='Atur Shift Roster Mingguan'
            aria-label='Atur Shift Roster Mingguan'
            className='size-8 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80'
          >
            <Icons.calendar className='size-3.5' />
          </Button>
        )}
      </div>

      {/* 2. Core Identity: Name & Email strictly */}
      <div className='flex flex-col relative z-20 mt-3'>
        <h3
          title={staff.fullName}
          className='text-[17px] sm:text-[18px] font-bold text-card-foreground tracking-tight leading-snug line-clamp-1'
        >
          {staff.fullName}
        </h3>

        <p className='text-xs sm:text-[13px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-1 flex items-center gap-1.5'>
          <Icons.mail className='size-3 shrink-0 text-muted-foreground/70' />
          <span>{staff.email || '-'}</span>
        </p>
      </div>

      {/* 3. Footer Action: Detail Staf Modal trigger */}
      <div className='flex items-center justify-end gap-2 pt-3 mt-4 border-t border-border/40 relative z-20'>
        <Button
          type='button'
          variant='default'
          size='card-action'
          shape='pill'
          withTrailingCircleIcon
          onClick={() => onOpenDetail?.(staff)}
          className='font-bold'
        >
          Detail Staf
        </Button>
      </div>
    </div>
  );
}
