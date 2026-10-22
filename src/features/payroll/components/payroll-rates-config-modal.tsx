'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useCompensationRatesQuery } from '../api/queries';
import { useUpdateCompensationRatesMutation } from '../api/mutations';
import { formatCurrency } from '../utils/currency';
import type { StaffCategory } from '../api/types';

export interface PayrollRatesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryRateForm {
  hourlyRate: number;
  overtimeHourlyRate: number;
}

const CATEGORY_CARDS: Array<{
  category: StaffCategory;
  label: string;
  badge: string;
  description: string;
  defaultHourly: number;
  defaultOvertime: number;
}> = [
  {
    category: 'doctor',
    label: 'Dokter',
    badge: 'Tenaga Medis',
    description: 'Tarif sesi praktik konsultasi dan insentif pengganti dokter jaga.',
    defaultHourly: 20000,
    defaultOvertime: 30000
  },
  {
    category: 'midwife',
    label: 'Bidan',
    badge: 'Kebidanan',
    description: 'Tarif dinas shift kebidanan dan lembur pengganti jadwal persalinan/jaga.',
    defaultHourly: 15000,
    defaultOvertime: 22500
  },
  {
    category: 'worker',
    label: 'Staf Operasional',
    badge: 'Administrasi & Umum',
    description: 'Tarif jam kerja staf administrasi, kasir, farmasi, dan operasional klinik.',
    defaultHourly: 12000,
    defaultOvertime: 18000
  }
];

export function PayrollRatesConfigModal({ isOpen, onClose }: PayrollRatesConfigModalProps) {
  const { data: rates = [], isLoading } = useCompensationRatesQuery();
  const updateRatesMutation = useUpdateCompensationRatesMutation();

  const [formRates, setFormRates] = useState<Record<StaffCategory, CategoryRateForm>>({
    doctor: { hourlyRate: 20000, overtimeHourlyRate: 30000 },
    midwife: { hourlyRate: 15000, overtimeHourlyRate: 22500 },
    worker: { hourlyRate: 12000, overtimeHourlyRate: 18000 }
  });

  // Populate from fetched rates
  useEffect(() => {
    if (rates.length > 0) {
      setFormRates((prev) => {
        const next = { ...prev };
        for (const item of rates) {
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
  }, [rates]);

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

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-4xl lg:max-w-5xl'
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
      dismissible={!updateRatesMutation.isPending}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3.5 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <Icons.settings className='size-5 text-muted-foreground shrink-0' />
              <span>Konfigurasi Standar Tarif Penggajian</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground font-medium'>
              Atur tarif dasar jam kerja dan insentif lembur/pengganti per kategori staf klinik.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1'>
          {/* Accounting Governance Banner */}
          <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5 text-xs'>
            <div className='flex items-center gap-1.5 font-semibold text-foreground'>
              <Icons.lock className='size-4 text-muted-foreground shrink-0' />
              <span>Prinsip Tata Kelola Tutup Buku (Accounting Governance)</span>
            </div>
            <p className='text-muted-foreground leading-relaxed text-[11px]'>
              Perubahan tarif akan berlaku untuk kalkulasi <strong>periode baru</strong> atau
              periode berstatus <strong>terkalkulasi</strong> saat dihitung ulang. Periode yang
              telah <strong>ditutup buku (final)</strong> bersifat permanen dan tidak akan mengalami
              perubahan nilai historis.
            </p>
          </div>

          {/* 3-Column Wide Cards Layout */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {CATEGORY_CARDS.map((cat) => {
              const values = formRates[cat.category] || {
                hourlyRate: cat.defaultHourly,
                overtimeHourlyRate: cat.defaultOvertime
              };

              return (
                <div
                  key={cat.category}
                  className='bg-card border border-border/60 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-xs hover:border-border transition-colors'
                >
                  <div className='space-y-2.5'>
                    <div>
                      <h4 className='text-sm font-bold text-foreground leading-tight'>
                        {cat.label}
                      </h4>
                      <span className='text-[10px] font-medium text-muted-foreground'>
                        {cat.badge}
                      </span>
                    </div>

                    <p className='text-[11px] text-muted-foreground leading-relaxed line-clamp-2'>
                      {cat.description}
                    </p>
                  </div>

                  <div className='space-y-3 pt-2 border-t border-border/40'>
                    {/* Hourly Rate */}
                    <div className='space-y-1'>
                      <Label
                        htmlFor={`rate-base-${cat.category}`}
                        className='text-[11px] font-medium text-muted-foreground'
                      >
                        Tarif dasar per jam
                      </Label>
                      <Input
                        id={`rate-base-${cat.category}`}
                        type='text'
                        inputMode='numeric'
                        value={values.hourlyRate}
                        onChange={(e) =>
                          handleRateChange(cat.category, 'hourlyRate', e.target.value)
                        }
                        className='h-8.5 text-xs font-mono rounded-lg'
                        placeholder='0'
                        disabled={isLoading}
                      />
                      <p className='text-[10px] text-muted-foreground font-medium pl-0.5'>
                        {formatCurrency(values.hourlyRate)} / jam
                      </p>
                    </div>

                    {/* Overtime Rate */}
                    <div className='space-y-1'>
                      <Label
                        htmlFor={`rate-ot-${cat.category}`}
                        className='text-[11px] font-medium text-muted-foreground'
                      >
                        Tarif lembur / pengganti per jam
                      </Label>
                      <Input
                        id={`rate-ot-${cat.category}`}
                        type='text'
                        inputMode='numeric'
                        value={values.overtimeHourlyRate}
                        onChange={(e) =>
                          handleRateChange(cat.category, 'overtimeHourlyRate', e.target.value)
                        }
                        className='h-8.5 text-xs font-mono rounded-lg'
                        placeholder='0'
                        disabled={isLoading}
                      />
                      <p className='text-[10px] text-muted-foreground font-medium pl-0.5'>
                        {formatCurrency(values.overtimeHourlyRate)} / jam
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={updateRatesMutation.isPending}
            className='px-4 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={updateRatesMutation.isPending || isLoading}
            className='px-5 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
          >
            {updateRatesMutation.isPending ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Icons.check className='size-3.5 mr-1' />
                <span>Simpan Perubahan Tarif</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
