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
import { getGenderLabel } from '@/constants/gender.constants';
import { useHistoryTableModalCrud } from '@/features/klinik/model/useHistoryTableModalCrud';
import { PregnancyHistoryModal } from '../organisms/pregnancy-history-modal';
import type { MaternalPreviousPregnancy } from '../../types/maternity.types';

export interface PregnancyHistoryTableProps {
  items: MaternalPreviousPregnancy[];
  isEditing?: boolean;
  onChange?: (updated: MaternalPreviousPregnancy[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
  motherBirthDate?: string | null;
}

export function PregnancyHistoryTable({
  items,
  isEditing = false,
  onChange,
  validationErrors,
  onClearError,
  motherBirthDate
}: PregnancyHistoryTableProps) {
  const {
    isOpen,
    isEditing: isEditingItem,
    draftItem,
    openAdd,
    openEdit,
    close,
    save,
    remove
  } = useHistoryTableModalCrud<MaternalPreviousPregnancy>({
    items,
    onChange,
    createDefaultItem: (nextOrder) => ({
      orderNumber: nextOrder,
      birthYear: '',
      birthWeightGrams: undefined,
      birthLengthCm: undefined,
      childSex: undefined,
      gestationalAgeAtBirth: '',
      birthAttendant: 'Bidan',
      deliveryMethod: 'Normal / Spontan',
      deliveryPlace: 'Puskesmas',
      complications: ''
    })
  });

  if (!isEditing && items.length === 0) {
    return (
      <EmptyState
        title='Tidak Ada Riwayat Persalinan'
        description='Tidak ada riwayat kehamilan dan persalinan sebelumnya (Kehamilan Pertama / Primigravida).'
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
          Daftar Riwayat Persalinan Anak Sebelumnya ({items.length})
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
            Tambah Kehamilan
          </Button>
        )}
      </div>

      <div className='flex-1 min-h-[220px] overflow-x-auto border-y border-border/50'>
        <Table className='min-w-[850px] w-full' containerClassName='border-0 rounded-none shadow-none bg-transparent overflow-visible'>
          <TableHeader className='bg-muted/30 border-b border-border/60'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-12 text-center text-xs font-semibold text-foreground h-9 px-2'>
                No
              </TableHead>
              <TableHead className='w-20 text-xs font-semibold text-foreground h-9 px-3'>
                Tahun
              </TableHead>
              <TableHead className='w-32 text-xs font-semibold text-foreground h-9 px-3'>
                BB / PB Lahir
              </TableHead>
              <TableHead className='w-24 text-xs font-semibold text-foreground h-9 px-3'>
                JK
              </TableHead>
              <TableHead className='w-24 text-xs font-semibold text-foreground h-9 px-3'>
                Usia Hamil
              </TableHead>
              <TableHead className='w-28 text-xs font-semibold text-foreground h-9 px-3'>
                Penolong
              </TableHead>
              <TableHead className='w-32 text-xs font-semibold text-foreground h-9 px-3'>
                Cara Lahir
              </TableHead>
              <TableHead className='w-28 text-xs font-semibold text-foreground h-9 px-3'>
                Tempat
              </TableHead>
              <TableHead className='min-w-36 text-xs font-semibold text-foreground h-9 px-3'>
                Komplikasi
              </TableHead>
              {isEditing && (
                <TableHead className='w-20 text-center text-xs font-semibold text-foreground h-9 px-2 sticky right-0 bg-muted/90 backdrop-blur-xs z-20 border-l border-border/40 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]'>
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const weightLengthText = [
                item.birthWeightGrams ? `${item.birthWeightGrams} gr` : '',
                item.birthLengthCm ? `${item.birthLengthCm} cm` : ''
              ]
                .filter(Boolean)
                .join(' / ');

              return (
                <TableRow key={index} className='hover:bg-muted/30 border-b border-border/40'>
                  <TableCell className='text-center font-medium text-xs px-2 py-2.5'>
                    {item.orderNumber || index + 1}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs font-mono'>
                    {item.birthYear || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {weightLengthText || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {getGenderLabel(item.childSex) || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {item.gestationalAgeAtBirth || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {item.birthAttendant || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {item.deliveryMethod || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {item.deliveryPlace || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs text-muted-foreground'>
                    {item.complications || '-'}
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
                          title='Edit Riwayat Persalinan'
                        >
                          <Pencil className='size-3.5' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => remove(index)}
                          className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                          title='Hapus Riwayat Persalinan'
                        >
                          <Trash2 className='size-3.5' />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PregnancyHistoryModal
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
