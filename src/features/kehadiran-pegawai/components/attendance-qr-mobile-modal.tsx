'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { QRPresenceCard } from './qr-presence-card';
import type { QRPresenceConfig } from '../api/types';

export interface AttendanceQrMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRPresenceConfig;
  onGenerateNewToken?: () => void;
  onOpenManualAttendance?: () => void;
}

export function AttendanceQrMobileModal({
  isOpen,
  onClose,
  config,
  onGenerateNewToken,
  onOpenManualAttendance
}: AttendanceQrMobileModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side='bottom'
        showCloseButton={false}
        className='h-[90vh] w-full p-0 flex flex-col gap-0 rounded-t-[24px] border-t border-border/60 bg-card text-card-foreground shadow-2xl font-sans'
      >
        <SheetHeader className='p-3.5 border-b border-border/40 shrink-0 flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.qrCode className='size-3.5' />
            </div>
            <div>
              <SheetTitle className='text-sm font-bold text-foreground text-left'>
                Terminal Presensi QR
              </SheetTitle>
              <SheetDescription className='sr-only'>
                Tampilkan kode QR presensi untuk discan staf klinik
              </SheetDescription>
            </div>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='size-7 rounded-md text-muted-foreground hover:text-foreground'
            aria-label='Tutup Terminal Presensi'
          >
            <Icons.close className='size-4' />
          </Button>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-3'>
          <QRPresenceCard
            config={config}
            onGenerateNewToken={onGenerateNewToken}
            onOpenManualAttendance={onOpenManualAttendance}
            onCloseCard={onClose}
            className='h-full border-0 shadow-none'
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
