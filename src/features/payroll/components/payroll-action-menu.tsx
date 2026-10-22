'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export interface PayrollActionMenuProps {
  onOpenCalculate: () => void;
  onOpenConfirmFinalize: () => void;
  onOpenRates: () => void;
  onReconcileDailyLeave: () => void;
  onOpenAudit: () => void;
  onOpenExport?: () => void;
  canFinalize: boolean;
  isFinalizing?: boolean;
  isReconciling?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PayrollActionMenu({
  onOpenCalculate,
  onOpenConfirmFinalize,
  onOpenRates,
  onReconcileDailyLeave,
  onOpenAudit,
  onOpenExport,
  canFinalize,
  isFinalizing = false,
  isReconciling = false,
  disabled = false,
  className
}: PayrollActionMenuProps) {
  const { isOpen: isMobile } = useMediaQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const triggerButton = (
    <Button
      variant='outline'
      size='sm'
      disabled={disabled}
      aria-label='Buka Menu Aksi Penggajian'
      onClick={isMobile ? () => setIsDrawerOpen(true) : undefined}
      className={cn(
        'h-9 text-xs rounded-xl gap-2 px-3 border-border/80 font-medium text-foreground hover:bg-muted/60 transition-colors',
        className
      )}
    >
      <Icons.settings className='size-3.5 text-muted-foreground' />
      <span>Aksi Penggajian</span>
      <Icons.chevronDown className='size-3 text-muted-foreground ml-0.5' />
    </Button>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {triggerButton}

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className='font-sans max-h-[85vh]'>
            <DrawerHeader className='text-left pb-2'>
              <DrawerTitle className='text-base font-bold text-foreground'>
                Menu Aksi Penggajian
              </DrawerTitle>
              <DrawerDescription className='text-xs text-muted-foreground'>
                Kelola kalkulasi, unduh rekap, dan tata kelola tutup buku periode
              </DrawerDescription>
            </DrawerHeader>

            <div className='flex flex-col gap-2 p-4 pt-1'>
              {/* 1. Unduh Rekap Laporan */}
              {onOpenExport && (
                <button
                  type='button'
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenExport();
                  }}
                  className='w-full text-left p-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-3 cursor-pointer'
                >
                  <div className='size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0'>
                    <Icons.download className='size-4' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-primary'>Unduh Rekap Laporan</p>
                    <p className='text-[11px] text-muted-foreground'>
                      Ekspor dokumen rekapitulasi gaji periode (PDF / Excel / CSV)
                    </p>
                  </div>
                </button>
              )}

              {/* 2. Kalkulasi Baru */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenCalculate();
                }}
                className='w-full text-left p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center gap-3 cursor-pointer'
              >
                <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                  <Icons.plus className='size-4' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Kalkulasi Baru</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Hitung jam dinas, cuti, dan insentif periode baru
                  </p>
                </div>
              </button>

              {/* 3. Tutup Buku */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenConfirmFinalize();
                }}
                disabled={!canFinalize || isFinalizing}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer',
                  canFinalize
                    ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'border-border/40 opacity-50 cursor-not-allowed'
                )}
              >
                <div className='size-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0'>
                  <Icons.lock className='size-4' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Tutup Buku Periode</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Kunci nominal dan slip gaji staf permanen
                  </p>
                </div>
              </button>

              {/* 4. Konfigurasi Tarif */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenRates();
                }}
                className='w-full text-left p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center gap-3 cursor-pointer'
              >
                <div className='size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                  <Icons.settings className='size-4' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Konfigurasi Tarif</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Atur standar tarif dokter, bidan, dan staf
                  </p>
                </div>
              </button>

              {/* 5. Rekap Cuti Harian */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onReconcileDailyLeave();
                }}
                disabled={isReconciling}
                className='w-full text-left p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center gap-3 cursor-pointer'
              >
                <div className='size-8 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 flex items-center justify-center shrink-0'>
                  <Icons.refresh className={cn('size-4', isReconciling && 'animate-spin')} />
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Rekap Cuti Harian</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Sinkronkan pemotongan cuti disetujui on-demand
                  </p>
                </div>
              </button>

              {/* 6. Audit Mutasi */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenAudit();
                }}
                className='w-full text-left p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center gap-3 cursor-pointer'
              >
                <div className='size-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0'>
                  <Icons.receipt className='size-4' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-foreground'>Audit Mutasi</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Inspeksi riwayat mutasi komponen periode
                  </p>
                </div>
              </button>
            </div>

            <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsDrawerOpen(false)}
                className='w-full font-medium text-xs h-9 rounded-xl'
              >
                Tutup
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop DropdownMenu: Compact, Minimalist, Clean
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56 font-sans p-1.5 shadow-md rounded-xl'>
        <DropdownMenuLabel className='text-[11px] font-semibold text-muted-foreground px-2 py-1'>
          Aksi Penggajian
        </DropdownMenuLabel>

        {onOpenExport && (
          <>
            <DropdownMenuItem
              onClick={onOpenExport}
              className='cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium text-primary hover:text-primary'
            >
              <Icons.download className='size-3.5 text-primary shrink-0' />
              <span>Unduh Rekap Laporan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className='my-1' />
          </>
        )}

        <DropdownMenuItem
          onClick={onOpenCalculate}
          className='cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium'
        >
          <Icons.plus className='size-3.5 text-primary shrink-0' />
          <span>Kalkulasi Baru</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenConfirmFinalize}
          disabled={!canFinalize || isFinalizing}
          className={cn(
            'cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium',
            canFinalize && 'text-emerald-700 dark:text-emerald-400'
          )}
        >
          <Icons.lock className='size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
          <span>Tutup Buku Periode</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className='my-1' />

        <DropdownMenuItem
          onClick={onOpenRates}
          className='cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium'
        >
          <Icons.settings className='size-3.5 text-muted-foreground shrink-0' />
          <span>Konfigurasi Tarif</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onReconcileDailyLeave}
          disabled={isReconciling}
          className='cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium'
        >
          <Icons.refresh
            className={cn(
              'size-3.5 text-muted-foreground shrink-0',
              isReconciling && 'animate-spin'
            )}
          />
          <span>{isReconciling ? 'Menyinkronkan...' : 'Rekap Cuti Harian'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenAudit}
          className='cursor-pointer text-xs py-2 px-2.5 rounded-lg flex items-center gap-2.5 font-medium'
        >
          <Icons.receipt className='size-3.5 text-muted-foreground shrink-0' />
          <span>Audit Mutasi</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
