'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StaffMember } from '../api/staff-management.api';
import {
  StaffRoleBadge,
  StaffStatusBadgeItem,
  StaffIdentitySection,
  StaffQuickRosterButton
} from './staff-card-atoms';

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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = () => {
    onOpenDetail?.(staff);
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
        'group relative overflow-hidden rounded-[24px] border border-border font-sans flex flex-col justify-between select-none transition-all duration-200 hover:border-primary/60 hover:shadow-md p-5 sm:p-6 min-h-[190px] text-card-foreground cursor-pointer',
        isSelected &&
          'ring-2 ring-primary/40 ring-offset-2 ring-offset-background border-primary/50 shadow-md',
        className
      )}
    >
      {/* 1. Header: Role Badge, Status Badge & Quick Shift Roster Button */}
      <div className='flex items-center justify-between gap-3 relative z-20'>
        <div className='flex items-center gap-2'>
          <StaffRoleBadge staffType={staff.staffType} />
          <StaffStatusBadgeItem isActive={staff.isActive} />
        </div>

        {onOpenRoster && (
          <StaffQuickRosterButton
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoster(staff);
            }}
          />
        )}
      </div>

      {/* 2. Core Identity: Name & Email strictly */}
      <StaffIdentitySection fullName={staff.fullName} email={staff.email} />

      {/* 3. Footer Action: Detail Staf Modal trigger */}
      <div className='flex items-center justify-end gap-2 pt-3 mt-4 border-t border-border/40 relative z-20'>
        <Button
          type='button'
          variant='default'
          size='card-action'
          shape='pill'
          withTrailingCircleIcon
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(staff);
          }}
          className='font-bold'
        >
          Detail Staf
        </Button>
      </div>
    </div>
  );
}
