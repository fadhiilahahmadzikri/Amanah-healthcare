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
      maxWidth='w-full sm:w-[410px] max-w-[calc(100vw-2rem)]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
      className='h-auto rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl'
    >
      <div className='relative font-sans space-y-3.5 text-left'>
        {/* Header - Clean, direct, no trailing icon */}
        <div className='space-y-0.5'>
          <h3 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Konfirmasi Dampak Operasional
          </h3>
          <p className='text-xs text-muted-foreground leading-normal'>
            Perubahan ini berdampak langsung pada dokter atau janji temu aktif.
          </p>
        </div>

        {/* Unified Impact Summary & Consequences (Zero Redundancy) */}
        <div className='rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs leading-relaxed text-foreground'>
          <p>
            Terdapat <span className='font-bold text-foreground'>{impactResult.affectedDoctorsCount} dokter terikat</span> dan{' '}
            <span className='font-bold text-foreground'>{impactResult.affectedAppointmentsCount} janji temu aktif</span> yang berpotensi terganggu.
          </p>

          {impactResult.warnings.length > 0 && (
            <div className='pt-2 border-t border-border/50 space-y-1'>
              <span className='text-[11px] font-medium text-muted-foreground block'>
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

        {/* Action Buttons - Red color reserved strictly for destructive action */}
        <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/70'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isSubmitting}
            className='text-xs h-8 px-3'
          >
            Kembali Periksa
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onConfirm}
            disabled={isSubmitting}
            className='text-xs h-8 px-3 font-medium'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3 animate-spin mr-1.5' />
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
