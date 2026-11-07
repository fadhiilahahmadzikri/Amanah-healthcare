'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { GENDER_OPTIONS, getGenderLabel } from '@/constants/gender.constants';
import { cn } from '@/lib/utils';
import type { MaternalPreviousPregnancy } from '../../types/maternity.types';

export interface PregnancyHistoryTableProps {
  items: MaternalPreviousPregnancy[];
  isEditing?: boolean;
  onChange?: (updated: MaternalPreviousPregnancy[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (key: string) => void;
}

export function PregnancyHistoryTable({
  items,
  isEditing = false,
  onChange,
  validationErrors,
  onClearError
}: PregnancyHistoryTableProps) {
  const handleAddItem = () => {
    if (!onChange) return;
    const nextOrder = items.length + 1;
    const newItem: MaternalPreviousPregnancy = {
      orderNumber: nextOrder,
      birthYear: '',
      birthWeightGrams: undefined,
      birthLengthCm: undefined,
      childSex: undefined,
      gestationalAgeAtBirth: '',
      birthAttendant: '',
      deliveryMethod: 'Normal / Spontan',
      deliveryPlace: 'Puskesmas',
      complications: ''
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
    field: keyof MaternalPreviousPregnancy,
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
            onClick={handleAddItem}
            className='h-7 text-xs gap-1 cursor-pointer font-medium'
          >
            <Plus className='size-3.5' />
            Tambah Kehamilan
          </Button>
        )}
      </div>

      <div className='flex-1 min-h-[220px] overflow-x-auto border-y border-border/50'>
        <Table className='min-w-[850px] w-full'>
          <TableHeader className='bg-muted/30 border-b border-border/60'>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-12 text-center text-xs font-semibold text-foreground h-9 px-2'>
                  No
                </TableHead>
                <TableHead className='w-24 text-xs font-semibold text-foreground h-9 px-3'>
                  Tahun
                </TableHead>
                <TableHead className='w-32 text-xs font-semibold text-foreground h-9 px-3'>
                  BB / PB Lahir
                </TableHead>
                <TableHead className='w-24 text-xs font-semibold text-foreground h-9 px-3'>
                  JK
                </TableHead>
                <TableHead className='w-28 text-xs font-semibold text-foreground h-9 px-3'>
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
                  <TableCell className='px-3 py-2.5 text-xs font-mono'>
                    {isEditing ? (
                      <div>
                        <input
                          id={`prev-preg-year-${index}`}
                          maxLength={4}
                          value={item.birthYear || ''}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 4);
                            handleFieldChange(index, 'birthYear', val);
                            if (validationErrors?.[`prev_preg_${index}_birthYear`]) {
                              onClearError?.(`prev_preg_${index}_birthYear`);
                            }
                          }}
                          placeholder='2022'
                          className={cn(
                            'h-7 w-full text-xs px-1 font-mono bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none',
                            validationErrors?.[`prev_preg_${index}_birthYear`] && 'border-destructive text-destructive'
                          )}
                        />
                        {validationErrors?.[`prev_preg_${index}_birthYear`] && (
                          <p className='text-[10px] text-destructive leading-tight mt-0.5'>
                            {validationErrors[`prev_preg_${index}_birthYear`]}
                          </p>
                        )}
                      </div>
                    ) : (
                      item.birthYear || ''
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <div className='flex items-center gap-1.5'>
                        <div
                          className={cn(
                            'inline-flex items-center border-b border-border/60 focus-within:border-primary',
                            validationErrors?.[`prev_preg_${index}_birthWeightGrams`] && 'border-destructive text-destructive'
                          )}
                        >
                          <input
                            id={`prev-preg-weight-${index}`}
                            type='number'
                            min={0}
                            max={30000}
                            value={item.birthWeightGrams || ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                handleFieldChange(index, 'birthWeightGrams', undefined);
                                return;
                              }
                              const val = Number(raw);
                              if (!Number.isFinite(val)) return;
                              const clamped = Math.min(30000, Math.max(0, val));
                              handleFieldChange(index, 'birthWeightGrams', clamped);
                              if (validationErrors?.[`prev_preg_${index}_birthWeightGrams`]) {
                                onClearError?.(`prev_preg_${index}_birthWeightGrams`);
                              }
                            }}
                            placeholder='3200'
                            className='h-7 text-xs px-1 w-14 bg-transparent rounded-none border-0 focus:outline-none shadow-none text-right font-mono'
                          />
                          <span className='text-[10px] text-muted-foreground font-semibold px-0.5 select-none'>
                            gr
                          </span>
                        </div>
                        <span className='text-muted-foreground'>/</span>
                        <div
                          className={cn(
                            'inline-flex items-center border-b border-border/60 focus-within:border-primary',
                            validationErrors?.[`prev_preg_${index}_birthLengthCm`] && 'border-destructive text-destructive'
                          )}
                        >
                          <input
                            id={`prev-preg-length-${index}`}
                            type='number'
                            min={0}
                            max={250}
                            value={item.birthLengthCm || ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                handleFieldChange(index, 'birthLengthCm', undefined);
                                return;
                              }
                              const val = Number(raw);
                              if (!Number.isFinite(val)) return;
                              const clamped = Math.min(250, Math.max(0, val));
                              handleFieldChange(index, 'birthLengthCm', clamped);
                              if (validationErrors?.[`prev_preg_${index}_birthLengthCm`]) {
                                onClearError?.(`prev_preg_${index}_birthLengthCm`);
                              }
                            }}
                            placeholder='49'
                            className='h-7 text-xs px-1 w-10 bg-transparent rounded-none border-0 focus:outline-none shadow-none text-right font-mono'
                          />
                          <span className='text-[10px] text-muted-foreground font-semibold px-0.5 select-none'>
                            cm
                          </span>
                        </div>
                      </div>
                    ) : (
                      [
                        item.birthWeightGrams ? `${item.birthWeightGrams} gr` : '',
                        item.birthLengthCm ? `${item.birthLengthCm} cm` : ''
                      ]
                        .filter(Boolean)
                        .join(' / ')
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <Select
                        value={item.childSex || ''}
                        onValueChange={(val) =>
                          handleFieldChange(index, 'childSex', val)
                        }
                      >
                        <SelectTrigger className='h-7 text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:ring-0 focus:border-primary shadow-none'>
                          <SelectValue placeholder='Pilih' />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      getGenderLabel(item.childSex)
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <div className='inline-flex items-center w-full border-b border-border/60 focus-within:border-primary'>
                        <input
                          type='number'
                          min={0}
                          max={50}
                          value={
                            item.gestationalAgeAtBirth
                              ? item.gestationalAgeAtBirth.replace(/\D/g, '')
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const num = val ? Math.min(50, Number(val)) : '';
                            handleFieldChange(
                              index,
                              'gestationalAgeAtBirth',
                              num ? `${num} mgg` : ''
                            );
                          }}
                          placeholder='38'
                          className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 focus:outline-none shadow-none font-mono'
                        />
                        <span className='text-[10px] text-muted-foreground font-semibold px-1 select-none whitespace-nowrap'>
                          mgg
                        </span>
                      </div>
                    ) : (
                      item.gestationalAgeAtBirth || ''
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        maxLength={128}
                        value={item.birthAttendant || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'birthAttendant', e.target.value)
                        }
                        placeholder='Bidan'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.birthAttendant || ''
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        maxLength={64}
                        value={item.deliveryMethod || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'deliveryMethod', e.target.value)
                        }
                        placeholder='Spontan'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.deliveryMethod || ''
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        maxLength={128}
                        value={item.deliveryPlace || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'deliveryPlace', e.target.value)
                        }
                        placeholder='Puskesmas'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.deliveryPlace || ''
                    )}
                  </TableCell>
                  <TableCell className='px-3 py-2.5 text-xs'>
                    {isEditing ? (
                      <input
                        maxLength={500}
                        value={item.complications || ''}
                        onChange={(e) =>
                          handleFieldChange(index, 'complications', e.target.value)
                        }
                        placeholder='Tidak ada'
                        className='h-7 w-full text-xs px-1 bg-transparent rounded-none border-0 border-b border-border/60 focus:outline-none focus:border-primary shadow-none'
                      />
                    ) : (
                      item.complications || ''
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
