'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { useUpdateDoctorScheduleMutation } from '../../api/mutations';
import type { DoctorSchedule } from '../../api/types';

interface CellActionProps {
  data: DoctorSchedule;
  onOpenDetail: (doctor: DoctorSchedule) => void;
  onOpenEdit: (doctor: DoctorSchedule) => void;
}

export function CellAction({ data, onOpenDetail, onOpenEdit }: CellActionProps) {
  const updateScheduleMutation = useUpdateDoctorScheduleMutation();

  const handleToggleCuti = () => {
    updateScheduleMutation.mutate({
      id: data.id,
      payload: {
        is_cuti: !data.is_cuti,
        status_dokter: data.is_cuti ? 'Aktif' : 'Cuti',
        status_jadwal: data.is_cuti ? 'Aktif' : 'Cuti / Tutup'
      }
    });
  };

  const handleCloseToday = () => {
    updateScheduleMutation.mutate({
      id: data.id,
      payload: {
        status_jadwal: 'Tutup',
        slot_tersedia: 0
      }
    });
  };

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => onOpenDetail(data)}
        className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
        title='Lihat Detail'
      >
        <Icons.eye className='size-4' />
        <span className='sr-only'>Lihat Detail</span>
      </Button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
          >
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem onClick={() => onOpenDetail(data)} className='cursor-pointer text-xs'>
            <Icons.calendar className='mr-2 h-3.5 w-3.5' />
            Lihat Jadwal Bulanan
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onOpenEdit(data)} className='cursor-pointer text-xs'>
            <Icons.edit className='mr-2 h-3.5 w-3.5' />
            Atur Jam & Kuota Slot
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleCloseToday}
            disabled={data.status_jadwal === 'Tutup' || data.is_cuti}
            className='cursor-pointer text-xs'
          >
            <Icons.close className='mr-2 h-3.5 w-3.5 text-amber-500' />
            Tutup Praktik Hari Ini
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleCuti}
            className='cursor-pointer text-xs text-destructive focus:text-destructive'
          >
            <Icons.userX className='mr-2 h-3.5 w-3.5' />
            {data.is_cuti ? 'Aktifkan dari Cuti' : 'Set Dokter Cuti'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
