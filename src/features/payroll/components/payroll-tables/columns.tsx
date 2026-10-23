'use client';

import React from 'react';
import Image from 'next/image';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { StaffRoleBadge } from '@/features/staff-management';
import { formatCurrency } from '../../utils/currency';
import { CellAction } from './cell-action';
import type { PayrollSummaryItem } from '../../api/types';

export function getPayrollColumns(): ColumnDef<PayrollSummaryItem>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='flex items-center pl-1.5'>
          <Checkbox
            aria-label='Pilih semua staf'
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center pl-1.5'>
          <Checkbox
            aria-label={`Pilih ${row.original.fullName}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Karyawan / Staf' />
      ),
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className='flex items-center gap-2.5 py-0.5'>
            <Avatar className='size-8 rounded-lg shrink-0'>
              <AvatarImage
                src={staff.avatarUrl || DEFAULT_AVATAR_PATH}
                alt={staff.fullName}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={staff.fullName}
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full rounded-lg object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-xs text-foreground block truncate'>
              {staff.fullName}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'staffCode',
      accessorKey: 'staffCode',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='NIP / Kode' />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground font-mono tabular-nums'>
          {row.original.staffCode || '-'}
        </span>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'staffType',
      accessorKey: 'staffType',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Kategori' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center'>
          <StaffRoleBadge roleCode={row.original.staffType} staffType={row.original.staffType} />
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'positionTitle',
      accessorKey: 'positionTitle',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Jabatan / Posisi' />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground truncate block max-w-[140px]'>
          {row.original.positionTitle || '-'}
        </span>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'baseHours',
      accessorKey: 'baseHours',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Jam Pokok' className='justify-center' />
      ),
      cell: ({ row }) => (
        <div className='text-center text-xs text-muted-foreground tabular-nums font-mono'>
          {row.original.baseHours} jam
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'baseEarnings',
      accessorKey: 'baseEarnings',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Gaji Pokok' className='justify-end' />
      ),
      cell: ({ row }) => (
        <div className='text-right text-xs font-medium text-foreground tabular-nums'>
          {formatCurrency(row.original.baseEarnings)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'leaveDeductions',
      accessorKey: 'leaveDeductions',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Potongan Cuti' className='justify-end' />
      ),
      cell: ({ row }) => {
        const val = row.original.leaveDeductions;
        return (
          <div className='text-right text-xs tabular-nums font-medium'>
            {val > 0 ? (
              <span className='text-rose-600 dark:text-rose-400'>-{formatCurrency(val)}</span>
            ) : (
              <span className='text-muted-foreground/50'>-</span>
            )}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'replacementAdditions',
      accessorKey: 'replacementAdditions',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Insentif Pengganti' className='justify-end' />
      ),
      cell: ({ row }) => {
        const val = row.original.replacementAdditions;
        return (
          <div className='text-right text-xs tabular-nums font-medium'>
            {val > 0 ? (
              <span className='text-emerald-600 dark:text-emerald-400'>+{formatCurrency(val)}</span>
            ) : (
              <span className='text-muted-foreground/50'>-</span>
            )}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'netPayroll',
      accessorKey: 'netPayroll',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Gaji Bersih (THP)' className='justify-end' />
      ),
      cell: ({ row }) => (
        <div className='text-right text-xs font-bold text-foreground tabular-nums'>
          {formatCurrency(row.original.netPayroll)}
        </div>
      ),
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'actions',
      header: () => (
        <div className='text-center text-[12px] font-semibold text-foreground px-1'>Aksi</div>
      ),
      cell: ({ row, table }) => <CellAction data={row.original} table={table} />,
      enableSorting: false,
      enableHiding: false,
      size: 110
    }
  ];
}

export const payrollColumns = getPayrollColumns();
