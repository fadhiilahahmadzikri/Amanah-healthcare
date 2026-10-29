'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWorkPoliciesCurrentQuery } from '../api/queries';
import { useUpdateCompensationRatesMutation } from '../api/mutations';
import type { StaffCategory } from '../api/types';

export interface PayrollRatesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryRateForm {
  hourlyRate: number;
  overtimeHourlyRate: number;
}

const CATEGORY_SECTIONS: Array<{
  category: StaffCategory;
  title: string;
  subtitle: string;
  defaultHourly: number;
  defaultOvertime: number;
}> = [
  {
    category: 'doctor',
    title: 'Dokter Spesialis & Umum',
    subtitle: 'Tarif jam dinas konsultasi dan insentif pengganti dokter jaga',
    defaultHourly: 20000,
    defaultOvertime: 30000
  },
  {
    category: 'midwife',
    title: 'Bidan & Tenaga Kebidanan',
    subtitle: 'Tarif shift dinas KIA, persalinan, dan insentif jaga pengganti',
    defaultHourly: 15000,
    defaultOvertime: 22500
  },
  {
    category: 'worker',
    title: 'Staf Operasional & Front Office',
    subtitle: 'Tarif jam kerja staf administrasi, kasir, farmasi, dan perawat',
    defaultHourly: 12000,
    defaultOvertime: 18000
  }
];

export function PayrollRatesConfigModal({ isOpen, onClose }: PayrollRatesConfigModalProps) {
  const { data: workPolicies, isLoading } = useWorkPoliciesCurrentQuery();
  const updateRatesMutation = useUpdateCompensationRatesMutation();
  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const [formRates, setFormRates] = useState<Record<StaffCategory, CategoryRateForm>>({
    doctor: { hourlyRate: 20000, overtimeHourlyRate: 30000 },
    midwife: { hourlyRate: 15000, overtimeHourlyRate: 22500 },
    worker: { hourlyRate: 12000, overtimeHourlyRate: 18000 }
  });

  // GSAP subtle entrance transition matching Doctor Schedule modal
  useEffect(() => {
    if (!isOpen || !contentContainerRef.current) return;
    gsap.fromTo(
      contentContainerRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
    );
  }, [isOpen]);

  // Populate from fetched rates
  useEffect(() => {
    if (workPolicies?.rates && workPolicies.rates.length > 0) {
      setFormRates((prev) => {
        const next = { ...prev };
        for (const item of workPolicies.rates) {
          if (item.category && next[item.category]) {
            next[item.category] = {
              hourlyRate: Number(item.hourlyRate) || next[item.category].hourlyRate,
              overtimeHourlyRate:
                Number(item.overtimeHourlyRate) || next[item.category].overtimeHourlyRate
            };
          }
        }
        return next;
      });
    }
  }, [workPolicies]);

  const handleRateChange = (
    category: StaffCategory,
    field: keyof CategoryRateForm,
    rawValue: string
  ) => {
    const parsed = parseInt(rawValue.replace(/\D/g, ''), 10) || 0;
    setFormRates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parsed
      }
    }));
  };

  const isSaving = updateRatesMutation.isPending;

  const handleSave = async () => {
    const payloadRates = Object.entries(formRates).map(([category, val]) => ({
      category: category as StaffCategory,
      hourlyRate: val.hourlyRate,
      overtimeHourlyRate: val.overtimeHourlyRate,
      notes: `Diperbarui via Web Dashboard pada ${new Date().toLocaleDateString('id-ID')}`
    }));

    try {
      await updateRatesMutation.mutateAsync({ rates: payloadRates });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const contentBody = (
    <div ref={contentContainerRef} className='space-y-4'>
      {/* Accounting Governance Banner */}
      <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5 text-xs'>
        <div className='font-semibold text-foreground flex items-center gap-1.5'>
          <Icons.info className='size-3.5 text-primary shrink-0' />
          <span>Prinsip Tata Kelola Tutup Buku (Accounting Governance)</span>
        </div>
        <p className='text-muted-foreground leading-relaxed text-[11px] max-w-2xl'>
          Perubahan tarif akan berlaku untuk kalkulasi <strong>periode baru</strong> atau periode
          berstatus <strong>terkalkulasi</strong> saat dihitung ulang. Periode yang telah{' '}
          <strong>ditutup buku (final)</strong> bersifat permanen dan tidak akan mengalami perubahan
          nilai historis.
        </p>
      </div>

      {/* 3 Vertical Stacked Cards */}
      <div className='flex flex-col gap-3.5'>
        {CATEGORY_SECTIONS.map((cat) => {
          const values = formRates[cat.category] || {
            hourlyRate: cat.defaultHourly,
            overtimeHourlyRate: cat.defaultOvertime
          };

          return (
            <div
              key={cat.category}
              className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'
            >
              <div className='flex flex-col gap-0.5'>
                <span className='font-semibold text-xs sm:text-sm text-foreground'>
                  {cat.title}
                </span>
                <p className='text-xs text-muted-foreground leading-relaxed max-w-lg'>
                  {cat.subtitle}
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40'>
                {/* Tarif Dasar Pokok */}
                <div className='flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20'>
                  <span className='text-xs font-medium text-foreground whitespace-nowrap'>
                    Tarif Dasar Pokok
                  </span>
                  <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 shrink-0 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                    <span className='px-2.5 h-full flex items-center text-[11px] font-semibold text-muted-foreground bg-muted/40 border-r border-border/50 select-none'>
                      Rp
                    </span>
                    <input
                      type='text'
                      inputMode='numeric'
                      aria-label={`Tarif Dasar Pokok ${cat.title}`}
                      value={values.hourlyRate.toLocaleString('id-ID')}
                      onChange={(e) => handleRateChange(cat.category, 'hourlyRate', e.target.value)}
                      disabled={isLoading || isSaving}
                      className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                    />
                    <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                      / jam
                    </span>
                  </div>
                </div>

                {/* Tarif Pengganti / Lembur */}
                <div className='flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20'>
                  <span className='text-xs font-medium text-foreground whitespace-nowrap'>
                    Tarif Pengganti / Lembur
                  </span>
                  <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 shrink-0 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                    <span className='px-2.5 h-full flex items-center text-[11px] font-semibold text-muted-foreground bg-muted/40 border-r border-border/50 select-none'>
                      Rp
                    </span>
                    <input
                      type='text'
                      inputMode='numeric'
                      aria-label={`Tarif Pengganti atau Lembur ${cat.title}`}
                      value={values.overtimeHourlyRate.toLocaleString('id-ID')}
                      onChange={(e) =>
                        handleRateChange(cat.category, 'overtimeHourlyRate', e.target.value)
                      }
                      disabled={isLoading || isSaving}
                      className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                    />
                    <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                      / jam
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={onClose}
        disabled={isSaving}
        className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
      >
        Tutup
      </Button>
      <Button
        type='button'
        variant='default'
        size='sm'
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
      >
        {isSaving ? (
          <>
            <Icons.spinner className='size-3.5 animate-spin mr-1' />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Simpan Perubahan</span>
        )}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className='max-h-[85vh] font-sans flex flex-col p-0 overflow-hidden'>
          <DrawerHeader className='shrink-0 text-left pb-3 border-b border-border/50 px-4 pt-3'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>Standar Tarif Kompensasi</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground max-w-md leading-normal'>
              Kelola tarif dasar pokok dan insentif pengganti dinas per jam kerja.
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-4'>{contentBody}</div>

          <DrawerFooter className='shrink-0 pt-3 border-t border-border/50 px-4 pb-4 flex flex-row items-center justify-between gap-2'>
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-3xl lg:max-w-4xl'
      className='max-h-[85vh] flex flex-col p-4 sm:p-5 overflow-hidden'
      showCloseButton={false}
      dismissible={!isSaving}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>Standar Tarif Kompensasi</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground max-w-md leading-normal'>
              Kelola tarif dasar pokok dan insentif pengganti dinas per jam kerja.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 space-y-4 pr-1'>{contentBody}</div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3 border-t border-border/50 flex items-center justify-between gap-2.5'>
          {footerButtons}
        </div>
      </div>
    </ModalWrapper>
  );
}
