'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ModernStyledQRCode } from './modern-styled-qr-code';
import { useQRStyleStore } from '../store/qr-style-store';
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
  // Global store subscriber for rotation interval (default 30s)
  const rotationInterval = useQRStyleStore((s) => s.rotationSeconds) || 30;
  const [timeLeft, setTimeLeft] = useState(rotationInterval);
  const [token, setToken] = useState(config.qr_code_identifier || 'K54TYU');

  const qrVisualRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLDivElement | null>(null);
  const indicatorDotRef = useRef<HTMLSpanElement | null>(null);
  const isAnimatingRef = useRef(false);

  // Sync timeLeft when rotationInterval is updated in settings
  useEffect(() => {
    setTimeLeft(rotationInterval);
  }, [rotationInterval]);

  // GSAP-powered smooth blur-pulse rotation transition
  const rotateQRCodeWithGSAP = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newCode = '';
    for (let i = 0; i < 6; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

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
        ease: 'power2.inOut',
        onComplete: () => {
          // Swap token and reset time at peak blur moment
          setToken(newCode);
          setTimeLeft(rotationInterval);
          onGenerateNewToken?.();
        }
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

      // 3. Pulse indicator ring animation
      if (indicatorDotRef.current) {
        tl.fromTo(
          indicatorDotRef.current,
          { scale: 1, boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.8)' },
          {
            scale: 1.3,
            boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'scale,boxShadow'
          },
          '<0.1'
        );
      }
    } else {
      setToken(newCode);
      setTimeLeft(rotationInterval);
      onGenerateNewToken?.();
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

  // Pure stable payload that only changes when token/shift changes (ZERO 1s flickering!)
  const qrPayload = React.useMemo(() => {
    return JSON.stringify({
      clinic: 'Amanah Healthcare',
      shift: config.qr_context || 'Shift Pagi',
      token: token
    });
  }, [config.qr_context, token]);

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
          <span
            ref={indicatorDotRef}
            className='size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0'
          />
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

      {/* 2. Direct Clean Styled Modern QR Code (Proporsional & Tidak Meluber) */}
      <div className='flex flex-col items-center justify-center w-full pt-1'>
        <div
          ref={qrVisualRef}
          className='w-full max-w-[320px] sm:max-w-[340px] aspect-square flex items-center justify-center bg-white p-2.5 overflow-hidden rounded-2xl border border-border/40 shadow-2xs will-change-transform mx-auto'
        >
          <ModernStyledQRCode data={qrPayload} size={320} className='w-full h-full' />
        </div>

        {/* 3. Section Code Manual (Gap yang lebih proporsional & bernafas di bawah QR Code) */}
        <div className='w-full text-center mt-4 sm:mt-5 space-y-1'>
          <div className='flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground'>
            <Icons.clock className='size-3.5 text-primary' />
            <span>Rotasi otomatis:</span>
            <span className='font-mono font-bold text-foreground tabular-nums'>{timeLeft}s</span>
          </div>

          <div ref={tokenRef} className='pt-0.5 will-change-transform'>
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
