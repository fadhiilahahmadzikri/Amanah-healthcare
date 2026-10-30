'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { StaffKanbanColumn } from './staff-kanban-column';
import type { StaffKanbanBoardProps, StaffKanbanColumnDef } from './types';

export function StaffKanbanBoard({
  staffs,
  onOpenRoster,
  onOpenDetail,
  selectedStaffId,
  className
}: StaffKanbanBoardProps) {
  // Dynamically derive columns from staff roles
  const { columns, staffByRole } = useMemo(() => {
    const roleMap = new Map<string, StaffKanbanColumnDef>();
    const staffMap = new Map<string, typeof staffs>();

    for (const staff of staffs) {
      const roleKey = staff.roleId || staff.roleCode || 'staf';
      const roleName = staff.roleName || staff.profession || staff.roleCode || 'Staf';

      if (!roleMap.has(roleKey)) {
        roleMap.set(roleKey, {
          id: roleKey,
          title: roleName,
          roleCode: staff.roleCode ?? undefined,
          dotColor: staff.isClinical ? '#0D9488' : '#3B82F6',
          badgeBg: staff.isClinical
            ? 'bg-teal-500/10 dark:bg-teal-500/20'
            : 'bg-blue-500/10 dark:bg-blue-500/20',
          badgeText: staff.isClinical
            ? 'text-teal-700 dark:text-teal-300'
            : 'text-blue-700 dark:text-blue-300',
          description: staff.isClinical
            ? 'Tenaga medis & pelayanan klinis'
            : 'Tenaga non-klinis & operasional klinik'
        });
        staffMap.set(roleKey, []);
      }

      staffMap.get(roleKey)!.push(staff);
    }

    const columnList = Array.from(roleMap.values());
    return { columns: columnList, staffByRole: staffMap };
  }, [staffs]);

  if (columns.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center p-8 text-muted-foreground border border-dashed rounded-lg'>
        Belum ada staf yang terdaftar dalam sistem
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden gap-4 pb-4 select-none scrollbar-thin',
        className
      )}
    >
      {columns.map((column) => {
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
