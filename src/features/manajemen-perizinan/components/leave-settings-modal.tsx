'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useCompensationRatesQuery, useLeavePoliciesQuery } from '../api/queries';
import { useUpdateCompensationRateMutation, useUpdateLeavePolicyMutation } from '../api/mutations';
import { LeaveSettingsButton, type LeaveConfigurationCategory } from './leave-settings-button';

export interface LeaveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: LeaveConfigurationCategory;
}

const CATEGORY_META: Record<LeaveConfigurationCategory, { title: string; subtitle: string }> = {
  policy: {
    title: 'Kebijakan & Persetujuan Cuti',
    subtitle: 'Konfigurasi alur persetujuan permohonan dan batasan kuota cuti klinik.'
  },
  rates: {
    title: 'Standar Tarif Kompensasi',
    subtitle: 'Kelola tarif dasar pokok dan insentif pengganti dinas per jam kerja.'
  }
};

const CATEGORY_MAX_WIDTH: Record<LeaveConfigurationCategory, string> = {
  policy: 'w-full sm:max-w-[620px]',
  rates: 'w-full sm:max-w-3xl lg:max-w-4xl'
};

export function LeaveSettingsModal({
  isOpen,
  onClose,
  category = 'policy'
}: LeaveSettingsModalProps) {
  const { data: policies, isLoading: isPolicyLoading } = useLeavePoliciesQuery();
  const { data: rates, isLoading: isRatesLoading } = useCompensationRatesQuery();

  const updatePolicyMutation = useUpdateLeavePolicyMutation();
  const updateRateMutation = useUpdateCompensationRateMutation();

  const [activeCategory, setActiveCategory] = useState<LeaveConfigurationCategory>(category);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Sync category prop when modal opens or category changes externally
  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category, isOpen]);

  // GSAP animation for wizard transitions (identical to DoctorScheduleSettingsModal)
  useEffect(() => {
    if (!stepContainerRef.current) return;
    gsap.fromTo(
      stepContainerRef.current,
      { y: 14, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: 'power3.inOut'
      }
    );
  }, [activeCategory]);

  // Policy form state
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [limitMode, setLimitMode] = useState<'unlimited' | 'monthly_limit'>('monthly_limit');
  const [monthlyLimit, setMonthlyLimit] = useState(2);
  const [noticeDaysRequired, setNoticeDaysRequired] = useState(2);

  // Rate states
  const [doctorHourly, setDoctorHourly] = useState(150000);
  const [doctorOvertime, setDoctorOvertime] = useState(200000);

  const [midwifeHourly, setMidwifeHourly] = useState(150000);
  const [midwifeOvertime, setMidwifeOvertime] = useState(200000);

  const [workerHourly, setWorkerHourly] = useState(75000);
  const [workerOvertime, setWorkerOvertime] = useState(100000);

  useEffect(() => {
    if (policies && policies.length > 0) {
      const activePolicy = policies.find((p) => p.isActive) || policies[0];
      setApprovalRequired(activePolicy.approvalRequired);
      setLimitMode(activePolicy.limitMode);
      setMonthlyLimit(activePolicy.monthlyLimit);
      setNoticeDaysRequired(activePolicy.noticeDaysRequired ?? 2);
    }
  }, [policies]);

  useEffect(() => {
    if (rates && rates.length > 0) {
      for (const r of rates) {
        if (r.category === 'doctor') {
          setDoctorHourly(r.hourlyRate);
          setDoctorOvertime(r.overtimeHourlyRate);
        } else if (r.category === 'midwife') {
          setMidwifeHourly(r.hourlyRate);
          setMidwifeOvertime(r.overtimeHourlyRate);
        } else if (r.category === 'worker') {
          setWorkerHourly(r.hourlyRate);
          setWorkerOvertime(r.overtimeHourlyRate);
        }
      }
    }
  }, [rates]);

  const handleSave = async () => {
    if (activeCategory === 'policy') {
      await updatePolicyMutation.mutateAsync({
        policyName: 'Kebijakan Standar Klinik Amanah',
        approvalRequired,
        limitMode,
        monthlyLimit,
        noticeDaysRequired
      });
    } else {
      await updateRateMutation.mutateAsync({
        category: 'doctor',
        hourlyRate: doctorHourly,
        overtimeHourlyRate: doctorOvertime
      });
      await updateRateMutation.mutateAsync({
        category: 'midwife',
        hourlyRate: midwifeHourly,
        overtimeHourlyRate: midwifeOvertime
      });
      await updateRateMutation.mutateAsync({
        category: 'worker',
        hourlyRate: workerHourly,
        overtimeHourlyRate: workerOvertime
      });
    }
  };

  const isSaving = updatePolicyMutation.isPending || updateRateMutation.isPending;
  const isLoading = activeCategory === 'policy' ? isPolicyLoading : isRatesLoading;
  const meta = useMemo(
    () => CATEGORY_META[activeCategory] ?? CATEGORY_META.policy,
    [activeCategory]
  );
  const modalMaxWidth = CATEGORY_MAX_WIDTH[activeCategory] ?? 'w-full sm:max-w-[620px]';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={modalMaxWidth}
      showCloseButton={false}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4.5 sm:p-5 w-full my-auto shadow-2xl transition-[max-width,width] duration-300 ease-out'
    >
      <div className='flex flex-col font-sans select-none gap-4'>
        {/* Header - Minimalist, Category Selector on Opposite Side */}
        <div className='flex items-start justify-between gap-3 shrink-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {meta.title}
            </h3>
            <p className='text-xs text-muted-foreground leading-normal'>{meta.subtitle}</p>
          </div>
          <div className='flex items-center gap-2.5 shrink-0 self-start pt-0.5'>
            <LeaveSettingsButton
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
              className='h-7.5 w-7.5 border-border/60 hover:bg-muted/40'
            />
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className='flex flex-col gap-3 w-full py-1'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card shadow-2xs'
              >
                <div className='space-y-1.5 flex-1 pr-4'>
                  <Skeleton className='h-4 w-36 rounded-md' />
                  <Skeleton className='h-3 w-56 rounded-md' />
                </div>
                <Skeleton className='h-5 w-9 rounded-full shrink-0' />
              </div>
            ))}
          </div>
        ) : (
          <div ref={stepContainerRef} className='w-full'>
            {activeCategory === 'policy' && (
              <div className='flex flex-col gap-3'>
                {/* 1. Alur Persetujuan */}
                <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground'>
                      Alur Persetujuan Pengajuan Cuti
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Setiap permohonan staf wajib melalui persetujuan manual Admin sebelum tercatat
                      resmi.
                    </p>
                  </div>
                  <div className='flex items-center shrink-0 self-end sm:self-center'>
                    <Switch
                      checked={approvalRequired}
                      onCheckedChange={setApprovalRequired}
                      aria-label='Alur Persetujuan Pengajuan Cuti'
                    />
                  </div>
                </div>

                {/* 2. Batasan Kuota Bulanan */}
                <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                    <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
                      <span className='font-semibold text-xs sm:text-sm text-foreground'>
                        Batasan Kuota Pengajuan Bulanan
                      </span>
                      <p className='text-xs text-muted-foreground leading-relaxed'>
                        Batasi frekuensi maksimum permohonan izin staf dalam 1 periode kalender.
                      </p>
                    </div>
                    <div className='flex items-center shrink-0 self-end sm:self-center'>
                      <Switch
                        checked={limitMode === 'monthly_limit'}
                        onCheckedChange={(checked) =>
                          setLimitMode(checked ? 'monthly_limit' : 'unlimited')
                        }
                        aria-label='Batasan Kuota Pengajuan Bulanan'
                      />
                    </div>
                  </div>

                  {limitMode === 'monthly_limit' && (
                    <div className='pt-2.5 border-t border-border/40 flex items-center justify-between gap-3'>
                      <span className='text-xs text-muted-foreground'>
                        Maksimal Pengajuan per Bulan
                      </span>
                      <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                        <input
                          type='number'
                          value={monthlyLimit}
                          min={1}
                          max={30}
                          onChange={(e) => setMonthlyLimit(Number(e.target.value) || 1)}
                          className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16'
                        />
                        <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                          kali / bulan
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Minimal Hari Pengajuan di Muka */}
                <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground'>
                      Minimal Hari Pengajuan di Muka (Lead Time)
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Jangka waktu minimum permohonan diajukan sebelum tanggal cuti pertama dimulai.
                    </p>
                  </div>
                  <div className='flex items-center shrink-0 self-end sm:self-center'>
                    <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                      <input
                        type='number'
                        value={noticeDaysRequired}
                        min={0}
                        max={30}
                        onChange={(e) => setNoticeDaysRequired(Number(e.target.value) || 0)}
                        className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16'
                      />
                      <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                        hari di muka
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'rates' && (
              <div className='flex flex-col gap-3.5'>
                {/* 1. Dokter */}
                <div className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground'>
                      Dokter Spesialis & Umum
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Tarif jam dinas konsultasi dan insentif pengganti dokter jaga
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
                          type='number'
                          step={5000}
                          value={doctorHourly}
                          onChange={(e) => setDoctorHourly(Number(e.target.value) || 0)}
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
                          type='number'
                          step={5000}
                          value={doctorOvertime}
                          onChange={(e) => setDoctorOvertime(Number(e.target.value) || 0)}
                          className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                        />
                        <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                          / jam
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Bidan */}
                <div className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground'>
                      Bidan & Tenaga Kebidanan
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Tarif shift dinas KIA, persalinan, dan insentif jaga pengganti
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
                          type='number'
                          step={5000}
                          value={midwifeHourly}
                          onChange={(e) => setMidwifeHourly(Number(e.target.value) || 0)}
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
                          type='number'
                          step={5000}
                          value={midwifeOvertime}
                          onChange={(e) => setMidwifeOvertime(Number(e.target.value) || 0)}
                          className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                        />
                        <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                          / jam
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Staf Operasional */}
                <div className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='font-semibold text-xs sm:text-sm text-foreground'>
                      Staf Operasional & Front Office
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Tarif jam kerja staf administrasi, kasir, farmasi, dan perawat
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
                          type='number'
                          step={5000}
                          value={workerHourly}
                          onChange={(e) => setWorkerHourly(Number(e.target.value) || 0)}
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
                          type='number'
                          step={5000}
                          value={workerOvertime}
                          onChange={(e) => setWorkerOvertime(Number(e.target.value) || 0)}
                          className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                        />
                        <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                          / jam
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation (identical to DoctorScheduleSettingsModal) */}
        <div className='flex items-center justify-between border-t border-border/70 pt-3.5 mt-1 gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isSaving}
            className='text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground font-semibold'
          >
            Tutup
          </Button>

          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className='text-xs h-8.5 px-3.5 font-medium'
          >
            {isSaving ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
