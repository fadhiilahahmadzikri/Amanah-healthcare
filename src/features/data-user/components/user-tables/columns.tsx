'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { UserItem } from '../../api/types';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { useUpdateUserStatusMutation } from '../../api/mutations';

function StatusSwitchCell({ user }: { user: UserItem }) {
  const mutation = useUpdateUserStatusMutation();
  const isActive = user.status === 'active';

  const handleToggle = (checked: boolean) => {
    mutation.mutate({
      id: user.id,
      status: checked ? 'active' : 'inactive'
    });
  };

  return (
    <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={isActive}
        disabled={mutation.isPending}
        onCheckedChange={handleToggle}
        aria-label={`Ubah status ${user.name}`}
      />
      <span className='text-xs font-medium'>
        {isActive ? (
          <span className='text-emerald-600 dark:text-emerald-400'>Aktif</span>
        ) : (
          <span className='text-muted-foreground'>Nonaktif</span>
        )}
      </span>
    </div>
  );
}

export function getUserColumns(): ColumnDef<UserItem>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Pilih semua baris'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Pilih baris pengguna'
          className='translate-y-[2px]'
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Pengguna' />,
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div className='flex items-center gap-2.5 py-1'>
            <Avatar className='size-8 border border-border/50 shrink-0'>
              {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
              <AvatarFallback className='text-xs font-semibold bg-primary/10 text-primary'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-xs sm:text-sm text-foreground truncate'>
              {u.name}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Email Akun' />,
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground font-mono truncate block max-w-[220px]'>
          {row.original.email}
        </span>
      ),
      enableSorting: true
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'No. Telepon',
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground font-mono'>{row.original.phone || '-'}</span>
      ),
      enableSorting: false
    },
    {
      id: 'roles',
      header: 'Peran Terdaftar',
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        if (roles.length === 0) {
          return (
            <Badge variant='outline' className='text-[10px] text-muted-foreground'>
              Tanpa Peran
            </Badge>
          );
        }

        return (
          <div className='flex items-center gap-1.5 flex-wrap'>
            {roles.map((r) => (
              <Badge key={r.id} variant='outline' className='text-[10px] px-1.5 py-0 font-medium'>
                {r.name}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: 'audience',
      accessorKey: 'primaryAudience',
      header: 'Audience',
      cell: ({ row }) => {
        const aud = row.original.primaryAudience;
        return (
          <Badge
            variant='outline'
            className={
              aud === 'external'
                ? 'text-[10px] px-2 py-0 border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300'
                : 'text-[10px] px-2 py-0 text-muted-foreground'
            }
          >
            {aud === 'external' ? 'Eksternal' : 'Internal'}
          </Badge>
        );
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status Akun',
      cell: ({ row }) => <StatusSwitchCell user={row.original} />
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Terdaftar',
      cell: ({ row }) => {
        const raw = row.original.createdAt;
        if (!raw) return '-';
        const date = new Date(raw);
        return (
          <span className='text-xs text-muted-foreground font-mono'>
            {date.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row, table }) => <CellAction data={row.original} table={table} />,
      enableSorting: false,
      size: 48
    }
  ];
}
