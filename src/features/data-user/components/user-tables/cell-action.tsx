'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { UserItem } from '../../api/types';
import type { UserTableMeta } from '../../model/useUserTable';
import { useUpdateUserStatusMutation } from '../../api/mutations';

export interface CellActionProps {
  data: UserItem;
  table?: Table<UserItem>;
}

export function CellAction({ data, table }: CellActionProps) {
  const meta = table?.options.meta as UserTableMeta | undefined;
  const updateStatusMutation = useUpdateUserStatusMutation();

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = data.status === 'active' ? 'inactive' : 'active';
    updateStatusMutation.mutate({ id: data.id, status: nextStatus });
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    meta?.onViewDetail?.(data);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    meta?.onEdit?.(data);
  };

  const handlePurge = (e: React.MouseEvent) => {
    e.stopPropagation();
    meta?.onPurge?.(data);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant='ghost'
          size='icon'
          className='size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer'
        >
          <span className='sr-only'>Buka menu aksi</span>
          <Icons.moreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem onClick={handleViewDetail} className='gap-2 cursor-pointer'>
          <Icons.info className='size-4 text-primary' />
          <span>Detail Akun</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleEdit} className='gap-2 cursor-pointer'>
          <Icons.edit className='size-4 text-primary' />
          <span>Edit Akun</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleToggleStatus}
          disabled={updateStatusMutation.isPending}
          className='gap-2 cursor-pointer'
        >
          {data.status === 'active' ? (
            <>
              <Icons.close className='size-4 text-amber-600' />
              <span>Nonaktifkan Akun</span>
            </>
          ) : (
            <>
              <Icons.check className='size-4 text-emerald-600' />
              <span>Aktifkan Akun</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handlePurge}
          className='gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer'
        >
          <Icons.trash className='size-4' />
          <span>Hapus Permanen</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
