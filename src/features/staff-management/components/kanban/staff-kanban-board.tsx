'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { STAFF_ROLE_KANBAN_COLUMNS } from '../../constants/staff.constants';
import { StaffKanbanColumn } from './staff-kanban-column';
import type { StaffKanbanBoardProps } from './types';

export function StaffKanbanBoard({
  staffs,
  onOpenRoster,
  onOpenDetail,
  selectedStaffId,
  className
}: StaffKanbanBoardProps) {
  // Group staffs per role column
  const staffByRole = useMemo(() => {
    const map = new Map<string, typeof staffs>();
    for (const col of STAFF_ROLE_KANBAN_COLUMNS) {
      map.set(col.id, []);
    }

    for (const staff of staffs) {
      const roleKey = staff.staffType;
      if (!map.has(roleKey)) {
        map.set(roleKey, []);
      }
      map.get(roleKey)!.push(staff);
    }

    return map;
  }, [staffs]);

  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden gap-4 pb-4 select-none scrollbar-thin',
        className
      )}
    >
      {STAFF_ROLE_KANBAN_COLUMNS.map((column) => {
        const columnStaffs = staffByRole.get(column.id) || [];
        return (
          <StaffKanbanColumn
            key={column.id}
            column={column}
            staffs={columnStaffs}
            onOpenRoster={onOpenRoster}
            onOpenDetail={onOpenDetail}
            selectedStaffId={selectedStaffId}
          />
        );
      })}
    </div>
  );
}
