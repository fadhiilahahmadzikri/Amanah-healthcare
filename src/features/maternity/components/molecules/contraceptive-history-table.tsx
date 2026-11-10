'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatClinicDate } from '@/lib/date-format';
import { useHistoryTableModalCrud } from '@/features/klinik/model/useHistoryTableModalCrud';
import { ContraceptiveHistoryModal } from '../organisms/contraceptive-history-modal';
import type { MaternalContraceptiveHistory } from '../../types/maternity.types';

export interface ContraceptiveHistoryTableProps {
  items: MaternalContraceptiveHistory[];
  isEditing?: boolean;
  onChange?: (updated: MaternalContraceptiveHistory[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
  motherBirthDate?: string | null;
}

export function ContraceptiveHistoryTable({
  items,
  isEditing = false,
  onChange,
  validationErrors,
  onClearError,
  motherBirthDate
}: ContraceptiveHistoryTableProps) {
  const {
    isOpen,
    isEditing: isEditingItem,
    draftItem,
    openAdd,
    openEdit,
    close,
    save,
    remove
  } = useHistoryTableModalCrud<MaternalContraceptiveHistory>({
    items,
    onChange,
    createDefaultItem: (nextOrder) => ({
      orderNumber: nextOrder,
      startDate: '',
      contraceptiveType: 'Suntik 3 Bulan',
      durationText: '',
      stopDate: '',
      problems: '',
      sideEffects: ''
    })
  });

  if (!isEditing && items.length === 0) {
    return (
      <EmptyState
        title='Tidak Ada Riwayat Kontrasepsi'
        description='Tidak ada riwayat pemakaian kontrasepsi / KB sebelumnya.'
        animated
        className='min-h-[160px] py-6 bg-transparent border border-dashed border-border/60'
        animationClassName='w-28 h-28 sm:w-32 sm:h-32'
      />
    );
  }

  return (
    <div className='flex-1 min-h-0 flex flex-col space-y-3 font-sans h-full'>
      <div className='flex items-center justify-between shrink-0'>
        <span className='text-xs font-semibold text-muted-foreground'>
          Daftar Riwayat Penggunaan KB ({items.length})
        </span>
        {isEditing && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={openAdd}
            className='h-7 text-xs gap-1 cursor-pointer font-medium'
          >
            <Plus className='size-3.5' />
            Tambah Riwayat KB
          </Button>
        )}
      </div>

      <div className='flex-1 min-h-[220px] overflow-x-auto border-y border-border/50'>
        <Table className='min-w-[760px] w-full' containerClassName='border-0 rounded-none shadow-none bg-transparent overflow-visible'>
          <TableHeader className='bg-muted/30 border-b border-border/60'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-12 text-center text-xs font-semibold text-foreground h-9 px-2'>
                No
              </TableHead>
              <TableHead className='w-36 text-xs font-semibold text-foreground h-9 px-3'>
                Tgl Mulai
              </TableHead>
              <TableHead className='w-40 text-xs font-semibold text-foreground h-9 px-3'>
                Jenis Kontrasepsi
              </TableHead>
              <TableHead className='w-32 text-xs font-semibold text-foreground h-9 px-3'>
                Masa Pakai
              </TableHead>
              <TableHead className='w-36 text-xs font-semibold text-foreground h-9 px-3'>
                Tgl Lepas
              </TableHead>
              <TableHead className='w-40 text-xs font-semibold text-foreground h-9 px-3'>
                Masalah
              </TableHead>
              <TableHead className='min-w-40 text-xs font-semibold text-foreground h-9 px-3'>
                Efek Samping
              </TableHead>
              {isEditing && (
                <TableHead className='w-20 text-center text-xs font-semibold text-foreground h-9 px-2 sticky right-0 bg-muted/90 backdrop-blur-xs z-20 border-l border-border/40 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]'>
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index} className='hover:bg-muted/30 border-b border-border/40'>
                <TableCell className='text-center font-medium text-xs px-2 py-2.5'>
                  {item.orderNumber || index + 1}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs'>
                  {item.startDate ? formatClinicDate(item.startDate, { style: 'human_medium' }) : '-'}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs font-medium'>
                  {item.contraceptiveType || '-'}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs'>
                  {item.durationText || '-'}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs'>
                  {item.stopDate ? formatClinicDate(item.stopDate, { style: 'human_medium' }) : '-'}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs text-muted-foreground'>
                  {item.problems || '-'}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-xs text-muted-foreground'>
                  {item.sideEffects || '-'}
                </TableCell>
                {isEditing && (
                  <TableCell className='text-center px-2 py-2.5 sticky right-0 bg-card z-10 border-l border-border/40 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.05)] [tr:hover_&]:bg-muted/30 transition-colors'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(index)}
                        className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer'
                        title='Edit Riwayat KB'
                      >
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                        title='Hapus Riwayat KB'
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ContraceptiveHistoryModal
        isOpen={isOpen}
        onClose={close}
        item={draftItem}
        onSave={save}
        isEditing={isEditingItem}
        motherBirthDate={motherBirthDate}
      />
    </div>
  );
}
