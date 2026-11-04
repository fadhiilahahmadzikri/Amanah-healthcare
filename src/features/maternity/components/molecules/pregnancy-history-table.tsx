'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GENDER_OPTIONS, getGenderLabel } from '@/constants/gender.constants';
import type { MaternalPreviousPregnancy } from '../../types/maternity.types';

export interface PregnancyHistoryTableProps {
  items: MaternalPreviousPregnancy[];
  isEditing?: boolean;
  onChange?: (updated: MaternalPreviousPregnancy[]) => void;
}

export function PregnancyHistoryTable({
  items,
  isEditing = false,
  onChange,
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
      complications: '',
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
    value: any,
  ) => {
    if (!onChange) return;
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  if (!isEditing && items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
        Tidak ada riwayat kehamilan dan persalinan sebelumnya (Kehamilan Pertama / Primigravida).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Daftar Riwayat Persalinan Anak Sebelumnya ({items.length})
        </span>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="h-7 text-xs gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            Tambah Kehamilan
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border/60 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="text-[11px]">
              <TableHead className="w-10 text-center">No</TableHead>
              <TableHead className="w-24">Tahun</TableHead>
              <TableHead className="w-28">BB/PB Lahir</TableHead>
              <TableHead className="w-24">JK</TableHead>
              <TableHead className="w-24">Usia Hamil</TableHead>
              <TableHead className="w-28">Penolong</TableHead>
              <TableHead className="w-28">Cara Lahir</TableHead>
              <TableHead className="w-28">Tempat</TableHead>
              <TableHead className="min-w-32">Komplikasi</TableHead>
              {isEditing && <TableHead className="w-12 text-center">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index} className="text-xs">
                <TableCell className="text-center font-medium">
                  {item.orderNumber || index + 1}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.birthYear || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'birthYear', e.target.value)
                      }
                      placeholder="2022"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.birthYear || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={item.birthWeightGrams || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            'birthWeightGrams',
                            Number(e.target.value) || undefined,
                          )
                        }
                        placeholder="gr"
                        className="h-7 text-xs px-1 w-14"
                      />
                      <span>/</span>
                      <Input
                        type="number"
                        value={item.birthLengthCm || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            'birthLengthCm',
                            Number(e.target.value) || undefined,
                          )
                        }
                        placeholder="cm"
                        className="h-7 text-xs px-1 w-12"
                      />
                    </div>
                  ) : (
                    `${item.birthWeightGrams || '-'} gr / ${item.birthLengthCm || '-'} cm`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={item.childSex || ''}
                      onValueChange={(val) =>
                        handleFieldChange(index, 'childSex', val)
                      }
                    >
                      <SelectTrigger className="h-7 text-xs px-2">
                        <SelectValue />
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
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.gestationalAgeAtBirth || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'gestationalAgeAtBirth',
                          e.target.value,
                        )
                      }
                      placeholder="39 mgg"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.gestationalAgeAtBirth || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.birthAttendant || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'birthAttendant',
                          e.target.value,
                        )
                      }
                      placeholder="Bidan"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.birthAttendant || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.deliveryMethod || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'deliveryMethod',
                          e.target.value,
                        )
                      }
                      placeholder="Spontan"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.deliveryMethod || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.deliveryPlace || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'deliveryPlace', e.target.value)
                      }
                      placeholder="Puskesmas"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.deliveryPlace || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.complications || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'complications', e.target.value)
                      }
                      placeholder="Tidak ada"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.complications || 'Tidak ada'
                  )}
                </TableCell>
                {isEditing && (
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
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
