'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReplacementCard } from '../replacement-card';
import type { ReplacementOpportunityItem } from '../../api/types';
import type { DateReplacementGroup } from './types';

export interface ReplacementCardStackProps {
  group: DateReplacementGroup;
  onSelectOpportunity: (item: ReplacementOpportunityItem) => void;
  selectedOpportunityId?: string | null;
  onStartDrag?: (e: React.PointerEvent<HTMLDivElement>, item: ReplacementOpportunityItem) => void;
  activeDragOpportunityId?: string | null;
  canDrag?: boolean;
}

export function ReplacementCardStack({
  group,
  onSelectOpportunity,
  selectedOpportunityId,
  onStartDrag,
  activeDragOpportunityId,
  canDrag = false
}: ReplacementCardStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = group.items.length;

  // Single card mode: no stacking overhead
  if (itemCount === 1) {
    const singleItem = group.items[0];
    const isDragging = activeDragOpportunityId === singleItem.id;

    if (isDragging) {
      return (
        <div
          data-card-placeholder-id={singleItem.id}
          className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5 transition-all duration-200'
        />
      );
    }

    return (
      <div
        data-card-wrapper-id={singleItem.id}
        onPointerDown={canDrag ? (e) => onStartDrag?.(e, singleItem) : undefined}
        className={cn('w-full px-1', canDrag && 'cursor-grab active:cursor-grabbing')}
      >
        <ReplacementCard
          opportunity={singleItem}
          onSelect={onSelectOpportunity}
          isSelected={selectedOpportunityId === singleItem.id}
          noShadow={true}
          disableHoverAnimate={true}
        />
      </div>
    );
  }

  // Expanded stack mode
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
              <h4 className='text-xs font-semibold text-foreground truncate'>{group.dateLabel}</h4>
              <p className='text-[10px] text-muted-foreground truncate'>
                {itemCount} sesi dinas pengganti
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
          {group.items.map((item) => {
            const isDragging = activeDragOpportunityId === item.id;
            if (isDragging) {
              return (
                <div
                  key={item.id}
                  data-card-placeholder-id={item.id}
                  className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5'
                />
              );
            }

            return (
              <div
                key={item.id}
                data-card-wrapper-id={item.id}
                onPointerDown={canDrag ? (e) => onStartDrag?.(e, item) : undefined}
                className={cn('w-full px-0.5', canDrag && 'cursor-grab active:cursor-grabbing')}
              >
                <ReplacementCard
                  opportunity={item}
                  onSelect={onSelectOpportunity}
                  isSelected={selectedOpportunityId === item.id}
                  noShadow={true}
                  disableHoverAnimate={true}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Centered Collapse Pill */}
        <div className='flex justify-center pt-0.5 select-none'>
          <button
            type='button'
            onClick={() => setIsExpanded(false)}
            className='inline-flex items-center px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10.5px] font-medium transition-colors cursor-pointer select-none'
            title='Ciutkan kartu tumpukan'
          >
            Ciutkan
          </button>
        </div>
      </div>
    );
  }

  // Collapsed stack mode
  const topItem = group.items[0];
  const isTopDragging = activeDragOpportunityId === topItem.id;

  if (isTopDragging) {
    return (
      <div
        data-card-placeholder-id={topItem.id}
        className='w-full h-[180px] rounded-[22px] border-2 border-dashed border-primary/40 bg-primary/5'
      />
    );
  }

  return (
    <div className='relative group/stack pt-1 pb-3 px-1 w-full'>
      {/* Background Plate Layer 2 */}
      <div
        className='absolute inset-x-3 top-3 bottom-0 rounded-[22px] bg-card/60 dark:bg-card/40 border border-border/40 pointer-events-none translate-y-3 scale-[0.94] opacity-50'
        aria-hidden='true'
      />

      {/* Background Plate Layer 1 */}
      <div
        className='absolute inset-x-2 top-2 bottom-1 rounded-[22px] bg-card/80 dark:bg-card/60 border border-border/60 pointer-events-none translate-y-1.5 scale-[0.97] opacity-75'
        aria-hidden='true'
      />

      {/* Foreground Top Card */}
      <div
        data-card-wrapper-id={topItem.id}
        onPointerDown={canDrag ? (e) => onStartDrag?.(e, topItem) : undefined}
        className={cn('relative z-10 w-full', canDrag && 'cursor-grab active:cursor-grabbing')}
      >
        <div className='relative'>
          <ReplacementCard
            opportunity={topItem}
            onSelect={onSelectOpportunity}
            isSelected={selectedOpportunityId === topItem.id}
            noShadow={true}
            disableHoverAnimate={true}
          />

          {/* Floating Stacking Pill Badge */}
          <div className='absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 select-none'>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className='inline-flex items-center px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[10.5px] font-medium transition-colors cursor-pointer whitespace-nowrap'
              title={`Lihat ${itemCount - 1} lainnya`}
            >
              Lihat {itemCount - 1} lainnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
