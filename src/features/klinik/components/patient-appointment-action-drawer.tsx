'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import type { Appointment } from '../api/types';
import {
  isAppointmentTerminal,
  isAppointmentInService
} from '@/features/appointment-pasien/constants/options';

export interface PatientAppointmentActionDrawerProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onViewForm?: () => void;
  onCheckIn?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onCallPatient?: () => void;
  isCallPending?: boolean;
}

export function PatientAppointmentActionDrawer({
  isOpen,
  appointment,
  onClose,
  onViewForm,
  onCheckIn,
  onReschedule,
  onCancel,
  onCallPatient,
  isCallPending = false
}: PatientAppointmentActionDrawerProps) {
  if (!appointment) return null;

  const isTerminal = isAppointmentTerminal(appointment.status);
  const isInService = isAppointmentInService(appointment.status);

  const canCancel = Boolean(
    appointment.allowedActions
      ? appointment.allowedActions.includes('CANCEL')
      : !isTerminal && !isInService
  );

  const canReschedule = Boolean(
    appointment.allowedActions
      ? appointment.allowedActions.includes('RESCHEDULE')
      : !isTerminal && !isInService
  );

  const canCheckIn = Boolean(
    appointment.allowedActions
      ? appointment.allowedActions.includes('CHECK_IN')
      : !isTerminal && !isInService
  );

  const canCall = Boolean(appointment.allowedActions?.includes('CALL'));

  const serviceName = appointment.service || appointment.poliklinik_name || 'Layanan Klinik';
  const patientDisplayName = appointment.patient_name || 'Pasien';

  const executeAction = (actionFn?: () => void) => {
    onClose();
    if (actionFn) {
      actionFn();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className='max-h-[85vh] font-sans z-[60]' overlayClassName='z-[60]'>
        {/* Header Drawer dengan Natural Wording Subtitle */}
        <DrawerHeader className='text-left pb-2.5 border-b border-border/40'>
          <div className='flex flex-col min-w-0 space-y-0.5'>
            <DrawerTitle className='text-base font-bold truncate tracking-tight text-foreground'>
              {patientDisplayName}
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground truncate'>
              Antrean{' '}
              <span className='font-mono font-bold text-primary'>
                {appointment.queue_number || '-'}
              </span>
              {serviceName ? ` • ${serviceName}` : ''}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        {/* 3-Column Grid Actions Terstandarisasi */}
        <div className='p-4 pt-3 max-h-[55vh] overflow-y-auto select-none'>
          <div className='grid grid-cols-3 gap-2.5'>
            {/* 1. Lihat Formulir Reservasi */}
            {onViewForm && (
              <button
                type='button'
                onClick={() => executeAction(onViewForm)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.forms className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Lihat Formulir</span>
              </button>
            )}

            {/* 2. Check-In Antrean */}
            {onCheckIn && canCheckIn && (
              <button
                type='button'
                onClick={() => executeAction(onCheckIn)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.qrCode className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Check-In QR</span>
              </button>
            )}

            {/* 3. Jadwal Ulang */}
            {onReschedule && canReschedule && (
              <button
                type='button'
                onClick={() => executeAction(onReschedule)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 text-foreground transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.calendar className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Jadwal Ulang</span>
              </button>
            )}

            {/* 4. Panggil Pasien (Internal / Admin konteks jika tersedia) */}
            {onCallPatient && canCall && (
              <button
                type='button'
                disabled={isCallPending}
                onClick={() => executeAction(onCallPatient)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform'>
                  {isCallPending ? (
                    <Icons.spinner className='size-5 animate-spin text-amber-600' />
                  ) : (
                    <Icons.phone className='size-5 text-amber-600 dark:text-amber-400' />
                  )}
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Panggil Pasien</span>
              </button>
            )}

            {/* 5. Batalkan Janji Temu */}
            {onCancel && canCancel && (
              <button
                type='button'
                onClick={() => executeAction(onCancel)}
                className='flex flex-col items-center justify-center p-3 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive transition-all cursor-pointer text-center gap-2 group'
              >
                <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-105 transition-transform'>
                  <Icons.trash className='size-5' />
                </div>
                <span className='text-[11px] font-semibold leading-tight'>Batalkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer dengan Standarisasi size='card-action' and shape='pill' */}
        <DrawerFooter className='pt-2 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            size='card-action'
            shape='pill'
            onClick={onClose}
            className='w-full font-semibold text-xs'
          >
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
