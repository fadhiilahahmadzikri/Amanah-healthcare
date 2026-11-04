'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MaternalContraceptiveHistory } from '../../types/maternity.types';

export interface ContraceptiveHistoryTableProps {
  items: MaternalContraceptiveHistory[];
  isEditing?: boolean;
  onChange?: (updated: MaternalContraceptiveHistory[]) => void;
}

export function ContraceptiveHistoryTable({
  items,
  isEditing = false,
  onChange,
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
      sideEffects: '',
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
        Tidak ada riwayat pemakaian kontrasepsi / KB sebelumnya.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Daftar Riwayat Penggunaan KB ({items.length})
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
            Tambah Riwayat KB
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border/60 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="text-[11px]">
              <TableHead className="w-10 text-center">No</TableHead>
              <TableHead className="w-32">Tgl Mulai</TableHead>
              <TableHead className="w-36">Jenis KB</TableHead>
              <TableHead className="w-28">Masa Pakai</TableHead>
              <TableHead className="w-32">Tgl Lepas</TableHead>
              <TableHead className="w-36">Masalah</TableHead>
              <TableHead className="min-w-36">Efek Samping</TableHead>
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
                    <CustomDatePicker
                      value={item.startDate || ''}
                      onChange={(val) =>
                        handleFieldChange(index, 'startDate', val)
                      }
                      className="h-7 text-xs"
                    />
                  ) : (
                    item.startDate || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.contraceptiveType || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'contraceptiveType',
                          e.target.value,
                        )
                      }
                      placeholder="Suntik 3 Bulan"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.contraceptiveType || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.durationText || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'durationText', e.target.value)
                      }
                      placeholder="1 tahun"
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.durationText || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <CustomDatePicker
                      value={item.stopDate || ''}
                      onChange={(val) =>
                        handleFieldChange(index, 'stopDate', val)
                      }
                      className="h-7 text-xs"
                    />
                  ) : (
                    item.stopDate || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.problems || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'problems', e.target.value)
                      }
                      placeholder="Kendala..."
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.problems || '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={item.sideEffects || ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'sideEffects', e.target.value)
                      }
                      placeholder="Efek samping..."
                      className="h-7 text-xs px-2"
                    />
                  ) : (
                    item.sideEffects || '-'
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
