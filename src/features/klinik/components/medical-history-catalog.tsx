'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { MedicalAppointmentValues } from '../utils/medical-appointment';

export interface MedicalHistoryCatalogProps {
  groupKey: 'pregnancy' | 'contraception';
  recordsCount: number;
  maxRecords: number;
  values: MedicalAppointmentValues;
  onEditRecord: (recordNumber: number) => void;
  onRemoveRecord: (recordNumber: number) => void;
  onAddRecord: () => void;
  className?: string;
  showHeader?: boolean;
}

export function MedicalHistoryCatalog({
  groupKey,
  recordsCount,
  maxRecords,
  values: _values,
  onEditRecord,
  onRemoveRecord,
  onAddRecord,
  className,
  showHeader = true
}: MedicalHistoryCatalogProps) {
  const isPregnancy = groupKey === 'pregnancy';
  const title = isPregnancy
    ? 'Katalog Riwayat Kehamilan & Persalinan'
    : 'Katalog Riwayat KB / Kontrasepsi';
  const description = isPregnancy
    ? 'Daftar riwayat kehamilan dan persalinan sebelumnya yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan, lalu klik Lanjutkan di bawah jika seluruh riwayat sudah sesuai.'
    : 'Daftar riwayat penggunaan KB/kontrasepsi yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan, lalu klik Lanjutkan di bawah jika seluruh riwayat sudah sesuai.';

  const records = Array.from({ length: recordsCount }, (_, i) => i + 1);

  return (
    <div
      data-slot='medical-history-catalog'
      className={cn('flex flex-col gap-4 w-full h-full flex-1 min-h-0', className)}
    >
      {showHeader ? (
        <div className='flex shrink-0 flex-col gap-2 border-b border-border/70 pb-3.5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-base font-semibold tracking-tight text-foreground'>{title}</h3>
              <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>{description}</p>
            </div>
            <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'>
              {recordsCount} Riwayat
            </span>
          </div>
          {recordsCount < maxRecords && (
            <div className='flex items-center justify-end pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onAddRecord}
                className='border-dashed text-xs font-medium hover:border-primary hover:bg-primary/5'
              >
                <Icons.add className='mr-1 size-3.5 shrink-0' />
                <span>{isPregnancy ? 'Tambah Kehamilan' : 'Tambah KB'}</span>
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Grid of History Cards or Empty State */}
      {recordsCount === 0 ? (
        <div className='flex flex-1 flex-col h-full min-h-0 py-1'>
          <EmptyState
            title='Belum ada riwayat yang dicatat'
            description={
              isPregnancy
                ? 'Seluruh riwayat kehamilan dan persalinan telah dihapus. Anda dapat menambahkan riwayat baru, atau langsung klik Lanjutkan di bawah untuk melanjutkan.'
                : 'Seluruh riwayat penggunaan KB telah dihapus. Anda dapat menambahkan riwayat baru, atau langsung klik Lanjutkan di bawah untuk melanjutkan.'
            }
            action={
              <Button
                type='button'
                variant='outline'
                onClick={onAddRecord}
                className='text-xs font-medium border-dashed hover:border-primary hover:bg-primary/5'
              >
                <Icons.add className='size-3.5 mr-1.5' />
                {isPregnancy ? 'Tambah Riwayat Kehamilan' : 'Tambah Riwayat KB'}
              </Button>
            }
            className='h-full w-full flex-1 bg-card/50 border-border my-0'
          />
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
          {records.map((order) => {
            if (isPregnancy) {
              return (
                <div
                  key={`pregnancy-${order}`}
                  className='group relative flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-card-foreground shadow-2xs transition-all duration-200 hover:border-primary/50 hover:shadow-xs'
                >
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <Icons.forms className='size-4' />
                    </div>
                    <span className='text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate'>
                      Kartu Riwayat Kehamilan {order}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      shape='pill'
                      onClick={() => onEditRecord(order)}
                      className='h-7 px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer'
                      aria-label={`Edit riwayat kehamilan ke-${order}`}
                    >
                      <Icons.edit className='size-3 mr-1' />
                      Edit
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      shape='pill'
                      onClick={() => onRemoveRecord(order)}
                      className='h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer'
                      aria-label={`Hapus riwayat kehamilan ke-${order}`}
                    >
                      <Icons.trash className='size-3' />
                    </Button>
                  </div>
                </div>
              );
            }

            // Contraception History Card
            return (
              <div
                key={`contraception-${order}`}
                className='group relative flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-card-foreground shadow-2xs transition-all duration-200 hover:border-primary/50 hover:shadow-xs'
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <Icons.badgeCheck className='size-4' />
                  </div>
                  <span className='text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate'>
                    Kartu Riwayat KB {order}
                  </span>
                </div>

                {/* Action buttons */}
                <div className='flex items-center gap-1.5 shrink-0'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    shape='pill'
                    onClick={() => onEditRecord(order)}
                    className='h-7 px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer'
                    aria-label={`Edit riwayat KB ke-${order}`}
                  >
                    <Icons.edit className='size-3 mr-1' />
                    Edit
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    shape='pill'
                    onClick={() => onRemoveRecord(order)}
                    className='h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer'
                    aria-label={`Hapus riwayat KB ke-${order}`}
                  >
                    <Icons.trash className='size-3' />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recordsCount >= maxRecords ? (
        <div className='flex items-center justify-center pt-1'>
          <p className='text-xs text-muted-foreground'>
            Maksimal {maxRecords} riwayat telah dicatat.
          </p>
        </div>
      ) : null}
    </div>
  );
}
