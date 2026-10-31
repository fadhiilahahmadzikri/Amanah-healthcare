'use client';

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { UserItem } from '../../api/types';
import { useBulkUpdateUserStatusMutation } from '../../api/mutations';

export interface UserBulkActionsProps {
  table: Table<UserItem>;
  onBulkPurge: (users: UserItem[]) => void;
}

export function UserBulkActions({ table, onBulkPurge }: UserBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().flatRows;
  const selectedUsers = selectedRows.map((r) => r.original);
  const selectedIds = selectedUsers.map((u) => u.id);
  const bulkStatusMutation = useBulkUpdateUserStatusMutation();

  if (selectedRows.length === 0) return null;

  const handleBulkActivate = () => {
    bulkStatusMutation.mutate({ userIds: selectedIds, status: 'active' });
    table.resetRowSelection();
  };

  const handleBulkDeactivate = () => {
    bulkStatusMutation.mutate({ userIds: selectedIds, status: 'inactive' });
    table.resetRowSelection();
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        shape='pill'
        disabled={bulkStatusMutation.isPending}
        onClick={handleBulkActivate}
        className='h-7 px-2.5 text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 cursor-pointer shadow-xs'
      >
        <Icons.check className='size-3.5' />
        <span>Aktifkan ({selectedRows.length})</span>
      </Button>

      <Button
        variant='outline'
        size='sm'
        shape='pill'
        disabled={bulkStatusMutation.isPending}
        onClick={handleBulkDeactivate}
        className='h-7 px-2.5 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 cursor-pointer shadow-xs'
      >
        <Icons.close className='size-3.5' />
        <span>Nonaktifkan ({selectedRows.length})</span>
      </Button>

      <Button
        variant='destructive'
        size='sm'
        shape='pill'
        onClick={() => onBulkPurge(selectedUsers)}
        className='h-7 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-transform'
      >
        <Icons.trash className='size-3.5' />
        <span>Hapus Permanen ({selectedRows.length})</span>
      </Button>
    </div>
  );
}
