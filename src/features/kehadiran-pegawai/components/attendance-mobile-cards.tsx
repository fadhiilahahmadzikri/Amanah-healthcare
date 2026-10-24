'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  MasterEntityCard,
  EntityCardPrimaryAction,
  EntityCardSecondaryAction
} from '@/components/cards/master-entity-card';
import { AttendanceDetailSheet } from './attendance-detail-sheet';
import type { StaffAttendance } from '../api/types';

export interface AttendanceMobileCardsProps {
  records: StaffAttendance[];
  onTriggerCheckout?: (staffId: string, staffName: string) => void;
  isCheckoutPending?: boolean;
}

export function AttendanceMobileCards({
  records,
  onTriggerCheckout,
  isCheckoutPending = false
}: AttendanceMobileCardsProps) {
  const [selectedRecord, setSelectedRecord] = useState<StaffAttendance | null>(null);

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Icons.inbox}
        title='Belum ada data presensi'
        description='Data presensi pegawai akan ditampilkan di sini setelah scan atau input tercatat.'
        className='min-h-[260px] border-0 bg-transparent'
      />
    );
  }

  return (
    <>
      <div className='flex flex-col gap-2.5 pb-20'>
        {records.map((r) => {
          const isCompleted = Boolean(r.checkOutAt);

          const jamMasuk = r.checkInAt
            ? new Date(r.checkInAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : r.waktu_presensi || r.waktu || '-';

          const jamPulang = r.checkOutAt
            ? new Date(r.checkOutAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : null;

          return (
            <MasterEntityCard
              key={r.id}
              name={r.nama_staf}
              subtitle={`${r.id_staf} • ${r.kategori}`}
              avatarUrl={r.avatar}
              status={isCompleted ? 'COMPLETED' : 'ACTIVE'}
              statusLabel={isCompleted ? 'Selesai Dinas' : 'Sedang Dinas'}
              statusVariant={isCompleted ? 'blue' : 'amber'}
              onCardClick={() => setSelectedRecord(r)}
              contentSlot={
                <div className='flex items-center justify-between text-xs font-mono text-muted-foreground pt-1'>
                  <div className='flex items-center gap-1.5'>
                    <Icons.clock className='size-3 text-primary' />
                    <span>Shift {r.shift}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='font-semibold text-foreground'>{jamMasuk}</span>
                    <span>-</span>
                    <span>{jamPulang || '...'}</span>
                  </div>
                </div>
              }
              secondaryAction={
                <EntityCardSecondaryAction
                  label='Lihat Detail'
                  shortLabel='Detail'
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecord(r);
                  }}
                  title={`Lihat detail presensi ${r.nama_staf}`}
                />
              }
              primaryAction={
                !isCompleted && onTriggerCheckout ? (
                  <EntityCardPrimaryAction
                    label='Checkout'
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerCheckout(r.staffProfileId || r.id_staf, r.nama_staf);
                    }}
                    title={`Catat pulang dinas untuk ${r.nama_staf}`}
                    icon={<Icons.logout className='size-3.5' />}
                  />
                ) : (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled
                    className='h-7.5 px-2.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  >
                    <Icons.check className='size-3 mr-1' />
                    <span>Selesai</span>
                  </Button>
                )
              }
            />
          );
        })}
      </div>

      <AttendanceDetailSheet
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        onCheckout={onTriggerCheckout}
        isCheckoutPending={isCheckoutPending}
      />
    </>
  );
}
