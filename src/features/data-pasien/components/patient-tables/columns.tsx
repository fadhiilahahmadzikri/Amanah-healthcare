'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/styles/clinical-tokens';
import type { Patient } from '../../api/types';
import { CellAction } from './cell-action';
import { GENDER_OPTIONS, STATUS_OPTIONS } from '../../constants/options';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const columns: ColumnDef<Patient>[] = [
  // 0. Select checkbox (harmonized with Customer table)
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center pl-1.5'>
        <Checkbox
          aria-label='Pilih semua pasien'
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
          aria-label={`Pilih ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48
  },

  // 1. ID Pasien
  {
    id: 'patient_id',
    accessorKey: 'patient_id',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID Pasien' />
    ),
    cell: ({ row }) => (
      <span className='font-mono font-medium text-xs text-foreground'>
        {row.original.patient_id}
      </span>
    ),
    meta: {
      label: 'ID Pasien',
      placeholder: 'RM-...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableSorting: true,
    enableHiding: true
  },

  // 2. Pasien
  {
    id: 'patient',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pasien' />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 rounded-md'>
            {patient.avatar && <AvatarImage src={patient.avatar} alt={patient.name} />}
            <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary font-semibold'>
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium leading-none text-sm text-foreground'>{patient.name}</span>
            <span className='mt-1 text-xs text-muted-foreground'>{patient.email}</span>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Pasien',
      placeholder: 'Cari nama, NIK, no. RM, telepon...',
      variant: 'text' as const,
      icon: Icons.search
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 3. Gender
  {
    id: 'gender',
    accessorKey: 'gender',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => <span className='text-sm text-muted-foreground'>{row.original.gender}</span>,
    meta: {
      label: 'Gender',
      variant: 'multiSelect' as const,
      options: GENDER_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 4. Umur
  {
    id: 'age',
    accessorKey: 'age',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Umur' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground tabular-nums'>{row.original.age} th</span>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 5. Dibuat Pada
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dibuat Pada' />
    ),
    cell: ({ row }) => {
      const d = new Date(row.original.created_at);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return (
        <span className='text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
          {`${day}/${month}/${year}`}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true
  },

  // 6. Status Akun (Pill Status Akun identik dengan kartu janji temu)
  {
    id: 'account_status',
    accessorKey: 'account_status',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status Akun' />
    ),
    cell: ({ row }) => {
      const statusConfig = getStatusConfig(row.original.account_status);
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-[11.5px] font-bold border backdrop-blur-sm select-none shadow-none',
            statusConfig.pillBg,
            statusConfig.pillBorder
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
              statusConfig.dotGradient
            )}
          />
          <span
            className={cn(
              'bg-clip-text text-transparent font-bold tracking-tight',
              statusConfig.textGradient
            )}
          >
            {statusConfig.label}
          </span>
        </span>
      );
    },
    meta: {
      label: 'Status Akun',
      variant: 'multiSelect' as const,
      options: STATUS_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 7. Aksi
  {
    id: 'actions',
    header: () => <span className='text-[13px] font-semibold text-foreground px-1'>Aksi</span>,
    size: 90,
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];
