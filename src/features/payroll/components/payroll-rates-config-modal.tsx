'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useCompensationRatesQuery } from '../api/queries';
import { useUpdateCompensationRatesMutation } from '../api/mutations';
import { formatCurrency } from '../utils/currency';
import type { StaffCategory } from '../api/types';

interface PayrollRatesConfigModalProps {
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
  badgeColor: string;
  description: string;
  icon: keyof typeof Icons;
  defaultHourly: number;
  defaultOvertime: number;
}> = [
  {
    category: 'doctor',
    label: 'Dokter',
    badge: 'Tenaga Medis Utama',
    badgeColor:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/50',
    description: 'Tarif sesi praktik konsultasi dan insentif pengganti dokter jaga.',
    icon: 'userCheck',
    defaultHourly: 20000,
    defaultOvertime: 30000
  },
  {
    category: 'midwife',
    label: 'Bidan',
    badge: 'Tenaga Kebidanan',
    badgeColor:
      'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/50',
    description: 'Tarif dinas shift kebidanan dan lembur pengganti jadwal persalinan/jaga.',
    icon: 'heart',
    defaultHourly: 15000,
    defaultOvertime: 22500
  },
  {
    category: 'worker',
    label: 'Staf Operasional',
    badge: 'Umum & Administrasi',
    badgeColor:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50',
    description: 'Tarif jam kerja staf administrasi, kasir, farmasi, dan operasional klinik.',
    icon: 'users',
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-xl p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <DialogHeader className='p-5 border-b border-border/60 shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.settings className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                Konfigurasi Standar Tarif Payroll
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Atur tarif dasar jam kerja dan insentif lembur/pengganti per kategori staf.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className='p-5 space-y-4 overflow-y-auto'>
          {/* Closed-Book Accounting Governance Notice */}
          <div className='p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-xl space-y-1.5 text-xs'>
            <div className='flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-300'>
              <Icons.lock className='size-4 text-sky-600 dark:text-sky-400 shrink-0' />
              <span>Prinsip Tata Kelola Tutup Buku (Accounting Governance)</span>
            </div>
            <p className='text-sky-800/90 dark:text-sky-300/80 leading-relaxed text-[11px]'>
              Perubahan tarif akan berlaku untuk kalkulasi <strong>periode baru</strong> atau
              periode berstatus <strong>TERKALKULASI</strong> saat dihitung ulang. Periode yang
              telah <strong>DITUTUP BUKU (FINAL)</strong> bersifat permanen dan tidak akan mengalami
              perubahan nilai.
            </p>
          </div>

          {/* Category Input Cards */}
          <div className='space-y-3'>
            {CATEGORY_CARDS.map((cat) => {
              const IconComponent = Icons[cat.icon] || Icons.user;
              const values = formRates[cat.category] || {
                hourlyRate: cat.defaultHourly,
                overtimeHourlyRate: cat.defaultOvertime
              };

              return (
                <div
                  key={cat.category}
                  className='bg-card border border-border/60 rounded-xl p-3.5 space-y-3 shadow-xs'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='size-7 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0'>
                        <IconComponent className='size-4' />
                      </div>
                      <div>
                        <h4 className='text-xs font-bold text-foreground'>{cat.label}</h4>
                        <p className='text-[10px] text-muted-foreground'>{cat.description}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                    {/* Hourly Rate */}
                    <div className='space-y-1'>
                      <Label
                        htmlFor={`rate-base-${cat.category}`}
                        className='text-[11px] font-medium text-muted-foreground'
                      >
                        Tarif Dasar per Jam
                      </Label>
                      <Input
                        id={`rate-base-${cat.category}`}
                        type='text'
                        inputMode='numeric'
                        value={values.hourlyRate}
                        onChange={(e) =>
                          handleRateChange(cat.category, 'hourlyRate', e.target.value)
                        }
                        className='h-8 text-xs font-mono rounded-lg'
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
                        Tarif Lembur / Pengganti per Jam
                      </Label>
                      <Input
                        id={`rate-ot-${cat.category}`}
                        type='text'
                        inputMode='numeric'
                        value={values.overtimeHourlyRate}
                        onChange={(e) =>
                          handleRateChange(cat.category, 'overtimeHourlyRate', e.target.value)
                        }
                        className='h-8 text-xs font-mono rounded-lg'
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

        {/* Footer */}
        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10 gap-2 shrink-0'>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={updateRatesMutation.isPending}
            className='text-xs h-8 rounded-xl'
          >
            Batal
          </Button>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={updateRatesMutation.isPending || isLoading}
            className='text-xs h-8 rounded-xl gap-1.5'
          >
            {updateRatesMutation.isPending ? (
              <>
                <Icons.clock className='size-3.5 animate-spin' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Icons.check className='size-3.5' />
                <span>Simpan Perubahan Tarif</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
