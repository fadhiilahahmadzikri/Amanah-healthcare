'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { SCHEDULE_STATUS } from '../constants/schedule-shift.constants';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

export interface DoctorSessionDetailModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule?: (session: DoctorDailySession) => void;
  onOpenEdit?: (session: DoctorDailySession) => void;
  onOpenPatients?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorSessionDetailModal({
  doctor,
  session,
  isOpen,
  onClose,
  onOpenReschedule: _onOpenReschedule,
  onOpenEdit: _onOpenEdit,
  onOpenPatients,
  portalContainerRef
}: DoctorSessionDetailModalProps) {
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  if (!doctor || !session) return null;

  const rawStatus = session.status_sesi ? session.status_sesi.toUpperCase() : '';
  const isSessionClosed =
    rawStatus === SCHEDULE_STATUS.CLOSED || rawStatus === SCHEDULE_STATUS.CUTI;
  const isRescheduleEligible =
    session.is_reschedule_eligible !== undefined
      ? session.is_reschedule_eligible
      : !isSessionClosed;
  const ineligibilityReason =
    session.reschedule_ineligibility_reason !== undefined &&
    session.reschedule_ineligibility_reason !== ''
      ? session.reschedule_ineligibility_reason
      : isSessionClosed
        ? 'Sesi ini berstatus Tutup. Silakan aktifkan sesi terlebih dahulu melalui menu Ubah Sesi sebelum melakukan reschedule.'
        : 'Sesi ini tidak dapat dipindahkan (reschedule).';

  const capacity = session.kuota_pasien;
  const sessionIntervals = doctor.timeline_intervals?.filter(
    (it) =>
      (it.startTime >= session.jam_mulai && it.startTime < session.jam_selesai) ||
      it.startTime === session.jam_mulai
  );
  const sessionBookedCount = isSessionClosed
    ? 0
    : session.pasien_terdaftar !== undefined
      ? session.pasien_terdaftar
      : Math.max(
          0,
          capacity - (session.slot_tersedia !== undefined ? session.slot_tersedia : capacity)
        );
  const intervalBookedCount =
    sessionIntervals?.filter((it) =>
      Boolean(it.appointmentRef || (it.isOccupied && it.status === SCHEDULE_STATUS.OCCUPIED))
    ).length ?? 0;
  const bookedCount = Math.max(sessionBookedCount, intervalBookedCount);

  const showBanner = !isRescheduleEligible && !bannerDismissed;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[520px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <div className='relative font-sans space-y-4'>
        {/* Accordion Dropdown Notification Banner */}
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            showBanner
              ? 'grid-rows-[1fr] opacity-100 mb-3'
              : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
          )}
        >
          <div className='overflow-hidden'>
            <div className='px-3.5 py-2.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 select-none rounded-xl'>
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <Icons.info className='size-4 shrink-0 text-amber-600 dark:text-amber-400' />
                <div className='text-xs leading-snug min-w-0'>
                  <span className='font-bold mr-1'>Pemberitahuan:</span>
                  <span className='text-[11.5px] opacity-90'>{ineligibilityReason}</span>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setBannerDismissed(true)}
                aria-label='Tutup pemberitahuan'
                className='p-1 rounded-full text-amber-600/70 hover:text-amber-700 hover:bg-amber-500/10 transition-colors cursor-pointer shrink-0'
              >
                <Icons.close className='size-3.5' />
              </button>
            </div>
          </div>
        </div>

        {/* 1. Header Identitas Sesi (Clean & Minimal) */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {session.nama_sesi}
            </h3>
            <p className='text-xs text-muted-foreground font-mono font-medium'>
              {session.jam_mulai} – {session.jam_selesai} WIB
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

        {/* 2. Detail Operasional Sesi (Single Source of Truth, Tanpa Redundansi) */}
        <div className='rounded-xl border border-border/50 bg-card p-3.5 space-y-3 text-xs'>
          <div className='text-xs font-bold text-foreground pb-2 border-b border-border/40 flex items-center justify-between'>
            <span>Detail Operasional Praktik</span>
            <span className='font-normal text-muted-foreground text-[11px]'>
              Durasi: 30 Menit / Pasien
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>
                Dokter Pemeriksa
              </span>
              <span className='font-semibold text-foreground block truncate'>
                {doctor.nama_dokter}
              </span>
              <span className='text-[10.5px] text-muted-foreground block mt-0.5'>
                {doctor.spesialisasi}
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Ruang Praktik</span>
              <span className='font-semibold text-foreground block truncate'>
                {session.ruang !== ''
                  ? session.ruang
                  : doctor.ruang_praktik !== ''
                    ? doctor.ruang_praktik
                    : '-'}
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Status Sesi</span>
              <span className='font-semibold text-foreground capitalize block'>
                {session.status_sesi}
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Okupansi Kuota</span>
              <span className='font-mono font-bold text-foreground block'>
                {bookedCount} / {capacity} Pasien ({Math.max(0, capacity - bookedCount)} Slot
                Tersedia)
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ringkasan Antrean Pasien */}
        <div className='p-3 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between gap-3 text-xs'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0'>
              <Icons.teams className='size-4' />
            </div>
            <div className='min-w-0'>
              <span className='font-bold text-foreground block truncate'>
                {bookedCount} Pasien Terdaftar
              </span>
              <span className='text-[11px] text-muted-foreground block'>
                {bookedCount > 0
                  ? 'Pasien memiliki janji temu pada sesi ini.'
                  : 'Belum ada pasien yang booking sesi ini.'}
              </span>
            </div>
          </div>

          {bookedCount > 0 && onOpenPatients && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                onClose();
                onOpenPatients(session);
              }}
              className='shrink-0 h-7.5 px-3 text-xs font-semibold'
            >
              Lihat Pasien
            </Button>
          )}
        </div>

        {/* 5. Footer Tutup */}
        <div className='pt-1 flex items-center justify-end'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-5 font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
