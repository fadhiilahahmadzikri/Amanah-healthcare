'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { useUpdateQRConfigMutation } from '../api/mutations';
import type { QRPresenceConfig } from '../api/types';

export interface GenerateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRPresenceConfig;
  onActivated?: () => void;
}

export function GenerateQRModal({ isOpen, onClose, config, onActivated }: GenerateQRModalProps) {
  const updateConfigMutation = useUpdateQRConfigMutation();

  const handleLaunchKiosk = () => {
    const width = 1400;
    const height = 860;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(
      '/kehadiran-live',
      'AmanahLiveAttendance',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
    toast.success('Terminal presensi kiosk dibuka di window independen.');
    onClose();
  };

  const handleActivateDock = () => {
    onActivated?.();
    onClose();
  };

  const handleRotateToken = () => {
    updateConfigMutation.mutate({});
  };

  const isTerminalActive = config.status_presensi !== 'Tidak aktif';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4'>
        {/* Header */}
        <div className='pb-3 border-b border-border/40'>
          <div className='flex items-center gap-2'>
            <div className='size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.qrCode className='size-4' />
            </div>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Terminal Presensi QR Staf
            </h3>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            Terminal berjalan otomatis 24 jam. Staf dan dokter yang melakukan presensi akan
            divalidasi jadwal dinasnya secara langsung.
          </p>
        </div>

        {/* Dynamic Terminal Information Cards */}
        <div className='space-y-3 py-1'>
          {/* Status & Active Shift Info */}
          <div className='grid grid-cols-2 gap-2.5'>
            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/50'>
              <span className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1'>
                Status Terminal
              </span>
              <div className='flex items-center gap-1.5'>
                <span
                  className={`size-2 rounded-full ${
                    isTerminalActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className='text-xs font-bold text-foreground'>
                  {isTerminalActive ? 'Aktif Berjalan' : 'Tidak Aktif'}
                </span>
              </div>
            </div>

            <div className='p-2.5 rounded-xl bg-muted/40 border border-border/50'>
              <span className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1'>
                Sesi Operasional
              </span>
              <div className='flex items-center gap-1.5'>
                <Icons.clock className='size-3.5 text-primary shrink-0' />
                <span className='text-xs font-semibold text-foreground truncate'>
                  {config.qr_context || 'Shift Otomatis'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Token Preview & Security Note */}
          <div className='p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1.5'>
            <span className='text-[10.5px] font-semibold text-primary block'>
              Token Presensi Aktif Saat Ini
            </span>
            <div className='text-3xl font-black tracking-widest text-foreground font-mono leading-none py-1 select-all'>
              {config.qr_code_identifier || '-'}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Berotasi otomatis setiap {config.rotation_seconds || 30} detik untuk proteksi
              anti-kecurangan.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className='pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleRotateToken}
            disabled={updateConfigMutation.isPending}
            className='h-9 w-full sm:w-auto text-xs font-medium px-3 text-muted-foreground hover:text-foreground gap-1.5'
            title='Rotasi token QR sekarang'
          >
            <Icons.refresh
              className={`size-3.5 ${updateConfigMutation.isPending ? 'animate-spin' : ''}`}
            />
            <span>Rotasi Token Baru</span>
          </Button>

          <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleLaunchKiosk}
              className='h-9 text-xs font-medium px-3 text-foreground gap-1.5'
              title='Buka mode layar penuh untuk monitor lobi klinik'
            >
              <Icons.externalLink className='size-3.5' />
              <span>Buka Kiosk</span>
            </Button>
            <Button
              type='button'
              variant='default'
              size='sm'
              onClick={handleActivateDock}
              className='h-9 text-xs font-semibold px-4 gap-1.5'
            >
              <Icons.check className='size-3.5' />
              <span>Tampilkan di Dashboard</span>
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
