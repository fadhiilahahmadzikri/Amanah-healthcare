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

export type CheckInOutcomeType =
  | 'success'
  | 'invalid_qr'
  | 'invalid_code'
  | 'already_checked_in'
  | 'out_of_window'
  | 'forbidden'
  | 'error';

export interface CheckInResultPayload {
  type: CheckInOutcomeType;
  title: string;
  message: string;
  queueNumber?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
}

export interface PatientCheckInResultDrawerProps {
  isOpen: boolean;
  payload: CheckInResultPayload | null;
  onClose: () => void;
  onRetryScan?: () => void;
  onOpenManualInput?: () => void;
  onViewQueue?: () => void;
}

export function PatientCheckInResultDrawer({
  isOpen,
  payload,
  onClose,
  onRetryScan,
  onOpenManualInput,
  onViewQueue
}: PatientCheckInResultDrawerProps) {
  if (!payload) return null;

  const isSuccess = payload.type === 'success';
  const isInvalidQr = payload.type === 'invalid_qr';
  const isInvalidCode = payload.type === 'invalid_code';
  const isOutOfWindow = payload.type === 'out_of_window';
  const isAlreadyCheckedIn = payload.type === 'already_checked_in';

  const renderEmblem = () => {
    if (isSuccess) {
      return (
        <div className='size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/5 shadow-xs'>
          <Icons.check className='size-7 stroke-[2.5]' />
        </div>
      );
    }

    if (isInvalidQr || isInvalidCode) {
      return (
        <div className='size-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-8 ring-amber-500/5 shadow-xs'>
          <Icons.warning className='size-6 stroke-[2.2]' />
        </div>
      );
    }

    if (isOutOfWindow) {
      return (
        <div className='size-14 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center ring-8 ring-sky-500/5 shadow-xs'>
          <Icons.calendar className='size-6 stroke-[2.2]' />
        </div>
      );
    }

    if (isAlreadyCheckedIn) {
      return (
        <div className='size-14 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-8 ring-blue-500/5 shadow-xs'>
          <Icons.info className='size-6 stroke-[2.2]' />
        </div>
      );
    }

    return (
      <div className='size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center ring-8 ring-destructive/5 shadow-xs'>
        <Icons.close className='size-6 stroke-[2.2]' />
      </div>
    );
  };

  const handlePrimaryAction = () => {
    if (isSuccess) {
      if (onViewQueue) {
        onViewQueue();
      } else {
        onClose();
      }
    } else if (isInvalidCode) {
      if (onOpenManualInput) {
        onOpenManualInput();
      } else {
        onClose();
      }
    } else {
      if (onRetryScan) {
        onRetryScan();
      } else {
        onClose();
      }
    }
  };

  const handleSecondaryAction = () => {
    if (isInvalidCode) {
      if (onRetryScan) {
        onRetryScan();
      } else {
        onClose();
      }
    } else {
      if (onOpenManualInput) {
        onOpenManualInput();
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className='max-h-[85vh] font-sans z-[70] sm:max-w-md sm:mx-auto sm:rounded-t-2xl'
        overlayClassName='z-[70]'
      >
        <div className='p-6 flex flex-col items-center text-center space-y-4 select-none'>
          {/* 1. Hero Emblem */}
          {renderEmblem()}

          {/* 2. Header & Message */}
          <DrawerHeader className='p-0 space-y-1.5 text-center'>
            <DrawerTitle className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {payload.title}
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground leading-relaxed max-w-[320px] mx-auto'>
              {payload.message}
            </DrawerDescription>
          </DrawerHeader>

          {/* 3. Success Queue Banner (if applicable) */}
          {isSuccess && payload.queueNumber && (
            <div className='w-full py-3 px-4 rounded-xl bg-card border border-border/80 flex flex-col items-center justify-center gap-1 shadow-2xs'>
              <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning-subtle text-warning border border-warning-border text-[11px] font-bold'>
                <span className='size-1.5 rounded-full bg-warning animate-pulse' />
                Menunggu Panggilan
              </span>
              <p className='text-xs text-muted-foreground pt-1'>Nomor Antrean Anda</p>
              <div className='text-3xl font-black font-mono tracking-wider text-primary'>
                {payload.queueNumber}
              </div>
            </div>
          )}

          {/* 4. Action Buttons */}
          <DrawerFooter className='w-full p-0 pt-2 flex flex-col gap-2'>
            <Button
              type='button'
              variant='default'
              size='card-action'
              onClick={handlePrimaryAction}
              className='w-full font-semibold text-xs h-9 cursor-pointer gap-1.5 rounded-xl'
            >
              {!isSuccess &&
                (isInvalidCode ? (
                  <Icons.edit className='size-3.5 mr-0.5' />
                ) : (
                  <Icons.refresh className='size-3.5 mr-0.5' />
                ))}
              <span>
                {payload.actionLabel ||
                  (isSuccess
                    ? 'Lihat Antrean Saya'
                    : isInvalidCode
                      ? 'Masukkan Ulang Kode'
                      : 'Pindai Ulang')}
              </span>
            </Button>

            {!isSuccess && (
              <Button
                type='button'
                variant='outline'
                size='card-action'
                onClick={handleSecondaryAction}
                className='w-full font-semibold text-xs h-9 cursor-pointer gap-1.5 border-border/80 text-foreground rounded-xl'
              >
                {isInvalidCode ? (
                  <Icons.qrcode className='size-3.5 mr-0.5 text-muted-foreground' />
                ) : (
                  <Icons.edit className='size-3.5 mr-0.5 text-muted-foreground' />
                )}
                <span>
                  {payload.secondaryActionLabel ||
                    (isInvalidCode ? 'Pindai Kode QR' : 'Masukkan Kode Manual')}
                </span>
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
