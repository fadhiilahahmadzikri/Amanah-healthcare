'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/styles/clinical-tokens';
import type { AdminAppointment } from '../../api/types';
import { CellAction } from './cell-action';
import { LIVE_STATUS_OPTIONS, POLI_OPTIONS } from '../../constants/options';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const columns: ColumnDef<AdminAppointment>[] = [
  // 0. Select checkbox
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
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
      <div className='px-1'>
        <Checkbox
          aria-label={`Pilih ${row.original.pasien}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40
  },

  // 1. Live Status (Status Antrean) - dipindahkan ke paling depan agar mudah terlihat
  {
    id: 'live_status',
    accessorKey: 'live_status',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status Antrean' />
    ),
    cell: ({ row }) => {
      const statusConfig = getStatusConfig(row.original.live_status);
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
      options: LIVE_STATUS_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 2. No. Antrean
  {
    id: 'no_antrian',
    accessorKey: 'no_antrian',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='No. Antrean' />
    ),
    cell: ({ row }) => {
      const isNull = row.original.no_antrian === '-';
      return (
        <span
          className={cn(
            'font-mono text-xs font-semibold px-2 py-0.5 rounded-md inline-block',
            isNull ? 'text-muted-foreground bg-muted/40' : 'text-primary bg-primary/10'
          )}
        >
          {row.original.no_antrian}
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

  // 3. Pasien
  {
    id: 'pasien',
    accessorKey: 'pasien',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pasien' />
    ),
    cell: ({ row }) => {
      const appt = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 rounded-md'>
            {appt.avatar && <AvatarImage src={appt.avatar} alt={appt.pasien} />}
            <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary font-semibold'>
              {getInitials(appt.pasien)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium leading-none text-sm text-foreground'>{appt.pasien}</span>
            <span className='mt-1 text-xs text-muted-foreground'>{appt.id_pasien}</span>
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

  // 4. Tanggal Booking
  {
    id: 'tanggal_booking',
    accessorKey: 'tanggal_booking',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tanggal Booking' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground whitespace-nowrap font-medium'>
        {row.original.tanggal_booking}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 5. Jam Booking
  {
    id: 'jam_booking',
    accessorKey: 'jam_booking',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Jam Booking' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
        {row.original.jam_booking}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 6. Dokter
  {
    id: 'dokter',
    accessorKey: 'dokter',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Dokter' />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-medium text-foreground truncate max-w-[160px] block'>
        {row.original.dokter}
      </span>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 7. Layanan Poli
  {
    id: 'layanan_poli',
    accessorKey: 'layanan_poli',
    header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Layanan Poli' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground truncate max-w-[150px] block'>
        {row.original.layanan_poli}
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

  // 8. Aksi
  {
    id: 'actions',
    header: () => <span className='text-sm font-medium text-foreground px-2'>Aksi</span>,
    size: 220,
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
];
