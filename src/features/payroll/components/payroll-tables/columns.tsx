'use client';

import React from 'react';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatCurrency } from '../../utils/currency';
import { CellAction } from './cell-action';
import type { PayrollSummaryItem } from '../../api/types';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'doctor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300/40';
    case 'midwife':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300/40';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/40';
  }
};

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
      size: 44
    },
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: ({ column }: { column: Column<PayrollSummaryItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Karyawan / Staf' />
      ),
      cell: ({ row }) => {
        const staff = row.original;
        const roleBadgeClass = getRoleBadgeClass(staff.staffType);

        return (
          <div className='flex items-center gap-2.5 py-0.5'>
            <div className='size-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 select-none'>
              {getInitials(staff.fullName)}
            </div>
            <div className='min-w-0'>
              <span className='font-semibold text-xs text-foreground block truncate'>
                {staff.fullName}
              </span>
              <div className='flex items-center gap-1.5 mt-0.5'>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleBadgeClass}`}
                >
                  {staff.staffType}
                </span>
                {staff.positionTitle && (
                  <span className='text-[10px] text-muted-foreground truncate'>
                    • {staff.positionTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false
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
        <div className='text-right text-xs font-bold text-primary tabular-nums'>
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
      size: 90
    }
  ];
}

export const payrollColumns = getPayrollColumns();
