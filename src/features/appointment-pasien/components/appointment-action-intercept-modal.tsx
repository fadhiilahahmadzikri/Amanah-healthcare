'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';

export type AppointmentActionStrategy = 'proposal' | 'direct';

export interface AppointmentActionInterceptModalProps {
  isOpen: boolean;
  actionType: 'reschedule' | 'cancel';
  appointmentCount?: number;
  patientName?: string;
  onSelectStrategy: (strategy: AppointmentActionStrategy) => void;
  onClose: () => void;
}

export function AppointmentActionInterceptModal({
  isOpen,
  actionType,
  appointmentCount = 1,
  patientName,
  onSelectStrategy,
  onClose
}: AppointmentActionInterceptModalProps) {
  const { can } = useAuthContext();
  const canDirect = can(PERMISSIONS.APPOINTMENTS.MANAGE);

  if (!isOpen) return null;

  const isReschedule = actionType === 'reschedule';
  const targetLabel =
    appointmentCount > 1
      ? `${appointmentCount} antrean`
      : patientName
        ? `pasien ${patientName}`
        : '1 antrean';

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className='rounded-2xl max-w-[380px] p-5 sm:p-6'>
        <AlertDialogHeader className='space-y-1 text-left'>
          <AlertDialogTitle className='text-base font-semibold text-foreground tracking-tight'>
            {isReschedule ? 'Jadwalkan Ulang' : 'Batalkan Janji Temu'}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-xs text-muted-foreground leading-relaxed'>
            Pilih cara proses untuk {targetLabel}:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='flex flex-col gap-2 pt-2'>
          {/* Pilihan 1: Kirim usulan ke pasien */}
          <button
            type='button'
            onClick={() => {
              onSelectStrategy('proposal');
              onClose();
            }}
            className='flex flex-col p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors text-left cursor-pointer'
          >
            <span className='text-xs font-semibold text-foreground'>Ajukan ke Pasien</span>
            <span className='text-[11px] text-muted-foreground mt-0.5 leading-normal'>
              {isReschedule
                ? 'Kirim jadwal baru ke pasien dan tunggu persetujuan.'
                : 'Kirim usulan batal ke pasien dan tunggu persetujuan.'}
            </span>
          </button>

          {/* Pilihan 2: Langsung eksekusi di sistem (hanya jika memiliki akses) */}
          {canDirect && (
            <button
              type='button'
              onClick={() => {
                onSelectStrategy('direct');
                onClose();
              }}
              className='flex flex-col p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors text-left cursor-pointer'
            >
              <span className='text-xs font-semibold text-foreground'>
                {isReschedule ? 'Ubah Langsung' : 'Batalkan Langsung'}
              </span>
              <span className='text-[11px] text-muted-foreground mt-0.5 leading-normal'>
                {isReschedule
                  ? 'Langsung perbarui jadwal di sistem sekarang.'
                  : 'Langsung batalkan antrean di sistem sekarang.'}
              </span>
            </button>
          )}
        </div>

        <AlertDialogFooter className='pt-2 sm:justify-end'>
          <Button type='button' variant='ghost' size='sm' onClick={onClose}>
            Batal
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
