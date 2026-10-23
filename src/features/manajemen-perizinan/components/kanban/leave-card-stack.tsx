'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LeaveCard } from '../leave-card';
import type { LeaveRequestItem } from '../../api/types';
import type { UserLeaveGroup } from './types';
import { cn } from '@/lib/utils';

export interface LeaveCardStackProps {
  group: UserLeaveGroup;
  onSelectLeave: (leave: LeaveRequestItem) => void;
  selectedLeaveId?: string | null;
  onStartDrag?: (e: React.PointerEvent<HTMLDivElement>, leave: LeaveRequestItem) => void;
  activeDragLeaveId?: string | null;
  canDrag?: boolean;
}

export function LeaveCardStack({
  group,
  onSelectLeave,
  selectedLeaveId,
  onStartDrag,
  activeDragLeaveId,
  canDrag = false
}: LeaveCardStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = group.items.length;

  // Single card mode: no stacking overhead
  if (itemCount === 1) {
    const singleLeave = group.items[0];
    const isDragging = activeDragLeaveId === singleLeave.id;

    if (isDragging) {
      return (
        <div
          data-card-placeholder-id={singleLeave.id}
          className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5 transition-all duration-200'
        />
      );
    }

    return (
      <div
        data-card-wrapper-id={singleLeave.id}
        onPointerDown={canDrag ? (e) => onStartDrag?.(e, singleLeave) : undefined}
        className={cn('w-full px-1', canDrag && 'cursor-grab active:cursor-grabbing')}
      >
        <LeaveCard
          leave={singleLeave}
          onSelect={onSelectLeave}
          isSelected={selectedLeaveId === singleLeave.id}
          noShadow={true}
          disableHoverAnimate={true}
        />
      </div>
    );
  }

  // Expanded stack mode: reveals all requests of this user vertically
  if (isExpanded) {
    return (
      <div className='flex flex-col gap-2 p-2.5 rounded-[24px] bg-muted/40 border border-primary/20 mx-0.5'>
        {/* Expanded Header Bar */}
        <div className='flex items-center justify-between px-1.5 py-1 select-none'>
          <div className='flex items-center gap-2 min-w-0'>
            <div className='flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold'>
              {itemCount}
            </div>
            <div className='min-w-0'>
              <h4 className='text-xs font-semibold text-foreground truncate'>{group.staffName}</h4>
              <p className='text-[10px] text-muted-foreground truncate'>
                {itemCount} permohonan aktif
              </p>
            </div>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setIsExpanded(false)}
            className='h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground'
            title='Ciutkan kartu tumpukan'
          >
            <span>Ciutkan</span>
            <Icons.chevronUp className='size-3' />
          </Button>
        </div>

        {/* Cards inside stack */}
        <div className='flex flex-col gap-2'>
          {group.items.map((leave) => {
            const isDragging = activeDragLeaveId === leave.id;
            if (isDragging) {
              return (
                <div
                  key={leave.id}
                  data-card-placeholder-id={leave.id}
                  className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5'
                />
              );
            }

            return (
              <div
                key={leave.id}
                data-card-wrapper-id={leave.id}
                onPointerDown={canDrag ? (e) => onStartDrag?.(e, leave) : undefined}
                className={cn('w-full px-0.5', canDrag && 'cursor-grab active:cursor-grabbing')}
              >
                <LeaveCard
                  leave={leave}
                  onSelect={onSelectLeave}
                  isSelected={selectedLeaveId === leave.id}
                  noShadow={true}
                  disableHoverAnimate={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Collapsed stack mode: Top card in front, with stacked backdrop plates behind it
  const topLeave = group.items[0];
  const isTopDragging = activeDragLeaveId === topLeave.id;

  if (isTopDragging) {
    return (
      <div
        data-card-placeholder-id={topLeave.id}
        className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5'
      />
    );
  }

  return (
    <div className='relative group/stack pt-1 pb-3 px-1 w-full'>
      {/* Background Plate Layer 2 (Bottom-most back layer) */}
      <div
        className='absolute inset-x-3 top-3 bottom-0 rounded-[22px] bg-card/60 dark:bg-card/40 border border-border/40 pointer-events-none translate-y-3 scale-[0.94] opacity-50'
        aria-hidden='true'
      />

      {/* Background Plate Layer 1 (Middle layer) */}
      <div
        className='absolute inset-x-2 top-2 bottom-1 rounded-[22px] bg-card/80 dark:bg-card/60 border border-border/60 pointer-events-none translate-y-1.5 scale-[0.97] opacity-75'
        aria-hidden='true'
      />

      {/* Foreground Top Card */}
      <div
        data-card-wrapper-id={topLeave.id}
        onPointerDown={canDrag ? (e) => onStartDrag?.(e, topLeave) : undefined}
        className={cn('relative z-10 w-full', canDrag && 'cursor-grab active:cursor-grabbing')}
      >
        <div className='relative'>
          <LeaveCard
            leave={topLeave}
            onSelect={onSelectLeave}
            isSelected={selectedLeaveId === topLeave.id}
            noShadow={true}
            disableHoverAnimate={true}
          />

          {/* Floating Stacking Pill Badge */}
          <div className='absolute -top-2.5 right-3 z-30'>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background/95 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary/10 text-[10.5px] font-semibold transition-colors cursor-pointer'
              title='Klik untuk membuka seluruh tumpukan permohonan staf ini'
            >
              <Icons.layers className='size-3 text-primary' />
              <span>+{itemCount - 1} Lainnya • Buka</span>
              <Icons.chevronDown className='size-3 text-primary' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
