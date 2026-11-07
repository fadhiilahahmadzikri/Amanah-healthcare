'use client';

import * as React from 'react';
import { CheckCircle2, FolderInput, Power, Unlink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApplicationPage } from '../types/role.types';

export interface PageFloatingBulkBarProps {
  selectedCount: number;
  availableCategories: ApplicationPage[];
  canManage: boolean;
  onMoveToCategory: (targetParentId: string | null) => void;
  onDetachSelected: () => void;
  onToggleStatus: (isEnabled: boolean) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function PageFloatingBulkBar({
  selectedCount,
  availableCategories,
  canManage,
  onMoveToCategory,
  onDetachSelected,
  onToggleStatus,
  onCancel,
  isPending = false
}: PageFloatingBulkBarProps) {
  if (selectedCount === 0 || !canManage) return null;

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-background/95 backdrop-blur-md border border-border/90 shadow-2xl rounded-full animate-in fade-in slide-in-from-bottom-4 font-sans select-none'>
      <span className='text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full shrink-0'>
        {selectedCount} halaman terpilih
      </span>

      <div className='h-4 w-px bg-border/80 shrink-0' />

      {/* Move to Category Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs gap-1.5 shrink-0 cursor-pointer font-medium'
            disabled={isPending}
          >
            <FolderInput className='size-3.5 text-primary' />
            <span>Pindahkan ke...</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center' side='top' className='w-56 text-xs font-sans'>
          <DropdownMenuLabel className='text-[11px] font-semibold text-muted-foreground'>
            Pilih Kategori Tujuan
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onMoveToCategory(null)}
            className='cursor-pointer text-xs font-medium'
          >
            Tanpa Kategori (Halaman Mandiri)
          </DropdownMenuItem>
          {availableCategories.length > 0 && <DropdownMenuSeparator />}
          {availableCategories.map((cat) => (
            <DropdownMenuItem
              key={cat.id}
              onClick={() => onMoveToCategory(cat.id)}
              className='cursor-pointer text-xs truncate'
            >
              {cat.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detach Selected to Standalone */}
      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1.5 shrink-0 cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-500/10'
        onClick={onDetachSelected}
        disabled={isPending}
        title='Lepaskan halaman terpilih dari folder induk menjadi halaman mandiri'
      >
        <Unlink className='size-3.5' />
        <span className='hidden sm:inline'>Keluarkan Semua</span>
      </Button>

      {/* Bulk Activate / Deactivate */}
      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1 shrink-0 cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10'
        onClick={() => onToggleStatus(true)}
        disabled={isPending}
        title='Aktifkan halaman terpilih di CMS'
      >
        <CheckCircle2 className='size-3.5' />
        <span className='hidden sm:inline'>Aktifkan</span>
      </Button>

      <Button
        size='sm'
        variant='outline'
        className='h-7 text-xs gap-1 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground'
        onClick={() => onToggleStatus(false)}
        disabled={isPending}
        title='Nonaktifkan halaman terpilih di CMS'
      >
        <Power className='size-3.5' />
        <span className='hidden sm:inline'>Nonaktifkan</span>
      </Button>

      <div className='h-4 w-px bg-border/80 shrink-0' />

      {/* Cancel selection */}
      <Button
        size='sm'
        variant='ghost'
        className='h-7 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer px-2'
        onClick={onCancel}
        disabled={isPending}
        title='Batalkan pilihan'
      >
        <X className='size-3.5 sm:mr-1' />
        <span className='hidden sm:inline'>Batal</span>
      </Button>
    </div>
  );
}
