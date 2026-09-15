'use client';

import React, { useLayoutEffect, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Icons } from '@/components/icons';
import { QueueQrPod } from './queue-qr-pod';
import { QueuePixelTexture } from './queue-pixel-texture';
import { QueueClippathToaster } from './queue-clippath-toaster';
import { QueueWaitingRoomSvg } from './queue-waiting-room-svg';
import { cn } from '@/lib/utils';

export interface QueueTicketCardProps {
  queueNumber?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  timeSlot?: string;
  bookingCode?: string;
  patientName?: string;
  roomName?: string;
  illustrationSrc?: string;
  userAvatars?: string[];
  onClose?: () => void;
  onDownload?: () => void;
  onViewLiveQueue?: () => void;
  onToasterClick?: () => void;
  autoAnimate?: boolean;
  autoConfetti?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
];

// Safe useLayoutEffect for SSR / Client
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function QueueTicketCard({
  queueNumber = 'A-001',
  serviceName = 'Poli Penyakit Dalam',
  doctorName = 'dr. Sarah Putri, Sp.PD',
  dateStr = 'Jumat, 21 Ags 2026',
  timeSlot = '09:30 WIB',
  bookingCode = 'KLINIK-8R4NM',
  patientName = 'Rian Hidayat',
  roomName = 'Room 201',
  userAvatars = DEFAULT_AVATARS,
  onClose,
  onDownload,
  onViewLiveQueue,
  onToasterClick,
  autoAnimate = true,
  autoConfetti = true,
  className,
  style
}: QueueTicketCardProps) {
  // Extract start hour or session info cleanly
  const displayTime = useMemo(() => {
    if (!timeSlot) return '09:30 WIB';
    const timeMatch = timeSlot.match(/(\d{1,2}[:.]\d{2})/);
    const sessionMatch = timeSlot.match(/Sesi\s+[A-Za-z]+/i);
    if (sessionMatch && timeMatch) {
      return `${sessionMatch[0]} (${timeMatch[1].replace('.', ':')} WIB)`;
    }
    const startPart = timeSlot.split('-')[0].trim().replace(/wib/i, '').trim();
    return startPart ? `${startPart} WIB` : timeSlot;
  }, [timeSlot]);

  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const illustrationWrapperRef = useRef<HTMLDivElement>(null);
  const notchRef = useRef<HTMLDivElement>(null);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRowRef = useRef<HTMLDivElement>(null);
  const pixelPatternRef = useRef<HTMLDivElement>(null);
  const layer2BtnRef = useRef<HTMLButtonElement>(null);

  // Trigger Multi-burst Confetti
  const triggerConfettiExplosion = () => {
    try {
      const count = 200;
      const defaults = { origin: { y: 0.6 } };
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#0284c7', '#00ba58', '#8b5cf6', '#f59e0b', '#0ea5e9']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#0284c7', '#00ba58', '#8b5cf6', '#f59e0b', '#0ea5e9']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#0284c7', '#00ba58', '#8b5cf6', '#f59e0b', '#0ea5e9']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#0284c7', '#00ba58', '#8b5cf6', '#f59e0b', '#0ea5e9']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#0284c7', '#00ba58', '#8b5cf6', '#f59e0b', '#0ea5e9']
      });
    } catch {
      // Fallback
    }
  };

  // Instant pre-paint layout setup to eliminate any flash
  useIsomorphicLayoutEffect(() => {
    if (!autoAnimate) return;

    if (cardWrapperRef.current) {
      gsap.set(cardWrapperRef.current, { opacity: 0 });
    }
    if (layer1Ref.current) {
      gsap.set(layer1Ref.current, { opacity: 0, y: 30, scale: 0.95 });
    }
    if (notchRef.current) {
      gsap.set(notchRef.current, { y: -60, opacity: 0 });
    }
    if (layer2BtnRef.current) {
      gsap.set(layer2BtnRef.current, { y: -24, opacity: 0 });
    }
    if (illustrationWrapperRef.current) {
      gsap.set(illustrationWrapperRef.current, { opacity: 0, scale: 1.08 });
    }
    if (infoContentRef.current) {
      gsap.set(infoContentRef.current, { opacity: 0, y: 15 });
    }
  }, [autoAnimate]);

  // Snappy, synchronized GSAP entrance animation
  useEffect(() => {
    if (!autoAnimate) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (autoConfetti) {
            triggerConfettiExplosion();
          }
        }
      });

      // 1. Reveal wrapper cleanly
      tl.set(cardWrapperRef.current, { opacity: 1 });

      // 2. Layer 1 Card Enters swiftly
      if (layer1Ref.current) {
        tl.to(layer1Ref.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out'
        });
      }

      // 3. 3D Illustration & Info content reveal in parallel
      if (illustrationWrapperRef.current) {
        tl.to(
          illustrationWrapperRef.current,
          { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' },
          '-=0.3'
        );
      }

      if (infoContentRef.current) {
        tl.to(
          infoContentRef.current,
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          '-=0.3'
        );
      }

      // 4. Toaster Notch slides down crisp and fast
      if (notchRef.current) {
        tl.to(notchRef.current, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, '-=0.25');
      }

      // 5. Layer 2 Bottom Button slides down into position
      if (layer2BtnRef.current) {
        tl.to(
          layer2BtnRef.current,
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' },
          '-=0.15'
        );
      }
    }, cardWrapperRef);

    return () => ctx.revert();
  }, [autoAnimate, autoConfetti]);

  const handleClose = () => {
    if (onClose) {
      const tl = gsap.timeline({
        onComplete: onClose
      });
      tl.to([notchRef.current, layer2BtnRef.current], {
        opacity: 0,
        y: -15,
        duration: 0.15,
        ease: 'power2.in'
      });
      tl.to(
        layer1Ref.current,
        { opacity: 0, scale: 0.95, y: 20, duration: 0.2, ease: 'power2.in' },
        '-=0.08'
      );
    }
  };

  return (
    <div
      ref={cardWrapperRef}
      style={{ opacity: 0, ...style }}
      className={cn(
        'relative w-full max-w-[360px] mx-auto flex flex-col items-center select-none font-sans',
        className
      )}
    >
      {/* ==================================================================== */}
      {/* LAYER 1 (KARTU ATAS UTUH: TOASTER + GAMBAR SVG + INFO TENGAH - ALWAYS PURE CRISP WHITE) */}
      {/* ==================================================================== */}
      <div
        ref={layer1Ref}
        className='relative z-10 w-full rounded-[32px] overflow-hidden flex flex-col bg-white text-slate-900 border border-white/80 shadow-[0_0_0_1.5px_#ffffff,0_1px_0_0_#ffffff_inset,0_4px_8px_0_rgba(0,0,0,0.03),0_20px_38px_-8px_rgba(15,23,42,0.12),0_1px_6px_-4px_rgba(0,0,0,0.35)] dark:shadow-[0_0_0_1.5px_rgba(255,255,255,0.25),0_20px_45px_-8px_rgba(0,0,0,0.8),0_0_35px_rgba(255,255,255,0.1)]'
      >
        {/* Top-Right Close (X) Action Button (Unwrapped Icon) */}
        {onClose && (
          <button
            ref={closeBtnRef}
            type='button'
            onClick={handleClose}
            aria-label='Tutup Kartu'
            className='absolute top-4 right-4 z-25 p-1 text-slate-400 hover:text-slate-800 transition-all hover:scale-110 active:scale-95 cursor-pointer'
          >
            <Icons.close className='size-[18px] stroke-[2.2]' />
          </button>
        )}

        {/* Top Area (Image & Toaster Box) */}
        <div className='relative w-full h-[330px] overflow-hidden bg-gradient-to-b from-[#f8fbfe] via-[#f1f7fc] to-[#fafbfc]'>
          {/* Connected Top Notch Toaster via pure SVG ClipPath & Shape */}
          <QueueClippathToaster
            ref={notchRef}
            onClick={onToasterClick}
            title='Antrean berhasil dibuat'
          />

          {/* 3D Isometric SVG Illustration as Native Theme-Driven React Component */}
          <div ref={illustrationWrapperRef} className='w-full h-full'>
            <QueueWaitingRoomSvg />
          </div>
        </div>

        {/* Section Informasi Tengah dengan Soft Backdrop Blur (Always Pure White) */}
        <div
          ref={infoContentRef}
          className='-mt-[85px] px-6 pt-[50px] pb-8 rounded-b-[32px] flex flex-col relative z-5 backdrop-blur-md bg-gradient-to-b from-white/0 via-white/85 to-[#ffffff] text-slate-900'
        >
          {/* Card Header Row (Clinic Pill + Download Action Icon) */}
          <div
            ref={headerRowRef}
            className='flex items-end justify-between mb-3 -translate-y-2 relative z-6'
          >
            {/* Clinic Pill */}
            <div className='inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs'>
              <div
                style={{ backgroundColor: 'var(--primary)' }}
                className='size-1.5 rounded-full ring-2 ring-primary/30'
              />
              <span className='text-xs font-semibold text-slate-700 tracking-tight'>
                {serviceName}
              </span>
            </div>

            {/* Download E-Ticket Icon Button */}
            {onDownload && (
              <button
                type='button'
                onClick={onDownload}
                title='Download e-tiket'
                style={{ color: 'var(--primary)' }}
                className='p-1 hover:opacity-75 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-90 cursor-pointer'
              >
                <Icons.download className='size-[18px] stroke-[2.2]' />
              </button>
            )}
          </div>

          {/* Headline: Nomor Antrean Hero (Theme-Aware Color) */}
          <h1
            ref={titleRef}
            style={{ color: 'var(--primary)' }}
            className='text-[23px] font-bold tracking-[-0.7px] leading-tight mb-3.5'
          >
            Antrean {queueNumber}
          </h1>

          {/* Booking Metadata & QR Code Section */}
          <div
            ref={metaRowRef}
            className='flex items-end justify-between gap-4 relative z-2 mb-1.5'
          >
            {/* Text Details */}
            <div className='flex flex-col gap-0.5 min-w-0'>
              <span className='text-[13px] font-medium text-slate-500 tracking-tight'>
                Tanggal Reservasi:
              </span>
              <div className='text-[13.5px] font-semibold text-slate-800 tracking-tight flex items-center leading-snug truncate'>
                <span>{dateStr}</span>
                <span className='inline-block w-px h-3 bg-slate-300 mx-1.5 shrink-0' />
                <span style={{ color: 'var(--primary)' }} className='font-mono font-bold'>
                  {displayTime}
                </span>
              </div>
              <span className='text-[13px] font-medium text-slate-600 tracking-tight truncate'>
                {doctorName}
              </span>
            </div>

            {/* Elevated QR Code Pod */}
            <QueueQrPod code={bookingCode} />
          </div>

          {/* Decorative Pixel Grid Pattern Texture at Bottom with Luminous Theme Pixels */}
          <div ref={pixelPatternRef}>
            <QueuePixelTexture opacity={0.55} />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* LAYER 2 (KARTU BAWAH: TOMBOL AKSI TERPISAH DENGAN AVATAR STACK - THEME DYNAMIC) */}
      {/* ==================================================================== */}
      <button
        ref={layer2BtnRef}
        type='button'
        onClick={onViewLiveQueue}
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground, #ffffff)',
          backgroundImage: `
            radial-gradient(1.2px 1.2px at 16% 65%, rgba(255, 255, 255, 0.7) 100%, transparent),
            radial-gradient(1.5px 1.5px at 82% 55%, rgba(255, 255, 255, 0.8) 100%, transparent),
            radial-gradient(1px 1px at 50% 82%, rgba(255, 255, 255, 0.5) 100%, transparent),
            linear-gradient(180deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 75%, black) 100%)
          `
        }}
        className='relative z-1 w-full -mt-[30px] pt-[46px] pb-4.5 px-5 rounded-b-[32px] border-none flex items-center justify-center gap-2 font-bold text-[15px] cursor-pointer text-decoration-none shadow-[0_0_0_1px_rgba(255,255,255,0.45),0_1px_0_0_rgba(255,255,255,0.35)_inset,0_4px_12px_0_rgba(15,23,42,0.08),0_12px_24px_-6px_rgba(15,23,42,0.12),0_1px_6px_-4px_rgba(0,0,0,0.3)] hover:brightness-105 hover:translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 group'
      >
        {/* User Avatar Group Stack */}
        <div className='flex items-center -mr-0.5'>
          {userAvatars.map((avatarUrl, idx) => (
            <div
              key={idx}
              className={cn(
                'size-[22px] rounded-full border-[1.5px] border-white overflow-hidden shadow-xs shrink-0',
                idx > 0 && '-ml-1.5'
              )}
            >
              <Image
                src={avatarUrl}
                alt={`User ${idx + 1}`}
                width={22}
                height={22}
                unoptimized
                className='w-full h-full object-cover'
              />
            </div>
          ))}
        </div>

        <span className='tracking-tight ml-1 text-inherit'>Lihat Antrean Live</span>

        <Icons.arrowRight className='size-4 text-inherit stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1.5' />
      </button>
    </div>
  );
}
