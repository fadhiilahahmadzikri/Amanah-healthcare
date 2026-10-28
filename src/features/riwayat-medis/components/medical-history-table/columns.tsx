'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatClinicDate } from '@/lib/date-format';
import type { Patient } from '@/features/data-pasien/api/types';
import {
  PatientNameCell,
  PatientProfileTypeCell
} from '@/features/data-pasien/components/patient-tables/columns-renderers';
import {
  PROFILE_TYPE_OPTIONS,
  profileTypeFilterFn,
  genderFilterFn,
  nikFilterFn,
  patientGlobalFilterFn,
  getGenderLabel
} from '@/features/data-pasien/components/patient-tables/columns-helpers';
import { GENDER_OPTIONS } from '@/constants/gender.constants';

export interface MedicalHistoryTableMeta {
  onViewPatientHistory?: (patient: Patient) => void;
  onDownloadPatientRecord?: (patient: Patient) => void;
}

export function getMedicalHistoryColumns(): ColumnDef<Patient>[] {
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
      cell: ({ row }) => {
        const isSubRow = row.depth > 0;
        return (
          <div
            className={cn('flex items-center gap-1.5', isSubRow && 'pl-2 text-muted-foreground')}
          >
            <span className='font-mono text-xs font-semibold text-foreground'>
              {row.original.patient_id}
            </span>
          </div>
        );
      },
      meta: {
        label: 'No. Rekam Medis',
        placeholder: 'Cari no. RM...',
        icon: Icons.forms
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },

    // 2. Pasien (Avatar + Nama Pasien + Pohon Afiliasi)
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
      accessorFn: (row) =>
        row.is_master ? 'master' : row.master_patient_id ? 'affiliate' : 'standalone',
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

    // 4. Jml Afiliasi (Raw Number Only)
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

    // 6. No. Telepon (Dedicated Column - Strictly Separated from Email)
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }: { column: Column<Patient, unknown> }) => (
        <DataTableColumnHeader column={column} title='No. Telepon' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs text-foreground'>{row.original.phone || '-'}</span>
      ),
      meta: {
        label: 'No. Telepon',
        placeholder: 'Cari telepon...'
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },

    // 7. Email (Dedicated Column - Strictly Separated from Phone)
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

    // 8. Gender (Dedicated Column)
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
        options: GENDER_OPTIONS
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },

    // 9. Usia (Dedicated Column)
    {
      id: 'age',
      accessorKey: 'age',
      header: ({ column }: { column: Column<Patient, unknown> }) => (
        <DataTableColumnHeader column={column} title='Usia' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs text-foreground'>
          {row.original.age !== undefined && row.original.age !== null
            ? `${row.original.age} th`
            : '-'}
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

    // 10. Golongan Darah (Dedicated Column)
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
        variant: 'multiSelect' as const
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },

    // 11. Total Janji Temu (Dedicated Column)
    {
      id: 'total_appointments',
      accessorKey: 'total_appointments',
      header: ({ column }: { column: Column<Patient, unknown> }) => (
        <DataTableColumnHeader column={column} title='Total Kunjungan' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-semibold text-foreground'>
          {row.original.total_appointments ?? 0}
        </span>
      ),
      meta: {
        label: 'Total Kunjungan',
        placeholder: 'Cari total...'
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true
    },

    // 12. Kunjungan Selesai (Dedicated Column)
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

    // 13. Batal / Terlewat (Dedicated Column)
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

    // 14. Kunjungan Terakhir (Dedicated Column)
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

    // 15. Aksi
    {
      id: 'actions',
      header: () => <span className='text-[13px] font-semibold text-foreground px-1'>Aksi</span>,
      size: 130,
      cell: ({ row, table }) => {
        const meta = table.options.meta as MedicalHistoryTableMeta | undefined;
        const patient = row.original;

        return (
          <div className='flex items-center gap-1.5'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                if (meta?.onViewPatientHistory) {
                  meta.onViewPatientHistory(patient);
                }
              }}
              className='text-xs font-semibold gap-1.5 h-7 px-3 cursor-pointer hover:bg-muted shrink-0'
            >
              <Icons.history className='size-3 text-primary' />
              <span>Lihat Riwayat</span>
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false
    }
  ];
}

export const medicalHistoryColumns: ColumnDef<Patient>[] = getMedicalHistoryColumns();
