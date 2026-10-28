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
      maxWidth='w-full sm:max-w-[480px]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
      className='h-auto rounded-2xl border border-destructive/30 bg-card p-4.5 sm:p-5 shadow-2xl transition-[max-width,width] duration-300 ease-out'
    >
      <div className='relative font-sans space-y-4 text-left'>
        {/* Header - Clean, minimal, zero decorative icons */}
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Konfirmasi Dampak Operasional
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Perubahan ini berdampak langsung pada staf atau janji temu aktif.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0 pt-0.5'
          >
            Tutup
          </button>
        </div>

        {/* Unified Impact Summary & Warnings */}
        <div className='rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 text-xs leading-relaxed text-foreground'>
          <p>
            Terdapat{' '}
            <span className='font-bold text-foreground'>
              {impactResult.affectedDoctorsCount} staf terikat
            </span>{' '}
            dan{' '}
            <span className='font-bold text-foreground'>
              {impactResult.affectedAppointmentsCount} janji temu aktif
            </span>{' '}
            yang berpotensi terganggu.
          </p>

          {impactResult.warnings.length > 0 && (
            <div className='pt-2 border-t border-border/50 space-y-1.5'>
              <span className='text-[11px] font-semibold text-muted-foreground block'>
                Pemberitahuan:
              </span>
              <ul className='space-y-1 text-xs text-muted-foreground list-disc list-inside'>
                {impactResult.warnings.map((warn, idx) => (
                  <li key={idx} className='leading-snug'>
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons - Clean, minimal */}
        <div className='flex items-center justify-end gap-2 pt-2.5 border-t border-border/70'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isSubmitting}
            className='text-xs h-8 px-3 text-muted-foreground hover:text-foreground cursor-pointer'
          >
            Kembali Periksa
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onConfirm}
            disabled={isSubmitting}
            className='text-xs h-8 px-3.5 font-medium cursor-pointer'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                Menyimpan...
              </>
            ) : (
              'Tetap Simpan'
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
