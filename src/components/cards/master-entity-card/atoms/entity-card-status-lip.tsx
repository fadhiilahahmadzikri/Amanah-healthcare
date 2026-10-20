'use client';

import React from 'react';
import { PixelTexture } from '@/components/ui/pixel-texture';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/styles/clinical-tokens';
import type { EntityCardLipStyle, EntityCardStatusLipProps } from '../types';

export function resolveEntityCardLipStyle(status: string): EntityCardLipStyle {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'OPEN':
    case 'BUKA':
    case 'ACTIVE':
    case 'AKTIF':
    case 'HADIR':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/80',
        text: 'text-emerald-700 dark:text-emerald-400 font-bold',
        border: 'border-b border-emerald-500/20 dark:border-emerald-900/50',
        hex: 'var(--success)'
      };

    case 'ON_LEAVE':
    case 'LEAVE':
    case 'CUTI':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-950/80',
        text: 'text-sky-700 dark:text-sky-400 font-bold',
        border: 'border-b border-sky-500/20 dark:border-sky-900/50',
        hex: 'var(--info)'
      };

    case 'PENDING':
    case 'MENUNGGU':
    case 'MENUNGGU_VERIFIKASI':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/80',
        text: 'text-amber-700 dark:text-amber-400 font-bold',
        border: 'border-b border-amber-500/20 dark:border-amber-900/50',
        hex: 'var(--warning)'
      };

    case 'CLOSED':
    case 'TUTUP':
    case 'INACTIVE':
    case 'NONAKTIF':
    case 'NON_AKTIF':
    default:
      return {
        bg: 'bg-muted/60 dark:bg-zinc-900/85',
        text: 'text-muted-foreground dark:text-zinc-400 font-bold',
        border: 'border-b border-border/40 dark:border-zinc-800/60',
        hex: 'var(--muted-foreground)'
      };
  }
}

export function EntityCardStatusLip({ status, label, className }: EntityCardStatusLipProps) {
  const lipStyle = React.useMemo(() => resolveEntityCardLipStyle(status), [status]);
  const statusConfig = React.useMemo(() => getStatusConfig(status), [status]);
  const displayLabel = label || statusConfig.label;

  return (
    <div
      className={cn(
        'relative w-full h-8.5 sm:h-9 px-3 flex items-center justify-center overflow-hidden select-none transition-colors',
        lipStyle.bg,
        lipStyle.border,
        className
      )}
    >
      {/* Left Pixel Texture (Fades in from left to center) */}
      <div className='absolute left-0 top-0 bottom-0 w-28 sm:w-32 overflow-hidden pointer-events-none'>
        <PixelTexture
          colorMode='primary'
          primaryColor={lipStyle.hex}
          maskGradient='linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
          pixelSize={3.2}
          gap={1.2}
          opacity={0.65}
          className='opacity-55 dark:opacity-85'
        />
      </div>

      {/* Center Status Text (Natural casing, high contrast across light & dark modes) */}
      <span
        className={cn(
          'text-[11.5px] sm:text-xs tracking-tight relative z-10 select-none drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.05)]',
          lipStyle.text
        )}
      >
        {displayLabel}
      </span>

      {/* Right Pixel Texture (Fades in from right to center) */}
      <div className='absolute right-0 top-0 bottom-0 w-28 sm:w-32 overflow-hidden pointer-events-none'>
        <PixelTexture
          colorMode='primary'
          primaryColor={lipStyle.hex}
          maskGradient='linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
          pixelSize={3.2}
          gap={1.2}
          opacity={0.65}
          className='opacity-55 dark:opacity-85'
        />
      </div>
    </div>
  );
}
