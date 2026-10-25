'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ExportFormatMeta } from '../types';

interface ExportFormatCardProps {
  meta: ExportFormatMeta;
  disabled?: boolean;
  onSelect: () => void;
}

export function ExportFormatCard({ meta, disabled, onSelect }: ExportFormatCardProps) {
  const renderIcon = () => {
    switch (meta.format) {
      case 'pdf':
        return <Icons.fileTypePdf className='size-6 text-rose-600 dark:text-rose-400' />;
      case 'docx':
        return <Icons.fileTypeDoc className='size-6 text-blue-600 dark:text-blue-400' />;
      case 'xlsx':
        return <Icons.fileSpreadsheet className='size-6 text-emerald-600 dark:text-emerald-400' />;
      case 'csv':
        return <Icons.post className='size-6 text-sky-600 dark:text-sky-400' />;
    }
  };

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-border/70 bg-card/60 transition-all text-left shadow-2xs group',
        'hover:bg-accent/40 hover:border-primary/40 focus:outline-hidden focus:ring-2 focus:ring-primary/20',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Icon Badge */}
      <div
        className={cn(
          'size-11 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
          meta.accentColorClass.bg,
          meta.accentColorClass.badge
        )}
      >
        {renderIcon()}
      </div>

      {/* Text Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-xs sm:text-[13px] text-foreground tracking-tight'>
            {meta.label}
          </span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase tracking-wider',
              meta.accentColorClass.badge
            )}
          >
            {meta.shortLabel}
          </span>
        </div>
        <p className='text-[11px] text-muted-foreground mt-0.5 line-clamp-1'>{meta.description}</p>
      </div>

      {/* Trailing Icon */}
      <div className='shrink-0 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all'>
        <Icons.chevronRight className='size-4' />
      </div>
    </button>
  );
}
