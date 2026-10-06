'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  getAppointmentStatusConfig,
  APPOINTMENT_STATUS_OPTIONS
} from '../../constants/appointment-status.dictionary';
import { POLI_OPTIONS } from '../../constants/options';
import type { AdminAppointment } from '../../api/types';
import { CellAction } from './cell-action';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAntreanPillClasses = (noAntrian: string) => {
  if (!noAntrian || noAntrian === '-') {
    return 'bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 text-white';
  }
  const prefix = noAntrian.trim().toUpperCase()[0];
  switch (prefix) {
    case 'A':
      return 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 text-white';
    case 'B':
      return 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white';
    case 'C':
      return 'bg-gradient-to-b from-purple-400 via-purple-500 to-indigo-600 text-white';
    case 'D':
      return 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-white';
    case 'E':
      return 'bg-gradient-to-b from-rose-400 via-rose-500 to-pink-600 text-white';
    default:
      return 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-purple-600 text-white';
  }
};

export const columns: ColumnDef<AdminAppointment>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center pl-1.5'>
        <Checkbox
          aria-label='Pilih semua appointment'
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
          aria-label={`Pilih ${row.original.patientName}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48
  },
  {
    id: 'patientName',
    accessorKey: 'patientName',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pasien' />
    ),
    cell: ({ row }) => {
      const appt = row.original;
      return (
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none'>
            {getInitials(appt.patientName)}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium leading-none text-sm text-foreground'>
              {appt.patientName}
            </span>
            <span className='mt-1 text-xs text-muted-foreground'>{appt.patientId}</span>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Pencarian Pasien',
      placeholder: 'Cari pasien, dokter, poli, antrean...',
      variant: 'text' as const,
      icon: Icons.search
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'scheduledDate',
    accessorKey: 'scheduledDate',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tanggal Booking' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground whitespace-nowrap font-medium'>
        {row.original.scheduledDate}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'scheduledStartTime',
    accessorKey: 'scheduledStartTime',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Jam Booking' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
        {row.original.scheduledStartTime}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status Antrean' />
    ),
    cell: ({ row }) => {
      const statusConfig = getAppointmentStatusConfig(row.original.status);
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
      label: 'Status Antrean',
      variant: 'multiSelect' as const,
      options: APPOINTMENT_STATUS_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'queueNumber',
    accessorKey: 'queueNumber',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='No. Antrean' />
    ),
    cell: ({ row }) => {
      const isNull = !row.original.queueNumber || row.original.queueNumber === '-';
      const gradientClass = getAntreanPillClasses(row.original.queueNumber);
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center font-mono text-[11.5px] font-bold px-2.5 py-0.5 rounded-[6px] border border-black/10 dark:border-white/20 shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.45),0_2px_4px_-1px_rgba(0,0,0,0.18),0_1px_2px_0_rgba(0,0,0,0.1)] select-none',
            gradientClass
          )}
        >
          <span className='drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]'>
            {isNull ? '-' : row.original.queueNumber}
          </span>
        </span>
      );
    },
    meta: {
      label: 'No. Antrean',
      placeholder: 'A-...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'doctorName',
    accessorKey: 'doctorName',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dokter' />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-medium text-foreground truncate max-w-[160px] block'>
        {row.original.doctorName}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'poliklinikName',
    accessorKey: 'poliklinikName',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Layanan Poli' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground truncate max-w-[150px] block'>
        {row.original.poliklinikName}
      </span>
    ),
    meta: {
      label: 'Layanan Poli',
      variant: 'multiSelect' as const,
      options: POLI_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    id: 'actions',
    header: () => <span className='text-[13px] font-semibold text-foreground px-1'>Aksi</span>,
    size: 90,
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];
