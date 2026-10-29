'use client';

import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { APPOINTMENT_STATUS_OPTIONS } from '../../constants/appointment-status.dictionary';
import { AppointmentStatusPill } from '@/features/klinik/components/appointment-card';
import Link from 'next/link';
import type { AdminAppointment } from '../../api/types';
import type { Option } from '@/types/data-table';
import { CellAction } from './cell-action';
import { formatClinicDate, formatClinicTime } from '@/lib/date-format';

const formatTimeOnly = (isoString?: string | null) => {
  if (!isoString) return '-';
  return formatClinicTime(isoString);
};

export const getAntreanPillClasses = (noAntrian: string) => {
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

export interface GetAppointmentColumnsOptions {
  poliOptions?: Option[];
  serviceOptions?: Option[];
  doctorOptions?: Option[];
  roomOptions?: Option[];
}

export function getAppointmentColumns(
  options: GetAppointmentColumnsOptions = {}
): ColumnDef<AdminAppointment>[] {
  const poliOptions = options.poliOptions ?? [];
  const serviceOptions = options.serviceOptions ?? [];
  const doctorOptions = options.doctorOptions ?? [];
  const roomOptions = options.roomOptions ?? [];

  return [
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
        const avatar = appt.avatarUrl || DEFAULT_AVATAR_PATH;
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8 rounded-lg shrink-0'>
              <AvatarImage
                src={avatar}
                alt={appt.patientName}
                className='rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={appt.patientName}
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full rounded-lg object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='font-semibold leading-none text-sm text-foreground'>
                  {appt.patientName}
                </span>
                {appt.isAffiliated && (
                  <span className='inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded leading-none'>
                    Afiliasi
                  </span>
                )}
              </div>
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
          {formatClinicDate(row.original.scheduledDate)}
        </span>
      ),
      meta: {
        label: 'Tanggal Booking',
        variant: 'date' as const
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'scheduledStartTime',
      accessorKey: 'scheduledStartTime',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Sesi & Estimasi' />
      ),
      cell: ({ row }) => {
        const appt = row.original;
        const etaDisplay = appt.scheduledStartTime ?? '-';
        const sessionLabel = appt.sessionName ?? '';

        return (
          <div className='flex flex-col whitespace-nowrap leading-tight'>
            <span className='text-sm text-foreground font-mono tabular-nums font-medium'>
              {etaDisplay}
            </span>
            {sessionLabel && sessionLabel !== etaDisplay && (
              <span className='text-[11px] text-muted-foreground font-sans mt-0.5'>
                {sessionLabel}
              </span>
            )}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status Antrean' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center'>
          <AppointmentStatusPill status={row.original.status} size='sm' />
        </div>
      ),
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
      id: 'doctorId',
      accessorKey: 'doctorName',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Dokter' />
      ),
      cell: ({ row, table }) => {
        const appt = row.original;
        if (!appt.doctorName) {
          return (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                const meta = table.options.meta as
                  | { onAssignDoctor?: (item: AdminAppointment) => void }
                  | undefined;
                meta?.onAssignDoctor?.(appt);
              }}
              className='text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium italic select-none cursor-pointer text-left'
              title='Tugaskan Dokter'
            >
              Belum di-assign
            </button>
          );
        }
        const targetDoctorId = appt.doctorId;
        const href = targetDoctorId
          ? `/admin/jadwal-dokter?selectedDoctorId=${encodeURIComponent(targetDoctorId)}&dialog=detail`
          : `/admin/jadwal-dokter?search=${encodeURIComponent(appt.doctorName)}`;
        return (
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className='text-sm font-semibold text-primary hover:underline hover:text-primary/80 truncate max-w-[160px] text-left cursor-pointer transition-colors block'
            title='Buka Jadwal & Profil Dokter'
          >
            {appt.doctorName}
          </Link>
        );
      },
      meta: {
        label: 'Dokter',
        variant: 'select' as const,
        options: doctorOptions
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'poliklinikName',
      accessorKey: 'poliklinikName',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Poli' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground truncate max-w-[150px] block'>
          {row.original.poliklinikName}
        </span>
      ),
      meta: {
        label: 'Poli',
        variant: 'multiSelect' as const,
        options: poliOptions
      },
      enableColumnFilter: false,
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'roomName',
      accessorKey: 'roomName',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Ruangan' />
      ),
      cell: ({ row, table }) => {
        const appt = row.original;
        if (!appt.roomName) {
          return (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                const meta = table.options.meta as
                  | { onAssignRoom?: (item: AdminAppointment) => void }
                  | undefined;
                meta?.onAssignRoom?.(appt);
              }}
              className='text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium italic select-none cursor-pointer text-left'
              title='Tugaskan Ruangan'
            >
              Belum di-assign
            </button>
          );
        }
        return (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              const meta = table.options.meta as
                | { onAssignRoom?: (item: AdminAppointment) => void }
                | undefined;
              meta?.onAssignRoom?.(appt);
            }}
            className='text-sm text-foreground hover:text-primary hover:underline truncate max-w-[140px] text-left cursor-pointer block font-medium'
            title='Ganti Ruangan'
          >
            {appt.roomName}
          </button>
        );
      },
      meta: {
        label: 'Ruangan',
        variant: 'multiSelect' as const,
        options: roomOptions
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'layananName',
      accessorKey: 'layananName',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Layanan' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-foreground font-medium truncate max-w-[160px] block'>
          {row.original.layananName || '-'}
        </span>
      ),
      meta: {
        label: 'Layanan',
        variant: 'multiSelect' as const,
        options: serviceOptions
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actualStartedAt',
      accessorKey: 'actualStartedAt',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Mulai Pelayanan' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
          {formatTimeOnly(row.original.actualStartedAt)}
        </span>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actualCompletedAt',
      accessorKey: 'actualCompletedAt',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Selesai Pelayanan' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
          {formatTimeOnly(row.original.actualCompletedAt)}
        </span>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'consultationDurationFormatted',
      accessorKey: 'consultationDurationFormatted',
      header: ({ column }: { column: Column<AdminAppointment, unknown> }) => (
        <DataTableColumnHeader column={column} title='Durasi Pelayanan' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-foreground font-medium tabular-nums whitespace-nowrap'>
          {row.original.consultationDurationFormatted || '-'}
        </span>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actions',
      header: () => <span className='text-[13px] font-semibold text-foreground px-1'>Aksi</span>,
      cell: ({ row, table }) => <CellAction data={row.original} table={table} />,
      enableSorting: false,
      enableHiding: false,
      size: 130
    }
  ];
}

export const columns = getAppointmentColumns();
