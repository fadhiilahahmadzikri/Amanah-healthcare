'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { detectActiveAutofillDefinition } from './registry';
import type { AutofillDefinition } from './types';

export function DevAutofillToolbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeDef, setActiveDef] = React.useState<AutofillDefinition | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkActiveForm = () => {
      setActiveDef(detectActiveAutofillDefinition());
    };

    checkActiveForm();
    const interval = setInterval(checkActiveForm, 800);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFillFull = () => {
    if (!activeDef) {
      toast.error('Tidak ada form yang terdeteksi di layar.');
      return;
    }
    activeDef.fillFull();
    toast.success(`${activeDef.name} berhasil diisi lengkap.`);
    setIsOpen(false);
  };

  const handleFillCurrent = () => {
    if (!activeDef) {
      toast.error('Tidak ada form yang terdeteksi di layar.');
      return;
    }
    activeDef.fillCurrentStep();
    toast.success(`Langkah aktif ${activeDef.name} berhasil diisi.`);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (!activeDef) {
      toast.error('Tidak ada form yang terdeteksi di layar.');
      return;
    }
    activeDef.clear();
    toast.info(`Isi ${activeDef.name} dikosongkan.`);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      data-dev-autofill-toolbar
      className='fixed bottom-3 right-14 sm:right-16 z-[99998] select-none font-sans'
    >
      {isOpen ? (
        <div className='absolute bottom-11 right-0 w-72 rounded-2xl border border-border bg-card p-3 shadow-2xl backdrop-blur-md transition-all'>
          <div className='flex items-center justify-between border-b border-border/40 pb-2 mb-2.5'>
            <div className='flex items-center gap-1.5'>
              <Icons.sparkles className='size-3.5 text-amber-500 shrink-0' />
              <span className='text-xs font-semibold tracking-tight text-foreground'>
                Filling Otomatis
              </span>
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              aria-label='Tutup panel'
              className='cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
            >
              <Icons.close className='size-3.5' />
            </button>
          </div>

          <div className='mb-3'>
            {activeDef ? (
              <div className='flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400'>
                <span className='font-medium truncate'>{activeDef.name}</span>
                <span className='text-[10px] font-bold uppercase tracking-wider shrink-0 ml-1.5'>
                  Aktif
                </span>
              </div>
            ) : (
              <div className='rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground leading-snug'>
                Buka modal form (misal Persalinan) untuk mengaktifkan autofill.
              </div>
            )}
          </div>

          <div className='space-y-1.5'>
            <button
              type='button'
              disabled={!activeDef}
              onClick={handleFillFull}
              className='w-full cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Isi Seluruh Form (Full)
            </button>

            <button
              type='button'
              disabled={!activeDef}
              onClick={handleFillCurrent}
              className='w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40'
            >
              Isi Langkah Aktif Saja
            </button>

            <button
              type='button'
              disabled={!activeDef}
              onClick={handleClear}
              className='w-full cursor-pointer rounded-lg px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
            >
              Kosongkan / Reset Form
            </button>
          </div>
        </div>
      ) : null}

      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label='Toggle auto fill devtool'
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-2.5 text-xs font-medium text-foreground shadow-md backdrop-blur-md transition-all hover:border-primary/40 hover:bg-accent cursor-pointer',
          isOpen && 'border-primary ring-2 ring-primary/20 bg-accent'
        )}
      >
        <Icons.sparkles className='size-3.5 text-amber-500 shrink-0' />
        <span className='hidden sm:inline font-mono text-[11px] font-semibold'>AutoFill</span>
        <span
          className={cn(
            'size-1.5 rounded-full transition-colors',
            activeDef ? 'bg-emerald-500' : 'bg-muted-foreground/40'
          )}
        />
      </button>
    </div>
  );
}
