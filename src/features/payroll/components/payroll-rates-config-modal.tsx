'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useWorkPoliciesCurrentQuery } from '../api/queries';
import {
  useUpdateAttendanceTimingMutation,
  useUpdateCompensationRatesMutation
} from '../api/mutations';
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
  const { data: workPolicies, isLoading } = useWorkPoliciesCurrentQuery();
  const updateRatesMutation = useUpdateCompensationRatesMutation();
  const updateTimingMutation = useUpdateAttendanceTimingMutation();

  const [formRates, setFormRates] = useState<Record<StaffCategory, CategoryRateForm>>({
    doctor: { hourlyRate: 20000, overtimeHourlyRate: 30000 },
    midwife: { hourlyRate: 15000, overtimeHourlyRate: 22500 },
    worker: { hourlyRate: 12000, overtimeHourlyRate: 18000 }
  });

  const [minBillableShiftMinutes, setMinBillableShiftMinutes] = useState(30);
  const [roundingIncrementMinutes, setRoundingIncrementMinutes] = useState(15);

  // Populate from fetched rates and timing config
  useEffect(() => {
    if (workPolicies) {
      if (workPolicies.rates && workPolicies.rates.length > 0) {
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
      if (workPolicies.timing) {
        setMinBillableShiftMinutes(workPolicies.timing.minBillableShiftMinutes ?? 30);
        setRoundingIncrementMinutes(workPolicies.timing.roundingIncrementMinutes ?? 15);
      }
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

  const isSaving = updateRatesMutation.isPending || updateTimingMutation.isPending;

  const handleSave = async () => {
    const payloadRates = Object.entries(formRates).map(([category, val]) => ({
      category: category as StaffCategory,
      hourlyRate: val.hourlyRate,
      overtimeHourlyRate: val.overtimeHourlyRate,
      notes: `Diperbarui via Web Dashboard pada ${new Date().toLocaleDateString('id-ID')}`
    }));

    try {
      await Promise.all([
        updateRatesMutation.mutateAsync({ rates: payloadRates }),
        updateTimingMutation.mutateAsync({
          minBillableShiftMinutes,
          roundingIncrementMinutes
        })
      ]);
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
            <div className='font-semibold text-foreground'>
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

          {/* Attendance Timing & Billing Policy */}
          <div className='p-4 bg-card border border-border/70 rounded-xl space-y-3.5 shadow-2xs'>
            <div>
              <h4 className='text-xs sm:text-sm font-bold text-foreground flex items-center gap-2'>
                <span>Standar Durasi Kerja Berbayar & Pembulatan Jam Dinas</span>
              </h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed mt-0.5'>
                Konfigurasi batas minimal dan interval pembulatan menit presensi untuk kalkulasi upah harian.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border/40'>
              {/* Min Billable Shift Minutes */}
              <div className='p-3 rounded-lg border border-border/60 bg-muted/10 space-y-2'>
                <div className='space-y-0.5'>
                  <Label htmlFor='min-billable-minutes' className='text-xs font-semibold text-foreground'>
                    Batas Minimum Durasi Berbayar
                  </Label>
                  <p className='text-[10px] text-muted-foreground leading-tight'>
                    Durasi kerja di bawah ambang ini dianggap 0 jam berbayar (mencegah kalkulasi upah 1 menit).
                  </p>
                </div>
                <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                  <input
                    id='min-billable-minutes'
                    type='number'
                    aria-label='Batas Minimum Durasi Berbayar'
                    value={minBillableShiftMinutes}
                    min={0}
                    max={120}
                    step={5}
                    onChange={(e) => setMinBillableShiftMinutes(Number(e.target.value) || 0)}
                    disabled={isLoading || isSaving}
                    className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-20'
                  />
                  <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                    menit
                  </span>
                </div>
              </div>

              {/* Rounding Increment Minutes */}
              <div className='p-3 rounded-lg border border-border/60 bg-muted/10 space-y-2'>
                <div className='space-y-0.5'>
                  <Label htmlFor='rounding-increment-minutes' className='text-xs font-semibold text-foreground'>
                    Interval Pembulatan Jam Kerja
                  </Label>
                  <p className='text-[10px] text-muted-foreground leading-tight'>
                    Faktor pembulatan durasi kerja ke kelipatan interval menit terdekat (contoh 15 menit = 0.25 jam).
                  </p>
                </div>
                <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                  <input
                    id='rounding-increment-minutes'
                    type='number'
                    aria-label='Interval Pembulatan Jam Kerja'
                    value={roundingIncrementMinutes}
                    min={1}
                    max={60}
                    step={5}
                    onChange={(e) => setRoundingIncrementMinutes(Number(e.target.value) || 1)}
                    disabled={isLoading || isSaving}
                    className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-20'
                  />
                  <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                    menit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isSaving}
            className='px-4 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className='px-5 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
          >
            {isSaving ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan Standar</span>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
