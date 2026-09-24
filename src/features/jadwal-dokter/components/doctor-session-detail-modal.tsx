'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

export interface DoctorSessionDetailModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule: (session: DoctorDailySession) => void;
  onOpenEdit: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorSessionDetailModal({
  doctor,
  session,
  isOpen,
  onClose,
  onOpenReschedule,
  onOpenEdit,
  portalContainerRef
}: DoctorSessionDetailModalProps) {
  if (!doctor || !session) return null;

  const rawStatus = (session.status_sesi || '').toUpperCase();
  const isSessionClosed =
    rawStatus === 'TUTUP' ||
    rawStatus === 'CLOSED' ||
    rawStatus === 'CUTI' ||
    rawStatus === 'LEAVE';
  const isRescheduleEligible =
    session.is_reschedule_eligible !== undefined
      ? session.is_reschedule_eligible
      : !isSessionClosed;
  const ineligibilityReason =
    session.reschedule_ineligibility_reason ||
    (isSessionClosed
      ? 'Sesi ini berstatus Tutup. Silakan aktifkan sesi terlebih dahulu melalui menu Ubah Sesi sebelum melakukan reschedule.'
      : 'Sesi ini tidak dapat dipindahkan (reschedule).');

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[540px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <div className='relative font-sans space-y-4'>
        {/* 1. Header Identitas Sesi */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-1 min-w-0 flex-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-primary/20 bg-primary/10 text-primary'>
                <Icons.calendar className='size-3' />
                <span>Sesi Terdaftar</span>
              </span>
              <StatusBadge status={session.status_sesi} size='sm' />
            </div>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {session.nama_sesi}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {doctor.nama_dokter} • {session.nama_sesi} ({session.jam_mulai} - {session.jam_selesai} WIB)
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* 2. Informasi Ringkas Waktu & Ruang */}
        <div className='grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/50 text-xs'>
          <div>
            <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
              Jam Praktik
            </span>
            <span className='font-mono font-bold text-foreground text-xs'>
              {session.jam_mulai} - {session.jam_selesai} WIB
            </span>
          </div>

          <div>
            <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
              Ruang Praktik
            </span>
            <span className='font-medium text-foreground truncate block text-xs'>
              {session.ruang || doctor.ruang_praktik}
            </span>
          </div>
        </div>

        {/* 3. Pilihan Aksi: Reschedule vs Edit (Jelas, Minimalis & Edukatif) */}
        <div className='space-y-2.5 pt-1'>
          <span className='text-xs font-semibold text-foreground/80 block'>
            Pilih tindakan kelola sesi:
          </span>

          {/* Opsi 1: Reschedule */}
          <div
            className={cn(
              'p-3 rounded-xl border transition-all space-y-2',
              isRescheduleEligible
                ? 'border-border/60 bg-card hover:border-primary/50'
                : 'border-border/40 bg-muted/10 opacity-90'
            )}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1 flex-1'>
                <div className='flex items-center gap-1.5 font-bold text-xs text-foreground'>
                  <Icons.calendar
                    className={cn(
                      'size-3.5',
                      isRescheduleEligible ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span>Reschedule (Pindahkan Jadwal Praktik)</span>
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Pindahkan sesi ke <strong>tanggal tujuan baru</strong> atau <strong>jam mulai baru</strong>. Seluruh antrean pasien yang sudah booking akan otomatis digeser secara atomik ke jadwal baru.
                </p>
                {!isRescheduleEligible && (
                  <div className='mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed'>
                    <Icons.info className='size-3.5 shrink-0 mt-0.5' />
                    <span>{ineligibilityReason}</span>
                  </div>
                )}
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                disabled={!isRescheduleEligible}
                onClick={() => {
                  if (!isRescheduleEligible) return;
                  onClose();
                  onOpenReschedule(session);
                }}
                className={cn(
                  'shrink-0 h-8 px-3 text-xs font-semibold',
                  isRescheduleEligible
                    ? 'border-primary/30 text-primary hover:bg-primary/10 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed text-muted-foreground'
                )}
                leadingIcon={<Icons.calendar className='size-3.5' />}
              >
                {isRescheduleEligible ? 'Reschedule' : 'Tidak Dapat Reschedule'}
              </Button>
            </div>
          </div>

          {/* Opsi 2: Edit Sesi */}
          <div className='p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 transition-all space-y-2 group'>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1 flex-1'>
                <div className='flex items-center gap-1.5 font-bold text-xs text-foreground'>
                  <Icons.edit className='size-3.5 text-primary' />
                  <span>Ubah Sesi (Edit Operasional In-Place)</span>
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Ubah ruang praktik atau ganti status (Buka / Tutup / Terisi) langsung di sesi ini tanpa memindahkan tanggal atau jam antrean.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                onClick={() => {
                  onClose();
                  onOpenEdit(session);
                }}
                className='shrink-0 h-8 px-3 text-xs font-semibold text-foreground/80 hover:text-foreground'
                leadingIcon={<Icons.edit className='size-3.5 text-muted-foreground' />}
              >
                Ubah Sesi
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Footer Tutup */}
        <div className='pt-2 flex items-center justify-end'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-5 font-medium text-xs'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
