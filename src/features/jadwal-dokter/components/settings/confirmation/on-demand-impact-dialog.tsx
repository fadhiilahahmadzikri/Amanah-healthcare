'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import type { ScheduleConfigurationImpactResult } from '../../../api/admin-schedule-configuration.api';

export interface OnDemandImpactDialogProps {
  isOpen: boolean;
  impactResult: ScheduleConfigurationImpactResult | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function OnDemandImpactDialog({
  isOpen,
  impactResult,
  isSubmitting,
  onClose,
  onConfirm,
  portalContainerRef
}: OnDemandImpactDialogProps) {
  if (!impactResult) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:w-[480px] max-w-[calc(100vw-2rem)]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
      className='h-auto rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl'
    >
      <div className='relative font-sans space-y-4 text-left'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1 min-w-0 flex-1'>
            <div className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
              <Icons.warning className='size-4 shrink-0' />
              <span className='text-xs font-bold tracking-tight'>
                Peringatan Dampak Operasional
              </span>
            </div>
            <h3 className='text-base font-bold text-foreground leading-snug'>
              Perubahan Berisiko Terhadap Operasional
            </h3>
            <p className='text-xs text-muted-foreground leading-normal'>
              Perubahan konfigurasi yang Anda buat terdeteksi berdampak langsung pada dokter aktif atau janji temu pasien.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={isSubmitting}
            aria-label='Tutup dialog dampak'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Impact Metrics Summary */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div className='rounded-xl border border-border/80 bg-muted/30 p-3 space-y-0.5'>
            <span className='text-[11px] font-medium text-muted-foreground'>
              Dokter Terikat
            </span>
            <div className='text-lg font-bold text-foreground'>
              {impactResult.affectedDoctorsCount}{' '}
              <span className='text-xs font-normal text-muted-foreground'>dokter</span>
            </div>
          </div>
          <div className='rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-0.5'>
            <span className='text-[11px] font-medium text-destructive'>
              Janji Temu Aktif
            </span>
            <div className='text-lg font-bold text-destructive'>
              {impactResult.affectedAppointmentsCount}{' '}
              <span className='text-xs font-normal text-muted-foreground'>pasien</span>
            </div>
          </div>
        </div>

        {/* Detailed Warnings */}
        {impactResult.warnings.length > 0 && (
          <div className='rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5 max-h-40 overflow-y-auto'>
            <span className='text-xs font-semibold text-foreground block'>
              Konsekuensi Operasional:
            </span>
            <ul className='space-y-1 text-xs text-muted-foreground list-disc list-inside'>
              {impactResult.warnings.map((warn, idx) => (
                <li key={idx} className='leading-relaxed'>
                  {warn}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/70'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isSubmitting}
            className='text-xs h-8.5'
          >
            Kembali Periksa
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onConfirm}
            disabled={isSubmitting}
            className='text-xs h-8.5 font-medium'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                Menyimpan...
              </>
            ) : (
              'Tetap Simpan & Terapkan'
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
