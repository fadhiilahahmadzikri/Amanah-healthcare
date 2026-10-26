'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ModernStyledQRCode } from './modern-styled-qr-code';
import { AttendanceDigitalClock } from './attendance-digital-clock';
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
  // Dynamic rotation interval from backend config
  const rotationInterval = config.rotation_seconds || 30;
  const maxSessionSeconds = rotationInterval + 15;

  // Calculate remaining seconds from backend validUntil timestamp (persists across page refresh)
  const computeRemainingSeconds = useCallback(() => {
    const validUntilIso = config.validUntil;
    if (validUntilIso) {
      const targetTime = new Date(validUntilIso).getTime();
      const diffSec = Math.max(0, Math.round((targetTime - Date.now()) / 1000));
      return Math.min(diffSec, maxSessionSeconds);
    }
    return rotationInterval;
  }, [config.validUntil, rotationInterval, maxSessionSeconds]);

  const [timeLeft, setTimeLeft] = useState(computeRemainingSeconds);
  const [token, setToken] = useState(config.qr_code_identifier || '');

  const qrVisualRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);

  // Sync timeLeft when config (e.g. validUntil or rotation_seconds) changes
  useEffect(() => {
    setTimeLeft(computeRemainingSeconds());
  }, [computeRemainingSeconds]);

  useEffect(() => {
    setToken(config.qr_code_identifier || '');
  }, [config.qr_code_identifier]);

  // GSAP-powered smooth blur-pulse rotation transition
  const rotateQRCodeWithGSAP = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Trigger backend QR rotation mutation
    onGenerateNewToken?.();
    setTimeLeft(rotationInterval);

    if (qrVisualRef.current && tokenRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      });

      // 1. Phase 1: Smooth blur, shrink, and fade out
      tl.to([qrVisualRef.current, tokenRef.current], {
        scale: 0.93,
        filter: 'blur(10px)',
        opacity: 0.35,
        duration: 0.28,
        ease: 'power2.inOut'
      })
        // 2. Phase 2: Unblur, spring scale up with clean bounce
        .to([qrVisualRef.current, tokenRef.current], {
          scale: 1,
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.42,
          ease: 'back.out(1.4)',
          clearProps: 'filter,transform'
        });
    } else {
      isAnimatingRef.current = false;
    }
  }, [rotationInterval, onGenerateNewToken]);

  // Robust, pure 1-second countdown interval (no side-effects inside state updater)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When countdown hits 0, trigger GSAP rotation smoothly
  useEffect(() => {
    if (timeLeft === 0) {
      rotateQRCodeWithGSAP();
    }
  }, [timeLeft, rotateQRCodeWithGSAP]);

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

  // Pure stable payload that directly encodes the token code (ZERO 1s flickering!)
  const qrPayload = React.useMemo(() => {
    return token || '';
  }, [token]);

  return (
    <Card
      className={cn(
        'p-2.5 sm:p-3 gap-0 bg-card text-card-foreground border border-border/60 shadow-xs flex flex-col font-sans select-none rounded-[var(--radius)] h-full overflow-hidden justify-start relative',
        className
      )}
    >
      {/* 1. Header Minimalis: Jam Digital Realtime dan Tombol Presensi Manual/Refresh/Popout/Close (Fixed / Non-Scrolling) */}
      <div className='flex items-center justify-between gap-1.5 pb-2 border-b border-border/40 shrink-0 w-full min-w-0'>
        {/* Real-time Clock (Menggantikan indikator status aktif) */}
        <div className='flex items-center gap-1.5 min-w-0 shrink'>
          <AttendanceDigitalClock className='h-7 px-2 text-[11px] bg-muted/50 border-border/50' />
        </div>

        {/* Aksi Toolbars */}
        <div className='flex items-center gap-1 shrink-0'>
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
                  <Icons.fingerprint className='size-3.5' />
                  <span className='sr-only'>Presensi Manual Pegawai</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' className='text-xs font-medium'>
                Presensi Manual Pegawai
              </TooltipContent>
            </Tooltip>
          )}

          {/* Tombol Keluarkan Panel (Popout Independent Window) dengan Tooltip - Hidden on Mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handlePopout}
                className='size-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 hidden sm:inline-flex'
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
                  rotateQRCodeWithGSAP();
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

      {/* 2. Direct Large Edge-to-Edge QR Code with Inner Scroll Support (Hanya konten ini yang scroll jika overflow) */}
      <div className='flex-1 flex flex-col items-center justify-start w-full min-h-0 overflow-y-auto py-2'>
        <div
          ref={qrVisualRef}
          className='w-full max-w-full aspect-square flex items-center justify-center will-change-transform shrink-0'
        >
          <ModernStyledQRCode data={qrPayload} size={520} className='w-full h-full' />
        </div>

        {/* 3. Section Code Random (Atas) & Countdown Rotasi (Bawah) */}
        <div className='w-full text-center mt-3 sm:mt-4 space-y-1 px-2 shrink-0'>
          <div ref={tokenRef} className='will-change-transform'>
            <div className='text-3xl sm:text-4xl font-black tracking-widest text-foreground font-mono leading-none'>
              {token || '-'}
            </div>
          </div>

          <div className='text-xs font-mono font-bold text-muted-foreground tabular-nums pt-1'>
            {timeLeft}s
          </div>
        </div>
      </div>
    </Card>
  );
}
