'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { LeaveKanbanColumn } from './leave-kanban-column';
import { LeaveDragOverlay } from './leave-drag-overlay';
import type { KanbanColumnDef, KanbanColumnId, UserLeaveGroup, ActiveDragState } from './types';
import type { LeaveRequestItem } from '../../api/types';

export interface LeaveKanbanBoardProps {
  leaves: LeaveRequestItem[];
  onSelectLeave: (leave: LeaveRequestItem) => void;
  selectedLeaveId?: string | null;
  onReviewLeave: (id: string, status: 'approved' | 'rejected') => void;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'pending',
    title: 'Menunggu',
    dotColor: '#F59E0B',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-400',
    description: 'Tarik ke Disetujui atau Ditolak untuk meninjau',
    acceptsDrop: false,
    canDragItems: true
  },
  {
    id: 'approved',
    title: 'Disetujui',
    dotColor: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    description: 'Permohonan izin staf telah disetujui',
    acceptsDrop: true,
    canDragItems: false
  },
  {
    id: 'rejected',
    title: 'Ditolak',
    dotColor: '#EF4444',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-700 dark:text-rose-400',
    description: 'Permohonan izin staf ditolak',
    acceptsDrop: true,
    canDragItems: false
  },
  {
    id: 'cancelled',
    title: 'Dibatalkan',
    dotColor: '#71717A',
    badgeBg: 'bg-zinc-500/15',
    badgeText: 'text-zinc-700 dark:text-zinc-400',
    description: 'Dibatalkan mandiri oleh pemohon',
    acceptsDrop: false,
    canDragItems: false
  }
];

export function LeaveKanbanBoard({
  leaves,
  onSelectLeave,
  selectedLeaveId,
  onReviewLeave
}: LeaveKanbanBoardProps) {
  // Drag physics state
  const [dragState, setDragState] = useState<ActiveDragState | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  const dragRef = useRef<ActiveDragState | null>(null);
  const lastPointerX = useRef<number>(0);
  const velocityResetTimer = useRef<NodeJS.Timeout | null>(null);

  // Group leaves per column & per user
  const columnData = useMemo(() => {
    const map = new Map<KanbanColumnId, { groups: UserLeaveGroup[]; total: number }>();

    for (const col of KANBAN_COLUMNS) {
      const colLeaves = leaves.filter((l) => l.status === col.id);
      const userGroupsMap = new Map<string, UserLeaveGroup>();

      for (const leave of colLeaves) {
        const staffKey = leave.staffId;
        const staffName = leave.staff?.fullName ?? '-';
        const staffRole = leave.staff?.profession;
        const avatarUrl = leave.staff?.avatarUrl;

        if (!userGroupsMap.has(staffKey)) {
          userGroupsMap.set(staffKey, {
            staffId: staffKey,
            staffName,
            staffRole,
            avatarUrl,
            items: []
          });
        }
        userGroupsMap.get(staffKey)!.items.push(leave);
      }

      map.set(col.id, {
        groups: Array.from(userGroupsMap.values()),
        total: colLeaves.length
      });
    }

    return map;
  }, [leaves]);

  // Initiate drag on a card
  const handleStartDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, leave: LeaveRequestItem) => {
      // Only left click on mouse
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      // Disallow drag from interactive child elements (buttons, links)
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"]');
      if (interactiveEl) {
        // If the target is the main card container, allow it; if it's an action button inside, ignore
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
        leave,
        sourceColumnId: leave.status as KanbanColumnId,
        currentColumnId: leave.status as KanbanColumnId,
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

  // Global pointer move and up listeners
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const nextX = e.clientX - dragRef.current.offsetX;
      const nextY = e.clientY - dragRef.current.offsetY;

      // Inertial velocity-based rotation tilt
      const vx = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      const clampedTilt = Math.max(-9, Math.min(9, vx * 0.48 + 2.8));
      setRotation(clampedTilt);

      if (velocityResetTimer.current) clearTimeout(velocityResetTimer.current);
      velocityResetTimer.current = setTimeout(() => {
        setRotation(2.5);
      }, 90);

      // Collision detection with column elements (2D responsive grid aware)
      const centerX = nextX + dragRef.current.width / 2;
      const centerY = nextY + dragRef.current.height / 2;
      const pointerX = e.clientX;
      const pointerY = e.clientY;

      const columnElements = document.querySelectorAll('[data-column-id]');
      let detectedColumnId: KanbanColumnId | null = null;

      columnElements.forEach((colEl) => {
        const rect = colEl.getBoundingClientRect();
        const isInX =
          (centerX >= rect.left && centerX <= rect.right) ||
          (pointerX >= rect.left && pointerX <= rect.right);
        const isInY =
          (centerY >= rect.top && centerY <= rect.bottom) ||
          (pointerY >= rect.top && pointerY <= rect.bottom);

        if (isInX && isInY) {
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
        const isFromPending = active.sourceColumnId === 'pending';
        const isTargetApproved = active.currentColumnId === 'approved';
        const isTargetRejected = active.currentColumnId === 'rejected';

        if (isFromPending && (isTargetApproved || isTargetRejected)) {
          onReviewLeave(active.leave.id, active.currentColumnId as 'approved' | 'rejected');
        } else if (isFromPending && active.currentColumnId === 'cancelled') {
          toast.info('Pembatalan pengajuan hanya dapat dilakukan mandiri oleh staf pemohon.');
        } else if (!isFromPending && active.currentColumnId !== active.sourceColumnId) {
          toast.warning(
            'Status pengajuan ini telah final dan tidak dapat diubah kembali melalui papan.'
          );
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
  }, [dragState, onReviewLeave]);

  return (
    <div className='relative flex-1 min-h-0 h-full w-full overflow-x-auto overflow-y-hidden select-none pb-2'>
      <div className='flex items-stretch gap-3.5 h-full w-max min-w-full px-0.5'>
        {KANBAN_COLUMNS.map((col) => {
          const data = columnData.get(col.id) || { groups: [], total: 0 };
          const isTarget = dragState?.currentColumnId === col.id;
          const isValidTarget =
            dragState?.sourceColumnId === 'pending' &&
            (col.id === 'approved' || col.id === 'rejected');

          return (
            <LeaveKanbanColumn
              key={col.id}
              column={col}
              groups={data.groups}
              totalLeavesCount={data.total}
              activeDragLeaveId={dragState?.leave.id}
              isTargetColumn={isTarget}
              isValidDropTarget={isValidTarget}
              onSelectLeave={onSelectLeave}
              selectedLeaveId={selectedLeaveId}
              onStartDrag={handleStartDrag}
            />
          );
        })}
      </div>

      {/* Floating Drag Overlay */}
      <LeaveDragOverlay dragState={dragState} rotationDeg={rotation} />
    </div>
  );
}
