'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
}

export function MedicalHistoryCatalog({
  groupKey,
  recordsCount,
  maxRecords,
  values,
  onEditRecord,
  onRemoveRecord,
  onAddRecord,
  className
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
      className={cn('flex flex-col gap-4 w-full', className)}
    >
      {/* Header Info */}
      <div className='flex items-start justify-between gap-3 border-b border-border/70 pb-3.5'>
        <div>
          <h3 className='text-base font-semibold tracking-tight text-foreground'>{title}</h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>{description}</p>
        </div>
        <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'>
          {recordsCount} Riwayat
        </span>
      </div>

      {/* Grid of History Cards or Empty State */}
      {recordsCount === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-10 px-6 text-center my-2'>
          <div className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-3'>
            <Icons.forms className='size-5' />
          </div>
          <h4 className='text-sm font-semibold text-foreground'>Belum ada riwayat yang dicatat</h4>
          <p className='mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed'>
            {isPregnancy
              ? 'Seluruh riwayat kehamilan dan persalinan telah dihapus. Anda dapat menambahkan riwayat baru, atau langsung klik Lanjutkan di bawah untuk melanjutkan.'
              : 'Seluruh riwayat penggunaan KB telah dihapus. Anda dapat menambahkan riwayat baru, atau langsung klik Lanjutkan di bawah untuk melanjutkan.'}
          </p>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            onClick={onAddRecord}
            className='mt-4 text-xs font-medium border-dashed hover:border-primary hover:bg-primary/5'
          >
            <Icons.add className='size-3.5 mr-1.5' />
            {isPregnancy ? 'Tambah Riwayat Kehamilan' : 'Tambah Riwayat KB'}
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
          {records.map((order) => {
            if (isPregnancy) {
              const birthYear = values[`previousPregnancy${order}BirthYear`] || '—';
              const deliveryMethod = values[`previousPregnancy${order}DeliveryMethod`] || '—';
              const childSex = values[`previousPregnancy${order}ChildSex`] || '—';
              const birthWeight = values[`previousPregnancy${order}BirthWeight`]?.trim() || '';
              const birthLength = values[`previousPregnancy${order}BirthLength`]?.trim() || '';
              const gestationalAge =
                values[`previousPregnancy${order}GestationalAgeAtBirth`] || '—';
              const complications = values[`previousPregnancy${order}Complications`] || 'Tidak ada';

              const weightLengthText =
                birthWeight && birthLength
                  ? `${birthWeight} / ${birthLength}`
                  : birthWeight
                    ? birthWeight
                    : birthLength
                      ? birthLength
                      : '—';

              return (
                <div
                  key={`pregnancy-${order}`}
                  className='group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xs transition-all duration-200 hover:border-primary/50 hover:shadow-xs'
                >
                  <div>
                    {/* Card Header with Badges & Actions */}
                    <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-border/50'>
                      <div className='flex items-center gap-2'>
                        <div className='flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                          <Icons.forms className='size-3.5' />
                        </div>
                        <span className='text-xs font-semibold text-foreground tracking-tight'>
                          Kartu Riwayat Kehamilan {order}
                        </span>
                      </div>

                      {/* Action buttons (always visible on mobile, interactive on desktop) */}
                      <div className='flex items-center gap-1.5 opacity-90 transition-opacity sm:opacity-75 sm:group-hover:opacity-100'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          shape='pill'
                          onClick={() => onEditRecord(order)}
                          className='h-7 px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary'
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
                          className='h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          aria-label={`Hapus riwayat kehamilan ke-${order}`}
                        >
                          <Icons.trash className='size-3' />
                        </Button>
                      </div>
                    </div>

                    {/* Strictly Aligned 2-Column Summary Grid */}
                    <div className='grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 text-xs text-muted-foreground'>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Tahun Lahir / Berakhir
                        </span>
                        <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                          {birthYear}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Cara Persalinan
                        </span>
                        <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                          {deliveryMethod}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Jenis Kelamin
                        </span>
                        <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                          {childSex}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Usia Kehamilan
                        </span>
                        <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                          {gestationalAge}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Berat / Panjang Lahir
                        </span>
                        <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                          {weightLengthText}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <span className='block text-[11px] text-muted-foreground truncate'>
                          Komplikasi / Masalah
                        </span>
                        <span
                          className='font-medium text-muted-foreground truncate block mt-0.5'
                          title={complications}
                        >
                          {complications}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Contraception History Card
            const kbType = values[`contraception${order}Type`] || '—';
            const startDate = values[`contraception${order}StartDate`] || '—';
            const stopDate = values[`contraception${order}StopDate`] || '—';
            const duration = values[`contraception${order}Duration`] || '—';
            const problems = values[`contraception${order}Problems`] || 'Tidak ada';
            const sideEffects = values[`contraception${order}SideEffects`] || 'Tidak ada';

            return (
              <div
                key={`contraception-${order}`}
                className='group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xs transition-all duration-200 hover:border-primary/50 hover:shadow-xs'
              >
                <div>
                  {/* Card Header with Badges & Actions */}
                  <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-border/50'>
                    <div className='flex items-center gap-2'>
                      <div className='flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                        <Icons.badgeCheck className='size-3.5' />
                      </div>
                      <span className='text-xs font-semibold text-foreground tracking-tight'>
                        Kartu Riwayat KB {order}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className='flex items-center gap-1.5 opacity-90 transition-opacity sm:opacity-75 sm:group-hover:opacity-100'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        shape='pill'
                        onClick={() => onEditRecord(order)}
                        className='h-7 px-2.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary'
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
                        className='h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        aria-label={`Hapus riwayat KB ke-${order}`}
                      >
                        <Icons.trash className='size-3' />
                      </Button>
                    </div>
                  </div>

                  {/* Strictly Aligned 2-Column Summary Grid */}
                  <div className='grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 text-xs text-muted-foreground'>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Jenis KB
                      </span>
                      <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                        {kbType}
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Lama Pemakaian
                      </span>
                      <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                        {duration}
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Mulai Pakai
                      </span>
                      <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                        {startDate}
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Selesai / Lepas
                      </span>
                      <span className='font-medium text-muted-foreground truncate block mt-0.5'>
                        {stopDate}
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Masalah / Keluhan
                      </span>
                      <span
                        className='font-medium text-muted-foreground truncate block mt-0.5'
                        title={problems}
                      >
                        {problems}
                      </span>
                    </div>
                    <div className='min-w-0'>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        Efek Samping
                      </span>
                      <span
                        className='font-medium text-muted-foreground truncate block mt-0.5'
                        title={sideEffects}
                      >
                        {sideEffects}
                      </span>
                    </div>
                  </div>
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
