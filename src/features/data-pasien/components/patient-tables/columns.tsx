'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { formatClinicDate } from '@/lib/date-format';
import type { Patient } from '../../api/types';
import { CellAction } from './cell-action';
import type { ReferenceOptionItem } from '../../api/patient-reference-service';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

function getRelationshipBadge(type?: string | null, label?: string | null) {
  const normType = (type || '').toLowerCase();
  let displayLabel = label;
  if (!displayLabel) {
    switch (normType) {
      case 'child':
        displayLabel = 'Anak';
        break;
      case 'spouse':
        displayLabel = 'Pasangan';
        break;
      case 'parent':
        displayLabel = 'Orang Tua';
        break;
      case 'relative':
        displayLabel = 'Kerabat';
        break;
      default:
        displayLabel = 'Keluarga';
        break;
    }
  }

  let colorClasses = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
  if (normType === 'spouse') {
    colorClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  } else if (normType === 'parent') {
    colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  } else if (normType === 'relative') {
    colorClasses = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  }

  return { label: displayLabel, colorClasses };
}

export interface PatientColumnsOptions {
  genders?: ReferenceOptionItem[];
  statuses?: ReferenceOptionItem[];
}

export function getPatientColumns(options?: PatientColumnsOptions): ColumnDef<Patient>[] {
  const genderOptions = options?.genders ?? [];
  const statusOptions = options?.statuses ?? [];

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
      placeholder: 'RM-...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableSorting: true,
    enableHiding: true
  },

  // 2. Pasien (Pohon Afiliasi Reddit-Style, Nama, NIK, Email, Badges)
  {
    id: 'patient',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pasien' />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      const isSubRow = row.depth > 0;
      const canExpand = row.getCanExpand();
      const isExpanded = row.getIsExpanded();
      const relBadge = isSubRow
        ? getRelationshipBadge(patient.relationship_type, patient.relation_label)
        : null;

      return (
        <div className='flex items-center gap-2.5 min-w-[240px]'>
          {/* A. Reddit Tree Branch Connector & Expansion Controls */}
          {isSubRow ? (
            <div className='flex items-center pl-1 pr-0.5 select-none shrink-0'>
              <div className='relative w-5 h-9 flex items-center justify-center'>
                {/* Vertical thread line running from row above */}
                <span className='absolute -top-3.5 left-2 w-[2px] h-8 bg-border/80 dark:bg-border/60' />
                {/* Curved elbow connector to avatar */}
                <span className='absolute top-2.5 left-2 w-3 h-3.5 border-b-2 border-l-2 border-border/80 dark:border-border/60 rounded-bl-[5px]' />
              </div>
            </div>
          ) : canExpand ? (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className={cn(
                'size-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer shadow-xs select-none',
                isExpanded
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'
              )}
              title={isExpanded ? 'Tutup cabang afiliasi' : 'Buka cabang afiliasi'}
              aria-label={isExpanded ? 'Tutup afiliasi' : 'Buka afiliasi'}
            >
              {isExpanded ? (
                <Icons.minus className='size-3 stroke-[2.5]' />
              ) : (
                <Icons.plus className='size-3 stroke-[2.5]' />
              )}
            </button>
          ) : (
            <div className='size-5 shrink-0' />
          )}

          {/* B. Avatar */}
          <Avatar
            className={cn(
              'shrink-0 border border-border/40 transition-all',
              isSubRow ? 'h-7 w-7 rounded-md' : 'h-8 w-8 rounded-lg'
            )}
          >
            <AvatarFallback
              className={cn(
                'font-bold',
                isSubRow
                  ? 'rounded-md text-[10px] bg-muted text-muted-foreground'
                  : 'rounded-lg text-xs bg-primary/10 text-primary'
              )}
            >
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>

          {/* C. Patient Identity & Metadata */}
          <div className='flex flex-col min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 flex-wrap'>
              <span className='font-semibold leading-tight text-sm text-foreground truncate'>
                {patient.name}
              </span>

              {/* Master Badges */}
              {!isSubRow && patient.is_master && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                  <Icons.crown className='size-2.5 shrink-0' />
                  Akun Utama
                </span>
              )}
              {!isSubRow && (patient.affiliate_count ?? 0) > 0 && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20'>
                  <Icons.users className='size-2.5 shrink-0' />
                  {patient.affiliate_count} Afiliasi
                </span>
              )}
              {!isSubRow && !patient.is_master && (patient.affiliate_count ?? 0) === 0 && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40'>
                  Mandiri
                </span>
              )}

              {/* Affiliate Sub-Row Badges */}
              {isSubRow && relBadge && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    relBadge.colorClasses
                  )}
                >
                  Afiliasi • {relBadge.label}
                </span>
              )}
              {isSubRow && patient.has_own_account && (
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                  Punya Akun
                </span>
              )}
            </div>

            {/* Sub-line: NIK & Email */}
            <div className='mt-0.5 flex items-center gap-2 text-[11px] font-mono text-muted-foreground flex-wrap'>
              <span>NIK: {patient.masked_nik}</span>
              {patient.email && patient.email !== '-' ? (
                <span className='inline-flex items-center gap-1 text-muted-foreground/85 font-sans truncate max-w-[200px]'>
                  <Icons.mail className='size-3 shrink-0 text-muted-foreground/60' />
                  <span className='truncate'>{patient.email}</span>
                </span>
              ) : isSubRow && patient.master_patient_name ? (
                <span className='text-[10px] text-muted-foreground/70 font-sans italic'>
                  Akun Induk: {patient.master_patient_name}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Pasien',
      placeholder: 'Cari nama, NIK, no. RM...',
      variant: 'text' as const,
      icon: Icons.search
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 3. Gender & Umur
  {
    id: 'gender',
    accessorKey: 'gender',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Gender & Umur' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col text-xs'>
        <span className='font-medium text-foreground'>{row.original.gender}</span>
        <span className='text-[11px] text-muted-foreground'>{row.original.age} th • Gol. {row.original.blood_type || '-'}</span>
      </div>
    ),
    meta: {
      label: 'Gender',
      variant: 'multiSelect' as const,
      options: genderOptions
    },
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },

  // 4. Total Janji Temu (Aggregat)
  {
    id: 'total_appointments',
    accessorKey: 'total_appointments',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total Janji Temu' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1.5'>
        <span className='inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-muted text-foreground border border-border/40'>
          {row.original.total_appointments}
        </span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 5. Kunjungan Selesai (Aggregat)
  {
    id: 'completed_visits',
    accessorKey: 'completed_visits',
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title='Selesai' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1.5'>
        <span className='inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
          {row.original.completed_visits}
        </span>
      </div>
    ),
    enableSorting: true,
    enableHiding: true
  },

  // 6. Batal / Terlewat (Aggregat)
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
            'inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-bold border',
            total > 0
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-muted/40 text-muted-foreground border-border/40'
          )}
        >
          {total}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true
  },

  // 7. Kunjungan Terakhir
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
    enableSorting: true,
    enableHiding: true
  },

  // 8. Status Akun
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
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm select-none shadow-none',
            statusConfig.pillBg,
            statusConfig.pillBorder
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
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
