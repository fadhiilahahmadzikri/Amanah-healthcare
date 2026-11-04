'use client';

import * as React from 'react';
import { CheckCircle2, Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ClinicEssentialsFloatingBulkBarProps {
  selectedCount: number;
  canManage: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function ClinicEssentialsFloatingBulkBar({
  selectedCount,
  canManage,
  onActivate,
  onDeactivate,
  onDelete,
  onCancel,
  isPending = false,
}: ClinicEssentialsFloatingBulkBarProps) {
  if (selectedCount === 0 || !canManage) return null;

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-background/95 backdrop-blur-md border shadow-lg rounded-full animate-in fade-in slide-in-from-bottom-4'>
      <span className='text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0'>
        {selectedCount} item terpilih
      </span>
      <div className='h-4 w-px bg-border shrink-0' />
      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0'
        onClick={onActivate}
        disabled={isPending}
      >
        <CheckCircle2 className='size-3.5' />
        <span className='hidden sm:inline'>Aktifkan</span>
      </Button>
      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 shrink-0'
        onClick={onDeactivate}
        disabled={isPending}
      >
        <Power className='size-3.5' />
        <span className='hidden sm:inline'>Nonaktifkan</span>
      </Button>
      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1 text-destructive hover:bg-destructive/10 shrink-0'
        onClick={onDelete}
        disabled={isPending}
      >
        <Trash2 className='size-3.5' />
        <span className='hidden sm:inline'>Hapus</span>
      </Button>
      <Button
        size='sm'
        variant='ghost'
        className='h-7 text-xs text-muted-foreground shrink-0'
        onClick={onCancel}
        disabled={isPending}
      >
        Batal
      </Button>
    </div>
  );
}
