'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { StaffScheduleCard } from '../staff-schedule-card';
import type { StaffKanbanColumnProps } from './types';

export function StaffKanbanColumn({
  column,
  staffs,
  onOpenRoster,
  onOpenDetail,
  selectedStaffId,
  className
}: StaffKanbanColumnProps) {
  return (
    <section
      data-column-id={column.id}
      aria-label={`Kolom ${column.title}`}
      className={cn(
        'flex flex-col w-[340px] shrink-0 rounded-[22px] p-3 transition-colors duration-150 select-none border border-border/70 min-h-[500px] h-full bg-muted/25 shadow-xs',
        className
      )}
    >
      {/* Column Header */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-border/40 shrink-0'>
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='size-2.5 rounded-full shrink-0 shadow-xs'
            style={{ backgroundColor: column.dotColor }}
            aria-hidden='true'
          />
          <h3 className='text-xs font-semibold text-foreground tracking-tight truncate'>
            {column.title}
          </h3>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
              column.badgeBg,
              column.badgeText
            )}
          >
            {staffs.length}
          </span>
        </div>
        <span
          className='text-[10px] text-muted-foreground/70 font-medium truncate max-w-[120px]'
          title={column.description}
        >
          {column.description}
        </span>
      </div>

      {/* Cards Scrollable Body */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden px-1 pt-3 pb-3 flex flex-col gap-3 min-h-[140px]'>
        {staffs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60 bg-muted/10'>
            <p className='text-xs font-medium text-muted-foreground'>
              Belum ada {column.title.toLowerCase()}
            </p>
            <p className='text-[11px] text-muted-foreground/70 mt-0.5'>
              Data staf pada peran ini akan muncul di sini.
            </p>
          </div>
        ) : (
          staffs.map((staff) => (
            <StaffScheduleCard
              key={staff.id}
              staff={staff}
              onOpenRoster={onOpenRoster}
              onOpenDetail={onOpenDetail}
              isSelected={selectedStaffId === staff.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
