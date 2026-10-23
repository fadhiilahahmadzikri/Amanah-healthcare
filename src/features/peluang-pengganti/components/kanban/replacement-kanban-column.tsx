'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ReplacementCardStack } from './replacement-card-stack';
import type { KanbanColumnDef, DateReplacementGroup } from './types';
import type { ReplacementOpportunityItem } from '../../api/types';

export interface ReplacementKanbanColumnProps {
  column: KanbanColumnDef;
  groups: DateReplacementGroup[];
  totalOpportunitiesCount: number;
  activeDragOpportunityId?: string | null;
  isTargetColumn?: boolean;
  isValidDropTarget?: boolean;
  onSelectOpportunity: (item: ReplacementOpportunityItem) => void;
  selectedOpportunityId?: string | null;
  onStartDrag?: (e: React.PointerEvent<HTMLDivElement>, item: ReplacementOpportunityItem) => void;
}

export function ReplacementKanbanColumn({
  column,
  groups,
  totalOpportunitiesCount,
  activeDragOpportunityId,
  isTargetColumn = false,
  isValidDropTarget = false,
  onSelectOpportunity,
  selectedOpportunityId,
  onStartDrag
}: ReplacementKanbanColumnProps) {
  return (
    <section
      data-column-id={column.id}
      className={cn(
        'flex flex-col flex-1 min-w-[260px] rounded-[22px] p-3 transition-colors duration-150 select-none border border-border/70 min-h-[480px] h-full bg-muted/25',
        isTargetColumn && isValidDropTarget && 'bg-primary/10 ring-2 ring-primary border-primary',
        isTargetColumn &&
          !isValidDropTarget &&
          'bg-destructive/5 ring-1 ring-destructive/40 border-destructive/30'
      )}
    >
      {/* Column Header */}
      <div className='flex items-center justify-between px-2 pt-1 pb-3 border-b border-border/40'>
        <div className='flex items-center gap-2 min-w-0'>
          <span
            className='size-2.5 rounded-full shrink-0 shadow-xs'
            style={{ backgroundColor: column.dotColor }}
          />
          <h3 className='text-xs font-semibold text-foreground tracking-tight truncate'>
            {column.title}
          </h3>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold',
              column.badgeBg,
              column.badgeText
            )}
          >
            {totalOpportunitiesCount}
          </span>
        </div>

        {column.canDragItems && (
          <span className='text-[10px] text-muted-foreground/80 font-medium hidden sm:inline-block'>
            Bisa Ditarik
          </span>
        )}
      </div>

      {/* Column Cards Container */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden px-1.5 pt-3 pb-3 flex flex-col gap-3.5 min-h-[140px]'>
        {groups.map((group) => (
          <ReplacementCardStack
            key={group.dateKey}
            group={group}
            onSelectOpportunity={onSelectOpportunity}
            selectedOpportunityId={selectedOpportunityId}
            onStartDrag={onStartDrag}
            activeDragOpportunityId={activeDragOpportunityId}
            canDrag={column.canDragItems}
          />
        ))}

        {groups.length === 0 && (
          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center p-4 rounded-[16px] border border-dashed border-border/60 text-center min-h-[160px]',
              isTargetColumn && isValidDropTarget
                ? 'border-primary bg-primary/5 text-primary'
                : 'text-muted-foreground'
            )}
          >
            <p className='text-xs font-medium'>
              {isTargetColumn && isValidDropTarget
                ? `Lepas untuk ${column.title.toLowerCase()}`
                : `Belum ada sesi ${column.title.toLowerCase()}`}
            </p>
            <p className='text-[10.5px] text-muted-foreground/70 mt-1 max-w-[200px]'>
              {column.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
