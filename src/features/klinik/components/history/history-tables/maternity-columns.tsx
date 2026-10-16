'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { formatClinicDate } from '@/lib/date-format';
import type { MaternalHistoryItem } from '../../../api/history-queries';
import { ClinicalHistoryCellAction } from './clinical-history-cell-action';

export interface GetMaternityColumnsOptions {
  onViewDetail: (id: string) => void;
}

export function getMaternityColumns({
  onViewDetail
}: GetMaternityColumnsOptions): ColumnDef<MaternalHistoryItem>[] {
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
      id: 'motherName',
      accessorKey: 'motherName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Ibu & NIK' />,
      cell: ({ row }) => (
        <div className='flex flex-col min-w-[160px]'>
          <span className='font-bold text-foreground text-xs'>{row.original.motherName}</span>
          <span className='font-mono text-[11px] text-muted-foreground'>
            {row.original.motherNik || '-'}
          </span>
        </div>
      ),
      size: 220
    },
    {
      id: 'gpa',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Obstetrik (GPA)' />,
      cell: ({ row }) => {
        const item = row.original;
        const gpa = `G${item.gravidaCount ?? 1} P${item.parityCount ?? 0} A${item.abortionCount ?? 0}`;
        return (
          <Badge
            variant='outline'
            className='text-[10.5px] px-2 py-0.5 rounded-md font-mono font-semibold bg-primary/5 text-primary border-primary/20 whitespace-nowrap'
          >
            {gpa}
          </Badge>
        );
      },
      size: 130
    },
    {
      id: 'gestationalAge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Usia Hamil & HPL' />,
      cell: ({ row }) => {
        const item = row.original;
        const gestAge =
          item.gestationalAgeFormatted ||
          (item.gestationalAgeWeeks ? `${item.gestationalAgeWeeks} Minggu` : '-');
        return (
          <div className='flex flex-col whitespace-nowrap'>
            <span className='font-medium text-foreground'>{gestAge}</span>
            <span className='text-[11px] text-muted-foreground'>
              HPL: {item.estimatedDueDate || '-'}
            </span>
          </div>
        );
      },
      size: 160
    },
    {
      id: 'partnerName',
      accessorKey: 'partnerName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Suami / Pasangan' />,
      cell: ({ row }) => (
        <span className='text-foreground whitespace-nowrap'>{row.original.partnerName || '-'}</span>
      ),
      size: 160
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
