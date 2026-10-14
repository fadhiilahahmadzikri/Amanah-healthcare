'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatClinicDate } from '@/lib/date-format';
import type { Patient } from '../../api/types';
import { CellAction } from './cell-action';
import type { ReferenceOptionItem } from '../../api/patient-reference-service';
import {
  PROFILE_TYPE_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  profileTypeFilterFn,
  genderFilterFn,
  nikFilterFn,
  patientGlobalFilterFn,
  getGenderLabel
} from './columns-helpers';
import { PatientNameCell, PatientProfileTypeCell } from './columns-renderers';

export interface PatientColumnsOptions {
  genders?: ReferenceOptionItem[];
  statuses?: ReferenceOptionItem[];
}

export const DEFAULT_GENDER_OPTIONS: ReferenceOptionItem[] = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

export const DEFAULT_STATUS_OPTIONS: ReferenceOptionItem[] = [
  { label: 'Aktif', value: 'active' },
  { label: 'Non-Aktif', value: 'inactive' },
];

export function getPatientColumns(options?: PatientColumnsOptions): ColumnDef<Patient>[] {
  const genderOptions =
    options?.genders && options.genders.length > 0
      ? options.genders
      : DEFAULT_GENDER_OPTIONS;
  const statusOptions =
    options?.statuses && options.statuses.length > 0
      ? options.statuses
      : DEFAULT_STATUS_OPTIONS;

  return [
  // 0. Select checkbox
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
    size: 40
  },

  // 1. No. Rekam Medis (MRN)
  {
    id: 'patient_id',
    accessorKey: 'patient_id',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='No. RM' />
    ),
    cell: ({ row }) => (
      <div className={cn('flex items-center gap-1.5', row.depth > 0 && 'pl-2')}>
        {row.depth > 0 && (
          <span className='text-muted-foreground/60 text-xs font-mono select-none'>↳</span>
        )}
        <span
          className={cn(
            'font-mono text-xs',
            row.depth > 0
              ? 'text-muted-foreground font-medium'
              : 'font-semibold text-foreground'
          )}
        >
          {row.original.patient_id}
        </span>
      </div>
    ),
    meta: {
      label: 'No. Rekam Medis',
      placeholder: 'Cari no. RM...',
      icon: Icons.forms
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 2. Pasien (Pohon Afiliasi Reddit-Style + Avatar + Nama Pasien)
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pasien' />
    ),
    cell: ({ row }) => <PatientNameCell row={row} />,
    meta: {
      label: 'Pasien',
      placeholder: 'Cari pasien...',
      variant: 'text' as const,
      icon: Icons.search
    },
    filterFn: patientGlobalFilterFn,
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 3. Status Profil (Akun Utama / Mandiri / Afiliasi)
  {
    id: 'profile_type',
    accessorFn: (row) => (row.is_master ? 'master' : row.master_patient_id ? 'affiliate' : 'standalone'),
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status Profil' />
    ),
    cell: ({ row }) => <PatientProfileTypeCell row={row} />,
    filterFn: profileTypeFilterFn,
    meta: {
      label: 'Status Profil',
      variant: 'multiSelect' as const,
      options: PROFILE_TYPE_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 4. Jml Afiliasi (Raw Number Only, No Pills)
  {
    id: 'affiliate_count',
    accessorKey: 'affiliate_count',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Jml Afiliasi' />
    ),
    cell: ({ row }) => {
      const isSubRow = row.depth > 0;
      const count = row.original.affiliate_count ?? 0;
      return (
        <span className='font-mono text-xs text-foreground'>
          {!isSubRow && count > 0 ? count : '-'}
        </span>
      );
    },
    meta: {
      label: 'Jml Afiliasi',
      placeholder: 'Cari jml afiliasi...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 5. NIK (Dedicated Column)
  {
    id: 'nik',
    accessorKey: 'masked_nik',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='NIK' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-foreground tracking-wider'>
        {row.original.masked_nik || '-'}
      </span>
    ),
    filterFn: nikFilterFn,
    meta: {
      label: 'NIK',
      placeholder: 'Cari NIK...',
      icon: Icons.text
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 6. Email (Dedicated Column)
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <span
          className='text-xs text-muted-foreground truncate max-w-[180px] block'
          title={email || '-'}
        >
          {email && email !== '-' ? email : '-'}
        </span>
      );
    },
    meta: {
      label: 'Email',
      placeholder: 'Cari email...',
      icon: Icons.mail
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 7. Gender (Dedicated Column)
  {
    id: 'gender',
    accessorKey: 'gender',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => (
      <span className='text-xs font-medium text-foreground'>
        {getGenderLabel(row.original.gender)}
      </span>
    ),
    filterFn: genderFilterFn,
    meta: {
      label: 'Gender',
      variant: 'multiSelect' as const,
      options: genderOptions
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 8. Usia (Dedicated Column)
  {
    id: 'age',
    accessorKey: 'age',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Usia' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-foreground'>
        {row.original.age !== undefined && row.original.age !== null ? `${row.original.age} th` : '-'}
      </span>
    ),
    meta: {
      label: 'Usia',
      placeholder: 'Cari usia...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 9. Golongan Darah (Dedicated Column, Plain Text, No "Gol." prefix, No Pill)
  {
    id: 'blood_type',
    accessorKey: 'blood_type',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Gol. Darah' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-semibold text-foreground'>
        {row.original.blood_type || '-'}
      </span>
    ),
    meta: {
      label: 'Gol. Darah',
      variant: 'multiSelect' as const,
      options: BLOOD_TYPE_OPTIONS
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 10. Total Janji Temu (Raw Number Only, No Pills)
  {
    id: 'total_appointments',
    accessorKey: 'total_appointments',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total Janji Temu' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-semibold text-foreground'>
        {row.original.total_appointments ?? 0}
      </span>
    ),
    meta: {
      label: 'Total Janji Temu',
      placeholder: 'Cari total...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 11. Kunjungan Selesai (Raw Number Only, No Pills)
  {
    id: 'completed_visits',
    accessorKey: 'completed_visits',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Selesai' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
        {row.original.completed_visits ?? 0}
      </span>
    ),
    meta: {
      label: 'Kunjungan Selesai',
      placeholder: 'Cari selesai...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 12. Batal / Terlewat (Raw Number Only, No Pills)
  {
    id: 'missed_or_cancelled',
    accessorKey: 'missed_appointments',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Batal / Lewat' />
    ),
    cell: ({ row }) => {
      const missed = row.original.missed_appointments || 0;
      const cancelled = row.original.cancelled_appointments || 0;
      const total = missed + cancelled;
      return (
        <span
          className={cn(
            'font-mono text-xs font-semibold',
            total > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
          )}
        >
          {total}
        </span>
      );
    },
    meta: {
      label: 'Batal / Lewat',
      placeholder: 'Cari batal...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 13. Kunjungan Terakhir
  {
    id: 'last_visit_date',
    accessorKey: 'last_visit_date',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Kunjungan Terakhir' />
    ),
    cell: ({ row }) => {
      const dateStr = row.original.last_visit_date;
      return (
        <span className='text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap'>
          {dateStr ? formatClinicDate(dateStr, { style: 'human_short' }) : '-'}
        </span>
      );
    },
    meta: {
      label: 'Kunjungan Terakhir',
      placeholder: 'Cari kunjungan...'
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 14. Status Akun
  {
    id: 'account_status',
    accessorKey: 'account_status',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status Akun' />
    ),
    cell: ({ row }) => (
      <StatusBadge status={row.original.account_status || 'active'} size='sm' />
    ),
    meta: {
      label: 'Status Akun',
      variant: 'multiSelect' as const,
      options: statusOptions
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 9. Aksi
  {
    id: 'actions',
    header: () => <span className='text-[13px] font-semibold text-foreground px-1'>Aksi</span>,
    size: 140,
    cell: ({ row, table }) => <CellAction data={row.original} table={table} />,
    enableSorting: false,
    enableHiding: false
  }
];
}

export const columns: ColumnDef<Patient>[] = getPatientColumns();
