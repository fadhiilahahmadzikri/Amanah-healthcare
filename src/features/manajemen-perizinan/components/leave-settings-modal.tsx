'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useLeavePoliciesQuery } from '../api/queries';
import { useUpdateLeavePolicyMutation } from '../api/mutations';

export interface LeaveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MorphingRuleCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function MorphingRuleCard({
  title,
  description,
  isSelected,
  onClick,
  disabled
}: MorphingRuleCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    if (isHovered) {
      el.style.display = 'block';
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.24,
          ease: 'power2.out',
          clearProps: 'height'
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.inOut',
        onComplete: () => {
          if (el) el.style.display = 'none';
        }
      });
    }
  }, [isHovered]);

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        'w-full flex flex-col p-3 rounded-xl border text-left transition-colors cursor-pointer select-none',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
          : 'border-border/70 bg-card hover:border-border'
      )}
    >
      <div className='flex items-center justify-between w-full'>
        <span className='text-xs font-semibold text-foreground tracking-tight'>{title}</span>
        <div
          className={cn(
            'size-2 rounded-full transition-all shrink-0 ml-2',
            isSelected ? 'bg-primary ring-2 ring-primary/20 scale-110' : 'bg-muted-foreground/30'
          )}
        />
      </div>
      <div
        ref={contentRef}
        style={{ display: 'none', height: 0, opacity: 0, overflow: 'hidden' }}
        className='w-full'
      >
        <p className='text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border/30 mt-2'>
          {description}
        </p>
      </div>
    </button>
  );
}

export function LeaveSettingsModal({ isOpen, onClose }: LeaveSettingsModalProps) {
  const { data: policies, isLoading } = useLeavePoliciesQuery();
  const updatePolicyMutation = useUpdateLeavePolicyMutation();
  const { isOpen: isMobile } = useMediaQuery('(max-width: 768px)');

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

  const contentBody = isLoading ? (
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
            Persetujuan Manual Admin
          </span>
          <p className='text-xs text-muted-foreground leading-relaxed max-w-md'>
            {approvalRequired
              ? 'Setiap permohonan cuti wajib ditinjau dan disetujui Admin terlebih dahulu.'
              : 'Persetujuan manual nonaktif. Permohonan cuti yang memenuhi syarat langsung disetujui otomatis oleh sistem.'}
          </p>
        </div>
        <div className='flex items-center shrink-0 self-end sm:self-center'>
          <Switch
            checked={approvalRequired}
            onCheckedChange={setApprovalRequired}
            aria-label='Persetujuan Manual Admin'
            disabled={isSaving}
          />
        </div>
      </div>

      {/* 2. Batasan Kuota Bulanan */}
      <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
            <span className='font-semibold text-xs sm:text-sm text-foreground'>
              Batasi Jumlah Cuti per Bulan
            </span>
            <p className='text-xs text-muted-foreground leading-relaxed max-w-md'>
              {limitMode === 'monthly_limit'
                ? 'Membatasi berapa kali staf boleh mengajukan cuti dalam 1 bulan kalender.'
                : 'Bebas mengajukan cuti tanpa batasan kuota per bulan.'}
            </p>
          </div>
          <div className='flex items-center shrink-0 self-end sm:self-center'>
            <Switch
              checked={limitMode === 'monthly_limit'}
              onCheckedChange={(checked) => setLimitMode(checked ? 'monthly_limit' : 'unlimited')}
              aria-label='Batasi Jumlah Cuti per Bulan'
              disabled={isSaving}
            />
          </div>
        </div>

        {limitMode === 'monthly_limit' && (
          <div className='pt-2.5 border-t border-border/40 flex items-center justify-between gap-3'>
            <span className='text-xs text-muted-foreground'>Maksimal Pengajuan per Bulan</span>
            <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
              <input
                type='number'
                aria-label='Maksimal Pengajuan per Bulan'
                value={monthlyLimit}
                min={1}
                max={30}
                onChange={(e) => setMonthlyLimit(Number(e.target.value) || 1)}
                disabled={isSaving}
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
            Batas Waktu Pengajuan di Muka
          </span>
          <p className='text-xs text-muted-foreground leading-relaxed max-w-md'>
            {noticeDaysRequired > 0
              ? `Permohonan cuti wajib diajukan minimal ${noticeDaysRequired} hari sebelum tanggal cuti dimulai.`
              : 'Cuti dapat diajukan kapan saja termasuk pada hari yang sama (0 hari sebelum mulai).'}
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
              disabled={isSaving}
              className='h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16'
            />
            <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
              hari di muka
            </span>
          </div>
        </div>
      </div>

      {/* 4. Kebijakan Periode Izin - GSAP Morphing Accordion */}
      <div className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'>
        <div className='flex flex-col gap-0.5'>
          <span className='font-semibold text-xs sm:text-sm text-foreground'>
            Aturan Pengajuan Cuti Berulang
          </span>
          <p className='text-xs text-muted-foreground leading-relaxed max-w-md'>
            Atur apakah staf boleh mengajukan cuti berikutnya saat masih ada cuti yang belum
            selesai.
          </p>
        </div>

        {/* Independent 2-column grid with items-start so siblings never stretch */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/40 items-start'>
          <MorphingRuleCard
            title='Bebas / Fleksibel'
            description='Boleh mengajukan izin untuk tanggal lain di masa depan selama tanggalnya tidak saling bertabrakan.'
            isSelected={periodPolicy === 'non_overlapping'}
            onClick={() => setPeriodPolicy('non_overlapping')}
            disabled={isSaving}
          />

          <MorphingRuleCard
            title='Satu per Satu (Ketat)'
            description='Masa cuti aktif sebelumnya harus selesai terlebih dahulu sebelum bisa mengajukan permohonan baru.'
            isSelected={periodPolicy === 'previous_period_must_finish'}
            onClick={() => setPeriodPolicy('previous_period_must_finish')}
            disabled={isSaving}
          />
        </div>
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
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className='max-h-[85vh] font-sans flex flex-col p-0 overflow-hidden'>
          <DrawerHeader className='shrink-0 text-left pb-3 border-b border-border/50 px-4 pt-3'>
            <DrawerTitle className='text-base font-bold text-foreground tracking-tight'>
              Kebijakan & Persetujuan Cuti
            </DrawerTitle>
            <DrawerDescription className='text-xs text-muted-foreground max-w-md leading-normal'>
              Konfigurasi alur persetujuan permohonan dan batasan kuota cuti klinik.
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5'>{contentBody}</div>

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
      maxWidth='w-full sm:max-w-[620px]'
      showCloseButton={false}
      className='max-h-[85vh] flex flex-col p-4 sm:p-5 overflow-hidden'
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Kebijakan & Persetujuan Cuti
            </h3>
            <p className='text-xs text-muted-foreground max-w-md leading-normal'>
              Konfigurasi alur persetujuan permohonan dan batasan kuota cuti klinik.
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 space-y-3.5 pr-1'>{contentBody}</div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3 border-t border-border/50 flex items-center justify-between gap-2'>
          {footerButtons}
        </div>
      </div>
    </ModalWrapper>
  );
}
