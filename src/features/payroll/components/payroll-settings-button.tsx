'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface PayrollSettingsButtonProps {
  onOpenRates: () => void;
  onOpenTiming: () => void;
  onReconcileDailyLeave: () => void;
  onOpenAudit: () => void;
  onOpenConfirmFinalize: () => void;
  canFinalize: boolean;
  isFinalizing?: boolean;
  isReconciling?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
  forceMode?: 'dropdown' | 'drawer';
}

export function PayrollSettingsButton({
  onOpenRates,
  onOpenTiming,
  onReconcileDailyLeave,
  onOpenAudit,
  onOpenConfirmFinalize,
  canFinalize,
  isFinalizing = false,
  isReconciling = false,
  disabled = false,
  className,
  variant = 'outline',
  forceMode
}: PayrollSettingsButtonProps) {
  const { isOpen: isMobile } = useMediaQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const shouldUseDrawer = forceMode === 'drawer' || (forceMode !== 'dropdown' && isMobile);

  const triggerButton = (
    <Button
      variant={variant}
      size='icon'
      disabled={disabled}
      aria-label='Buka Pengaturan Gaji'
      onClick={shouldUseDrawer ? () => setIsDrawerOpen(true) : undefined}
      className={cn(
        'h-8 w-8 text-muted-foreground hover:text-foreground border-border/80 shrink-0 transition-colors',
        className
      )}
      title='Pengaturan Gaji'
    >
      <Icons.settings className='size-3.5' />
    </Button>
  );

  // Mobile Drawer
  if (shouldUseDrawer) {
    return (
      <>
        {triggerButton}

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className='max-h-[85vh] font-sans'>
            <DrawerHeader className='text-left pb-2'>
              <DrawerTitle className='text-base font-bold text-foreground'>
                Pengaturan Gaji
              </DrawerTitle>
              <DrawerDescription className='text-xs text-muted-foreground'>
                Atur tarif, jam kerja, sinkronisasi cuti, dan tutup buku periode
              </DrawerDescription>
            </DrawerHeader>

            <div className='flex flex-col gap-2 p-4 pt-1'>
              {/* 1. Standar Tarif */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenRates();
                }}
                aria-label='Tarif gaji per jabatan'
                className='w-full text-left p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='size-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                    <Icons.settings className='size-4 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                      Tarif Gaji
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      Atur gaji pokok dan lembur per jam tiap jabatan staf
                    </p>
                  </div>
                </div>
              </button>

              {/* 2. Standar Jam Kerja & Pembulatan Dinas */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenTiming();
                }}
                aria-label='Aturan jam kerja dan pembulatan'
                className='w-full text-left p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='size-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                    <Icons.clock className='size-4 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                      Aturan Jam Kerja
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      Syarat minimal menit kerja dan kelipatan pembulatan dinas
                    </p>
                  </div>
                </div>
              </button>

              {/* 3. Rekonsiliasi Cuti Harian */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onReconcileDailyLeave();
                }}
                disabled={isReconciling}
                aria-label='Sinkronkan potongan cuti'
                className='w-full text-left p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='size-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                    {isReconciling ? (
                      <Icons.spinner className='size-4 text-muted-foreground animate-spin' />
                    ) : (
                      <Icons.calendar className='size-4 text-muted-foreground' />
                    )}
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                      Sinkronkan Cuti
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      Sinkronkan pemotongan upah staf yang izin atau cuti
                    </p>
                  </div>
                </div>
              </button>

              {/* 4. Audit Mutasi */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenAudit();
                }}
                aria-label='Rincian mutasi gaji'
                className='w-full text-left p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='size-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                    <Icons.receipt className='size-4 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                      Rincian Mutasi Gaji
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      Lihat riwayat penambahan atau potongan gaji staf
                    </p>
                  </div>
                </div>
              </button>

              {/* 5. Tutup Buku Periode */}
              <button
                type='button'
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenConfirmFinalize();
                }}
                disabled={!canFinalize || isFinalizing}
                aria-label='Tutup buku periode'
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between cursor-pointer group',
                  canFinalize
                    ? 'border-border/60 hover:bg-muted/50'
                    : 'border-border/40 opacity-50 cursor-not-allowed bg-muted/20'
                )}
              >
                <div className='flex items-center gap-3'>
                  <div className='size-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0'>
                    {isFinalizing ? (
                      <Icons.spinner className='size-4 text-muted-foreground animate-spin' />
                    ) : (
                      <Icons.lock className='size-4 text-muted-foreground' />
                    )}
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-foreground group-hover:text-primary transition-colors'>
                      Tutup Buku Periode
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      {canFinalize
                        ? 'Kunci nominal dan slip gaji periode ini permanen'
                        : 'Kalkulasi periode terlebih dahulu sebelum menutup buku'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40 flex flex-row justify-end'>
              <Button
                type='button'
                size='sm'
                onClick={() => setIsDrawerOpen(false)}
                className='h-8 text-xs font-medium px-4 ml-auto cursor-pointer'
              >
                Tutup
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop DropdownMenu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52 font-sans p-1'>
        <DropdownMenuItem
          onClick={onOpenRates}
          className='cursor-pointer text-xs py-2 flex items-center justify-between'
        >
          <div className='flex items-center gap-2'>
            <Icons.settings className='size-3.5 text-muted-foreground shrink-0' />
            <span>Tarif Gaji</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenTiming}
          className='cursor-pointer text-xs py-2 flex items-center justify-between'
        >
          <div className='flex items-center gap-2'>
            <Icons.clock className='size-3.5 text-muted-foreground shrink-0' />
            <span>Aturan Jam Kerja</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onReconcileDailyLeave}
          disabled={isReconciling}
          className='cursor-pointer text-xs py-2 flex items-center justify-between'
        >
          <div className='flex items-center gap-2'>
            {isReconciling ? (
              <Icons.spinner className='size-3.5 text-muted-foreground animate-spin shrink-0' />
            ) : (
              <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            )}
            <span>Sinkronkan Cuti</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenAudit}
          className='cursor-pointer text-xs py-2 flex items-center justify-between'
        >
          <div className='flex items-center gap-2'>
            <Icons.receipt className='size-3.5 text-muted-foreground shrink-0' />
            <span>Rincian Mutasi Gaji</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onOpenConfirmFinalize}
          disabled={!canFinalize || isFinalizing}
          className={cn(
            'cursor-pointer text-xs py-2 flex items-center justify-between',
            !canFinalize && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className='flex items-center gap-2'>
            {isFinalizing ? (
              <Icons.spinner className='size-3.5 text-muted-foreground animate-spin shrink-0' />
            ) : (
              <Icons.lock className='size-3.5 text-muted-foreground shrink-0' />
            )}
            <span>Tutup Buku Periode</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
