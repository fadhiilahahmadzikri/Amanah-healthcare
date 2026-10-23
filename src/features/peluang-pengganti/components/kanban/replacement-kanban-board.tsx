'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { formatClinicDate } from '@/lib/date-format';
import { REPLACEMENT_STATUS_CONFIG } from '../../constants/replacement.constants';
import { ReplacementKanbanColumn } from './replacement-kanban-column';
import { ReplacementDragOverlay } from './replacement-drag-overlay';
import type {
  KanbanColumnDef,
  KanbanColumnId,
  DateReplacementGroup,
  ActiveDragState
} from './types';
import type { ReplacementOpportunityItem } from '../../api/types';

export interface ReplacementKanbanBoardProps {
  opportunities: ReplacementOpportunityItem[];
  onSelectOpportunity: (item: ReplacementOpportunityItem) => void;
  selectedOpportunityId?: string | null;
  onTriggerAssign: (item: ReplacementOpportunityItem) => void;
  onTriggerCancel: (id: string) => void;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'open',
    title: REPLACEMENT_STATUS_CONFIG.open.label,
    dotColor: REPLACEMENT_STATUS_CONFIG.open.dotColor,
    badgeBg: REPLACEMENT_STATUS_CONFIG.open.badgeBg,
    badgeText: REPLACEMENT_STATUS_CONFIG.open.badgeText,
    description: REPLACEMENT_STATUS_CONFIG.open.description,
    acceptsDrop: false,
    canDragItems: true
  },
  {
    id: 'claimed',
    title: REPLACEMENT_STATUS_CONFIG.claimed.label,
    dotColor: REPLACEMENT_STATUS_CONFIG.claimed.dotColor,
    badgeBg: REPLACEMENT_STATUS_CONFIG.claimed.badgeBg,
    badgeText: REPLACEMENT_STATUS_CONFIG.claimed.badgeText,
    description: 'Tarik sesi Terbuka ke sini untuk menugaskan staf pengganti',
    acceptsDrop: true,
    canDragItems: true
  },
  {
    id: 'completed',
    title: REPLACEMENT_STATUS_CONFIG.completed.label,
    dotColor: REPLACEMENT_STATUS_CONFIG.completed.dotColor,
    badgeBg: REPLACEMENT_STATUS_CONFIG.completed.badgeBg,
    badgeText: REPLACEMENT_STATUS_CONFIG.completed.badgeText,
    description: REPLACEMENT_STATUS_CONFIG.completed.description,
    acceptsDrop: false,
    canDragItems: false
  },
  {
    id: 'cancelled',
    title: REPLACEMENT_STATUS_CONFIG.cancelled.label,
    dotColor: REPLACEMENT_STATUS_CONFIG.cancelled.dotColor,
    badgeBg: REPLACEMENT_STATUS_CONFIG.cancelled.badgeBg,
    badgeText: REPLACEMENT_STATUS_CONFIG.cancelled.badgeText,
    description: 'Tarik ke sini untuk membatalkan peluang dinas pengganti',
    acceptsDrop: true,
    canDragItems: false
  }
];

export function ReplacementKanbanBoard({
  opportunities,
  onSelectOpportunity,
  selectedOpportunityId,
  onTriggerAssign,
  onTriggerCancel
}: ReplacementKanbanBoardProps) {
  // Drag physics state
  const [dragState, setDragState] = useState<ActiveDragState | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  const dragRef = useRef<ActiveDragState | null>(null);
  const lastPointerX = useRef<number>(0);
  const velocityResetTimer = useRef<NodeJS.Timeout | null>(null);

  // Group opportunities per column & per workDate
  const columnData = useMemo(() => {
    const map = new Map<KanbanColumnId, { groups: DateReplacementGroup[]; total: number }>();

    for (const col of KANBAN_COLUMNS) {
      const colItems = opportunities.filter((o) => o.status === col.id);
      const dateGroupsMap = new Map<string, DateReplacementGroup>();

      for (const item of colItems) {
        const dateKey = item.workDate;
        const dateLabel = formatClinicDate(item.workDate, {
          style: 'human_full'
        });

        if (!dateGroupsMap.has(dateKey)) {
          dateGroupsMap.set(dateKey, {
            dateKey,
            dateLabel,
            items: []
          });
        }
        dateGroupsMap.get(dateKey)!.items.push(item);
      }

      map.set(col.id, {
        groups: Array.from(dateGroupsMap.values()),
        total: colItems.length
      });
    }

    return map;
  }, [opportunities]);

  // Initiate drag on a card
  const handleStartDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, opportunity: ReplacementOpportunityItem) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        if (
          !target.classList.contains('group') &&
          (target.tagName === 'BUTTON' || target.closest('button'))
        ) {
          return;
        }
      }

      const cardEl = e.currentTarget;
      const rect = cardEl.getBoundingClientRect();

      const initialDrag: ActiveDragState = {
        opportunity,
        sourceColumnId: opportunity.status,
        currentColumnId: opportunity.status,
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      };

      dragRef.current = initialDrag;
      lastPointerX.current = e.clientX;
      setDragState(initialDrag);
      setRotation(3.5);
    },
    []
  );

  // Pointer move & drop
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const nextX = e.clientX - dragRef.current.offsetX;
      const nextY = e.clientY - dragRef.current.offsetY;

      const vx = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      const clampedTilt = Math.max(-9, Math.min(9, vx * 0.48 + 2.8));
      setRotation(clampedTilt);

      if (velocityResetTimer.current) clearTimeout(velocityResetTimer.current);
      velocityResetTimer.current = setTimeout(() => {
        setRotation(2.5);
      }, 90);

      const centerX = nextX + dragRef.current.width / 2;
      const centerY = nextY + dragRef.current.height / 2;

      const columnElements = document.querySelectorAll('[data-column-id]');
      let detectedColumnId: KanbanColumnId | null = null;

      columnElements.forEach((colEl) => {
        const rect = colEl.getBoundingClientRect();
        if (
          centerX >= rect.left &&
          centerX <= rect.right &&
          centerY >= rect.top - 60 &&
          centerY <= rect.bottom + 60
        ) {
          detectedColumnId = colEl.getAttribute('data-column-id') as KanbanColumnId;
        }
      });

      const updated: ActiveDragState = {
        ...dragRef.current,
        x: nextX,
        y: nextY,
        currentColumnId: detectedColumnId
      };

      dragRef.current = updated;
      setDragState(updated);
    };

    const handlePointerUp = () => {
      if (velocityResetTimer.current) clearTimeout(velocityResetTimer.current);

      const active = dragRef.current;
      if (active && active.currentColumnId) {
        const isFromOpen = active.sourceColumnId === 'open';
        const isFromClaimed = active.sourceColumnId === 'claimed';
        const isTargetClaimed = active.currentColumnId === 'claimed';
        const isTargetCancelled = active.currentColumnId === 'cancelled';

        if (isFromOpen && isTargetClaimed) {
          onTriggerAssign(active.opportunity);
        } else if ((isFromOpen || isFromClaimed) && isTargetCancelled) {
          onTriggerCancel(active.opportunity.id);
        } else if (active.currentColumnId === 'completed') {
          toast.info(
            'Status Selesai otomatis terverifikasi melalui checkout presensi staf pengganti.'
          );
        } else if (active.currentColumnId !== active.sourceColumnId) {
          toast.warning('Perpindahan status ini tidak diizinkan melalui papan.');
        }
      }

      dragRef.current = null;
      setDragState(null);
      setRotation(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, onTriggerAssign, onTriggerCancel]);

  return (
    <div className='relative flex-1 min-h-0 h-full w-full overflow-x-auto overflow-y-hidden select-none pb-2'>
      <div className='flex items-stretch gap-3.5 h-full w-full min-w-[1080px] px-0.5'>
        {KANBAN_COLUMNS.map((col) => {
          const data = columnData.get(col.id) || { groups: [], total: 0 };
          const isTarget = dragState?.currentColumnId === col.id;
          const isValidTarget =
            (dragState?.sourceColumnId === 'open' &&
              (col.id === 'claimed' || col.id === 'cancelled')) ||
            (dragState?.sourceColumnId === 'claimed' && col.id === 'cancelled');

          return (
            <ReplacementKanbanColumn
              key={col.id}
              column={col}
              groups={data.groups}
              totalOpportunitiesCount={data.total}
              activeDragOpportunityId={dragState?.opportunity.id}
              isTargetColumn={isTarget}
              isValidDropTarget={isValidTarget}
              onSelectOpportunity={onSelectOpportunity}
              selectedOpportunityId={selectedOpportunityId}
              onStartDrag={handleStartDrag}
            />
          );
        })}
      </div>

      <ReplacementDragOverlay dragState={dragState} rotationDeg={rotation} />
    </div>
  );
}
