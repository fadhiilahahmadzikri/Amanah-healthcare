'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { QRPresenceConfig } from '../api/types';

interface QRPresenceCardProps {
  config: QRPresenceConfig;
  onGenerateNewToken?: () => void;
  onCloseCard?: () => void;
  className?: string;
}

export function QRPresenceCard({
  config,
  onGenerateNewToken,
  onCloseCard,
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
        'p-3.5 sm:p-4 bg-card text-card-foreground border border-border/60 shadow-xs flex flex-col font-sans select-none rounded-[20px] h-full justify-start relative space-y-2.5',
        className
      )}
    >
      {/* 1. Header Minimalis: Status Aktif, Pill Shift, dan Tombol Refresh/Close */}
      <div className='flex items-center justify-between gap-2 pb-1.5 border-b border-border/40'>
        {/* Status Aktif */}
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse' />
          <span className='text-xs font-semibold text-foreground'>
            {config.status_presensi || 'Aktif hingga 16:00 WIB'}
          </span>
        </div>

        {/* Shift Pill & Aksi */}
        <div className='flex items-center gap-1.5'>
          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'>
            {config.qr_context || 'Shift Pagi'}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => {
              generateNewCode();
              toast.info('QR Code diperbarui.');
            }}
            title='Segarkan QR'
            className='h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground'
          >
            <Icons.refresh className='size-3' />
          </Button>
          {onCloseCard && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onCloseCard}
              title='Tutup / Sembunyikan QR'
              className='h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='size-3' />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Extra Large QR Code Container (Memenuhi kartu sesuai kotak merah) */}
      <div className='flex flex-col items-center text-center space-y-2 pt-0.5'>
        <div className='p-1.5 sm:p-2 bg-white dark:bg-white rounded-2xl flex items-center justify-center w-full max-w-[330px] aspect-square shadow-2xs'>
          <QRCode
            value={qrPayload}
            size={310}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            viewBox='0 0 256 256'
            level='M'
            fgColor='#0f172a'
            bgColor='#ffffff'
          />
        </div>

        {/* 3. Rotasi Otomatis Timer & Identifier Token Code */}
        <div className='space-y-0.5 w-full'>
          <div className='flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Icons.clock className='size-3.5 text-primary' />
            <span>Rotasi otomatis:</span>
            <span className='font-mono font-bold text-foreground tabular-nums'>{timeLeft}s</span>
          </div>

          <div className='pt-0.5'>
            <div className='text-3xl sm:text-4xl font-bold tracking-widest text-foreground font-mono'>
              {token}
            </div>
            <p className='text-[11px] text-muted-foreground'>
              {config.qr_validity || 'QR Code akan berubah setiap pergantian shift'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
