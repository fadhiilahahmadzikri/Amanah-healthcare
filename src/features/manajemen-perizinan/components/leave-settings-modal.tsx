'use client';

import React, { useEffect, useState } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useLeavePoliciesQuery } from '../api/queries';
import { useUpdateLeavePolicyMutation } from '../api/mutations';

export interface LeaveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveSettingsModal({ isOpen, onClose }: LeaveSettingsModalProps) {
  const { data: policies, isLoading } = useLeavePoliciesQuery();
  const updatePolicyMutation = useUpdateLeavePolicyMutation();

  // Policy form state
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [limitMode, setLimitMode] = useState<'unlimited' | 'monthly_limit'>('monthly_limit');
  const [monthlyLimit, setMonthlyLimit] = useState(2);
  const [noticeDaysRequired, setNoticeDaysRequired] = useState(2);
  const [periodPolicy, setPeriodPolicy] = useState<
    'non_overlapping' | 'previous_period_must_finish'
  >('non_overlapping');

  useEffect(() => {
    if (policies && policies.length > 0) {
      const activePolicy = policies.find((p) => p.isActive) || policies[0];
      setApprovalRequired(activePolicy.approvalRequired);
      setLimitMode(activePolicy.limitMode);
      setMonthlyLimit(activePolicy.monthlyLimit);
      setNoticeDaysRequired(activePolicy.noticeDaysRequired ?? 2);
      setPeriodPolicy(activePolicy.periodPolicy ?? 'non_overlapping');
    }
  }, [policies]);

  const handleSave = async () => {
    try {
      await updatePolicyMutation.mutateAsync({
        policyName: 'Kebijakan Standar Klinik Amanah',
        approvalRequired,
        limitMode,
        monthlyLimit,
        noticeDaysRequired,
        periodPolicy
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const isSaving = updatePolicyMutation.isPending;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[620px]'
      showCloseButton={false}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4.5 sm:p-5 w-full my-auto shadow-2xl transition-[max-width,width] duration-300 ease-out'
    >
      <div className='flex flex-col font-sans select-none gap-4'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3 shrink-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kebijakan & Persetujuan Cuti
            </h3>
            <p className='text-xs text-muted-foreground leading-normal'>
              Konfigurasi alur persetujuan permohonan dan batasan kuota cuti klinik.
            </p>
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
          <div className='flex flex-col gap-3 w-full'>
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
                      aria-label='Maksimal Pengajuan per Bulan'
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
                    aria-label='Minimal Hari Pengajuan di Muka'
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

            {/* 4. Kebijakan Periode Izin */}
            <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
              <div className='flex flex-col gap-0.5'>
                <span className='font-semibold text-xs sm:text-sm text-foreground'>
                  Kebijakan Validasi Periode Pengajuan Izin
                </span>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Tentukan apakah staf dapat mengajukan izin di masa depan yang tidak bertabrakan,
                  atau wajib menyelesaikan periode izin sebelumnya terlebih dahulu.
                </p>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/40'>
                <button
                  type='button'
                  onClick={() => setPeriodPolicy('non_overlapping')}
                  className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    periodPolicy === 'non_overlapping'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border/70 bg-background hover:border-border'
                  }`}
                >
                  <div className='flex items-center justify-between w-full mb-1'>
                    <span className='text-xs font-semibold text-foreground'>
                      Fleksibel (Non-Overlapping)
                    </span>
                    {periodPolicy === 'non_overlapping' && (
                      <span className='h-2 w-2 rounded-full bg-primary' />
                    )}
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-normal'>
                    Izin periode mendatang diizinkan selama tanggal/sesi tidak bertabrakan dengan
                    izin pending atau disetujui.
                  </p>
                </button>

                <button
                  type='button'
                  onClick={() => setPeriodPolicy('previous_period_must_finish')}
                  className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    periodPolicy === 'previous_period_must_finish'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border/70 bg-background hover:border-border'
                  }`}
                >
                  <div className='flex items-center justify-between w-full mb-1'>
                    <span className='text-xs font-semibold text-foreground'>
                      Ketat (Periode Harus Selesai)
                    </span>
                    {periodPolicy === 'previous_period_must_finish' && (
                      <span className='h-2 w-2 rounded-full bg-primary' />
                    )}
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-normal'>
                    Staf harus menyelesaikan masa cuti aktif/pending sebelumnya sebelum dapat
                    mengajukan permohonan baru.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className='flex items-center justify-between border-t border-border/70 pt-3.5 mt-1 gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isSaving}
            className='text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground font-semibold cursor-pointer'
          >
            Tutup
          </Button>

          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className='text-xs h-8.5 px-3.5 font-medium cursor-pointer'
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
