'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { getGenderLabel } from '@/constants/gender.constants';
import { formatClinicDate } from '@/lib/date-format';
import type { ImmunizationHistoryItem } from '../../../api/history-queries';
import { ClinicalHistoryCellAction } from './clinical-history-cell-action';

export interface GetImmunizationColumnsOptions {
  onViewDetail: (id: string) => void;
}

export function getImmunizationColumns({
  onViewDetail
}: GetImmunizationColumnsOptions): ColumnDef<ImmunizationHistoryItem>[] {
  return [
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tanggal Pengisian' />,
      cell: ({ row }) => (
        <span className='font-medium text-foreground whitespace-nowrap'>
          {formatClinicDate(row.original.createdAt)}
        </span>
      ),
      size: 150
    },
    {
      id: 'childName',
      accessorKey: 'childName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Anak & NIK' />,
      cell: ({ row }) => (
        <div className='flex flex-col min-w-[160px]'>
          <span className='font-bold text-foreground text-xs'>{row.original.childName}</span>
          <span className='font-mono text-[11px] text-muted-foreground'>
            {row.original.childNik || '-'}
          </span>
        </div>
      ),
      size: 220
    },
    {
      id: 'birthDateGender',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tgl Lahir / Gender' />,
      cell: ({ row }) => {
        const item = row.original;
        const genderLabel = getGenderLabel(item.childSex);
        return (
          <div className='flex flex-col whitespace-nowrap'>
            <span className='text-foreground'>{item.childBirthDate || '-'}</span>
            <span className='text-[11px] text-muted-foreground'>{genderLabel}</span>
          </div>
        );
      },
      size: 150
    },
    {
      id: 'parentPhone',
      accessorKey: 'parentPhone',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Kontak Orang Tua' />,
      cell: ({ row }) => (
        <span className='text-foreground whitespace-nowrap'>{row.original.parentPhone || '-'}</span>
      ),
      size: 150
    },
    {
      id: 'scheduledVaccinesCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Vaksin Terjadwal' />,
      cell: ({ row }) => (
        <Badge
          variant='outline'
          className='text-[10.5px] px-2 py-0.5 rounded-md font-semibold bg-primary/5 text-primary border-primary/20 whitespace-nowrap'
        >
          {row.original.scheduledVaccinesCount} Vaksin
        </Badge>
      ),
      size: 140
    },
    {
      id: 'actions',
      header: () => <div className='text-right pr-4 font-semibold text-[13px]'>Aksi</div>,
      cell: ({ row }) => (
        <ClinicalHistoryCellAction id={row.original.id} onViewDetail={onViewDetail} />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 120
    }
  ];
}
