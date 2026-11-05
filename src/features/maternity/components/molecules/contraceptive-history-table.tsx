'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
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
import type { MaternalContraceptiveHistory } from '../../types/maternity.types';

export interface ContraceptiveHistoryTableProps {
  items: MaternalContraceptiveHistory[];
  isEditing?: boolean;
  onChange?: (updated: MaternalContraceptiveHistory[]) => void;
}

export function ContraceptiveHistoryTable({
  items,
  isEditing = false,
  onChange
}: ContraceptiveHistoryTableProps) {
  const handleAddItem = () => {
    if (!onChange) return;
    const nextOrder = items.length + 1;
    const newItem: MaternalContraceptiveHistory = {
      orderNumber: nextOrder,
      startDate: '',
      contraceptiveType: 'Suntik 3 Bulan',
      durationText: '1 tahun',
      stopDate: '',
      problems: '',
      sideEffects: ''
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (!onChange) return;
    const next = items
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, orderNumber: idx + 1 }));
    onChange(next);
  };

  const handleFieldChange = (
    index: number,
    field: keyof MaternalContraceptiveHistory,
    value: any
  ) => {
    if (!onChange) return;
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

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
            onClick={handleAddItem}
            className='h-7 text-xs gap-1 cursor-pointer font-medium'
          >
            <Plus className='size-3.5' />
            Tambah Riwayat KB
          </Button>
        )}
      </div>

      <div className='flex-1 min-h-[220px] overflow-x-auto border-y border-border/50'>
        <Table className='min-w-[760px] w-full'>
          <TableHeader className='bg-muted/30 border-b border-border/60'>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-12 text-center text-xs font-semibold text-foreground h-9 px-2'>
                  No
                </TableHead>
                <TableHead className='w-44 text-xs font-semibold text-foreground h-9 px-3'>
                  Tgl Mulai
                </TableHead>
                <TableHead className='w-40 text-xs font-semibold text-foreground h-9 px-3'>
                  Jenis Kontrasepsi
                </TableHead>
                <TableHead className='w-32 text-xs font-semibold text-foreground h-9 px-3'>
                  Masa Pakai
                </TableHead>
                <TableHead className='w-44 text-xs font-semibold text-foreground h-9 px-3'>
                  Tgl Lepas
                </TableHead>
                <TableHead className='w-40 text-xs font-semibold text-foreground h-9 px-3'>
                  Masalah
                </TableHead>
                <TableHead className='min-w-40 text-xs font-semibold text-foreground h-9 px-3'>
                  Efek Samping
                </TableHead>
                {isEditing && (
                  <TableHead className='w-12 text-center text-xs font-semibold text-foreground h-9 px-2'>
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
                    {isEditing ? (
                      <CustomDatePicker
                        value={item.startDate || ''}
                        onChange={(val) =>
                          handleFieldChange(index, 'startDate', val)
                        }
                        placeholder='Pilih tgl'
                        className='h-7 text-xs border-0 border-b border-border/60 rounded-none bg-transparent shadow-none'
                        variant='underline'
                      />
                    ) : (
                      formatClinicDate(item.startDate, { style: 'human_medium' })
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs font-medium'>
                    {isEditing ? (
                      <input
                        maxLength={64}
                        value={item.contraceptiveType || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            'contraceptiveType',
                            e.target.value
                          )
                        }
                        placeholder='Suntik 3 Bulan'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.contraceptiveType || '-'
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        maxLength={64}
                        value={item.durationText || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'durationText', e.target.value)
                        }
                        placeholder='1 tahun'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.durationText || '-'
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <CustomDatePicker
                        value={item.stopDate || ''}
                        onChange={(val) =>
                          handleFieldChange(index, 'stopDate', val)
                        }
                        placeholder='Pilih tgl'
                        className='h-7 text-xs border-0 border-b border-border/60 rounded-none bg-transparent shadow-none'
                        variant='underline'
                      />
                    ) : (
                      formatClinicDate(item.stopDate, { style: 'human_medium' })
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        value={item.problems || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'problems', e.target.value)
                        }
                        placeholder='Masalah...'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.problems || '-'
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        value={item.sideEffects || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'sideEffects', e.target.value)
                        }
                        placeholder='Efek samping...'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.sideEffects || '-'
                    )}
                  </TableCell>
                  {isEditing && (
                    <TableCell className='text-center px-2 py-2.5'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => handleRemoveItem(index)}
                        className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
