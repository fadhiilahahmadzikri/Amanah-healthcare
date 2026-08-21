'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { QRPresenceConfig } from '../api/types';

interface QRPresenceCardProps {
  config: QRPresenceConfig;
  onGenerateNewToken?: () => void;
  onCloseCard?: () => void;
  onPopoutWindow?: () => void;
  onOpenManualAttendance?: () => void;
  className?: string;
}

export function QRPresenceCard({
  config,
  onGenerateNewToken,
  onCloseCard,
  onPopoutWindow,
  onOpenManualAttendance,
  className
}: QRPresenceCardProps) {
  const ROTATION_INTERVAL = 30; // 30 seconds dynamic rotation
  const [timeLeft, setTimeLeft] = useState(ROTATION_INTERVAL);
  const [token, setToken] = useState(config.qr_code_identifier || 'K54TYU');

  // Dynamic code generator for 30s interval rotation
  const generateNewCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(result);
    setTimeLeft(ROTATION_INTERVAL);
    onGenerateNewToken?.();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewCode();
          return ROTATION_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePopout = () => {
    if (onPopoutWindow) {
      onPopoutWindow();
      return;
    }
    const width = 1400;
    const height = 860;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(
      '/kehadiran-live',
      'AmanahLiveAttendance',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
    toast.success('Panel presensi dibuka di window independen.');
  };

  // Construct secure payload with timestamp and shift
  const qrPayload = JSON.stringify({
    clinic: 'Amanah Healthcare',
    shift: config.qr_context || 'Shift Pagi',
    token: token,
    validUntil: Date.now() + timeLeft * 1000
  });

  return (
    <Card
      className={cn(
        'p-3.5 sm:p-4 bg-card text-card-foreground border border-border/60 shadow-xs flex flex-col font-sans select-none rounded-[20px] h-full justify-start relative',
        className
      )}
    >
      {/* 1. Header Minimalis: Status Aktif, Pill Shift, dan Tombol Presensi Manual/Refresh/Popout/Close */}
      <div className='flex items-center justify-between gap-1.5 pb-2.5 border-b border-border/40 shrink-0 w-full min-w-0'>
        {/* Status Aktif */}
        <div className='flex items-center gap-1.5 min-w-0 shrink'>
          <span className='size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse shrink-0' />
          <span className='text-xs font-semibold text-foreground truncate'>
            {config.status_presensi || 'Aktif hingga 16:00 WIB'}
          </span>
        </div>

        {/* Shift Pill & Aksi Toolbars */}
        <div className='flex items-center gap-1 shrink-0'>
          <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0'>
            {config.qr_context || 'Shift Pagi'}
          </span>

          {/* Tombol Presensi Manual dengan Tooltip */}
          {onOpenManualAttendance && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={onOpenManualAttendance}
                  className='size-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
                >
                  <Icons.userCheck className='size-3.5' />
                  <span className='sr-only'>Presensi Manual Pegawai</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' className='text-xs font-medium'>
                Presensi Manual Pegawai
              </TooltipContent>
            </Tooltip>
          )}

          {/* Tombol Keluarkan Panel (Popout Independent Window) dengan Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handlePopout}
                className='size-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
              >
                <Icons.externalLink className='size-3.5' />
                <span className='sr-only'>Keluarkan Panel (Window Baru)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' className='text-xs font-medium'>
              Keluarkan Panel (Window Baru)
            </TooltipContent>
          </Tooltip>

          {/* Tombol Segarkan QR dengan Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  generateNewCode();
                  toast.info('QR Code diperbarui.');
                }}
                className='size-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
              >
                <Icons.refresh className='size-3' />
                <span className='sr-only'>Segarkan QR</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' className='text-xs font-medium'>
              Segarkan QR Code
            </TooltipContent>
          </Tooltip>

          {/* Tombol Tutup / Sembunyikan QR dengan Tooltip */}
          {onCloseCard && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={onCloseCard}
                  className='size-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
                >
                  <Icons.close className='size-3.5' />
                  <span className='sr-only'>Tutup Presensi QR</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' className='text-xs font-medium'>
                Tutup Presensi QR
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 2. Direct Clean QR Code (Tanpa wrapper tiruan, tanpa radius/border, alignment tengah-atas) */}
      <div className='flex flex-col items-center justify-start w-full pt-1.5'>
        <div className='w-full aspect-square flex items-center justify-center bg-white p-1.5'>
          <QRCode
            value={qrPayload}
            size={500}
            style={{ height: '100%', maxWidth: '100%', width: '100%' }}
            viewBox='0 0 256 256'
            level='M'
            fgColor='#0f172a'
            bgColor='#ffffff'
          />
        </div>

        {/* 3. Section Code Manual (Gap yang lebih proporsional & bernafas di bawah QR Code) */}
        <div className='w-full text-center mt-4 sm:mt-5 space-y-1'>
          <div className='flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Icons.clock className='size-3.5 text-primary' />
            <span>Rotasi otomatis:</span>
            <span className='font-mono font-bold text-foreground tabular-nums'>{timeLeft}s</span>
          </div>

          <div className='pt-0.5'>
            <div className='text-3xl sm:text-4xl font-black tracking-widest text-foreground font-mono leading-none'>
              {token}
            </div>
            <p className='text-[10.5px] text-muted-foreground mt-1.5'>
              {config.qr_validity || 'QR Code akan berubah setiap pergantian shift'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
