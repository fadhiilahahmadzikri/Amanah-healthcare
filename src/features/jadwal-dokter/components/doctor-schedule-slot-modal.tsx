'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ScheduleSlotModalData } from '../model/useDoctorScheduleSlotModal';
import { isSlotClosed } from '../utils/doctor-schedule-predicates';
import { SCHEDULE_STATUS } from '../constants/schedule-shift.constants';

export interface DoctorScheduleSlotModalProps {
  data: ScheduleSlotModalData | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorScheduleSlotModal({
  data,
  isOpen,
  onClose,
  portalContainerRef
}: DoctorScheduleSlotModalProps) {
  const doctor = data?.doctor;
  const session = data?.session;
  const slot = data?.slot;
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  const initials = useMemo(() => {
    if (!doctor?.nama_dokter) return 'DR';
    return doctor.nama_dokter
      .replace(/^(dr\.\s*|drg\.\s*|prof\.\s*)/g, '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [doctor?.nama_dokter]);

  const formattedDisplayDate = useMemo(() => {
    const rawDate = data?.date || session?.tanggal || doctor?.tanggal_praktik || '';
    if (!rawDate) return '';
    if (
      rawDate.includes('Januari') ||
      rawDate.includes('Februari') ||
      rawDate.includes('Maret') ||
      rawDate.includes('April') ||
      rawDate.includes('Mei') ||
      rawDate.includes('Juni') ||
      rawDate.includes('Juli') ||
      rawDate.includes('Agustus') ||
      rawDate.includes('September') ||
      rawDate.includes('Oktober') ||
      rawDate.includes('November') ||
      rawDate.includes('Desember') ||
      rawDate.includes('Senin') ||
      rawDate.includes('Minggu')
    ) {
      return rawDate;
    }
    const parts = rawDate.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
    return rawDate;
  }, [data?.date, session?.tanggal, doctor?.tanggal_praktik]);

  const isClosed = Boolean(
    session &&
      slot &&
      (session.status_sesi === SCHEDULE_STATUS.CLOSED ||
        session.status_sesi === 'CLOSED' ||
        session.status_sesi === 'Tutup' ||
        isSlotClosed(slot))
  );

  const isOccupied = Boolean(
    slot &&
      (slot.appointmentRef != null ||
        slot.actionType === 'VIEW_PATIENTS' ||
        slot.status === 'OCCUPIED' ||
        slot.status === 'OCCUPIED_BY_SELF' ||
        slot.availabilityState === 'OCCUPIED' ||
        (slot.uiVariant &&
          slot.uiVariant !== 'success_green' &&
          slot.uiVariant !== 'neutral_disabled' &&
          slot.uiVariant !== 'purple_other' &&
          slot.uiVariant !== 'dashed_border'))
  );

  const isAvailable = Boolean(slot && !isClosed && !isOccupied);

  // Signature GSAP accordion animation: unfolds from bottom to top, adapting modal wrapper height
  useEffect(() => {
    const el = bannerContainerRef.current;
    if (!el || !isOpen) return;

    gsap.killTweensOf(el);

    const fullHeight = el.scrollHeight;

    gsap.fromTo(
      el,
      {
        height: 0,
        opacity: 0,
        y: 18
      },
      {
        height: fullHeight,
        opacity: 1,
        y: 0,
        duration: 0.42,
        delay: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          if (el) {
            el.style.height = 'auto';
          }
        }
      }
    );
  }, [isOpen, slot?.startTime, isOccupied, isClosed, isAvailable]);

  if (!doctor || !session || !slot) {
    return null;
  }

  const handleOpenPatientsDetail = () => {
    if (data.onOpenPatientDetail) {
      onClose();
      data.onOpenPatientDetail(session, slot);
    } else if (data.onOpenPatients) {
      onClose();
      data.onOpenPatients(session, slot.startTime, slot.endTime);
    }
  };

  const handleReschedule = () => {
    if (data.onOpenReschedule) {
      onClose();
      data.onOpenReschedule(session, slot.startTime);
    }
  };

  const handleToggleStatus = () => {
    if (data.onToggleSessionStatus) {
      onClose();
      data.onToggleSessionStatus(session);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[490px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 sm:p-7 w-full my-auto shadow-2xl transition-[height] duration-300'
    >
      <div className='flex flex-col font-sans select-none gap-4.5'>
        {/* Header: Doctor Avatar, Name, and Close Button - No border-b */}
        <div className='flex items-start justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-3.5 min-w-0'>
            <Avatar className='size-12 rounded-full border border-border/60 bg-muted shrink-0 shadow-2xs'>
              {doctor.avatar && (
                <AvatarImage
                  src={doctor.avatar}
                  alt={doctor.nama_dokter}
                  className='size-full object-cover'
                />
              )}
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-sm'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='min-w-0'>
              <h3 className='text-base sm:text-[17px] font-bold text-foreground tracking-tight break-words'>
                {doctor.nama_dokter}
              </h3>
              <p className='text-xs text-muted-foreground break-words mt-0.5'>
                {doctor.spesialisasi || 'Dokter Spesialis'}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 -mr-1 -mt-1'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Schedule & Location Details Grid */}
        <div className='p-4 rounded-xl bg-muted/20 border border-border/50 text-xs space-y-3'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Tanggal Praktik</span>
              <span className='font-semibold text-foreground break-words block'>
                {formattedDisplayDate || 'Hari ini'}
              </span>
            </div>
            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Jam Konsultasi</span>
              <span className='font-mono font-semibold text-foreground block'>
                {slot.startTime} - {slot.endTime} WIB
              </span>
            </div>
          </div>

          <div className='pt-2.5 border-t border-border/30 grid grid-cols-2 gap-4'>
            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Sesi</span>
              <span className='font-semibold text-foreground break-words block'>
                {session.nama_sesi}
              </span>
            </div>
            <div>
              <span className='text-[11px] text-muted-foreground block mb-0.5'>Ruang Praktik</span>
              <span className='font-semibold text-foreground break-words block'>
                {session.ruang || doctor.ruang_praktik || 'Ruang Praktik'}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Accordion Indicator Banner - Expands and pushes layout smoothly */}
        <div ref={bannerContainerRef} style={{ overflow: 'hidden' }} className='w-full'>
          <div className='py-0.5'>
            {isOccupied && (
              <div className='p-3.5 sm:p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-muted-foreground leading-relaxed flex flex-col gap-2.5 shadow-2xs'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-start gap-2.5 min-w-0'>
                    <Icons.teams className='size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5' />
                    <div className='space-y-0.5 min-w-0'>
                      <span className='font-bold text-sky-700 dark:text-sky-400 block text-xs'>
                        Pasien Terjadwal
                      </span>
                      <p className='text-[11.5px] text-muted-foreground truncate'>
                        {slot.appointmentRef?.patientName || 'Pasien terdaftar pada slot ini'}
                      </p>
                    </div>
                  </div>

                  {(data.onOpenPatientDetail || data.onOpenPatients) && (
                    <button
                      type='button'
                      onClick={handleOpenPatientsDetail}
                      className='text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline cursor-pointer shrink-0 transition-colors'
                    >
                      Lihat Pasien
                    </button>
                  )}
                </div>

                {!isClosed && (data.onOpenChangeDoctor || data.onOpenChangeRoom) && (
                  <div className='flex items-center gap-2 pt-2 border-t border-sky-500/20'>
                    {data.onOpenChangeDoctor && (
                      <button
                        type='button'
                        onClick={() => {
                          onClose();
                          data.onOpenChangeDoctor?.(session, slot);
                        }}
                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer'
                      >
                        <Icons.userCheck className='size-3.5' />
                        <span>Ganti Dokter</span>
                      </button>
                    )}
                    {data.onOpenChangeRoom && (
                      <button
                        type='button'
                        onClick={() => {
                          onClose();
                          data.onOpenChangeRoom?.(session, slot);
                        }}
                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-400 border border-purple-500/30 transition-colors cursor-pointer'
                      >
                        <Icons.mapPin className='size-3.5' />
                        <span>Ganti Ruangan</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAvailable && (
              <div className='p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5 shadow-2xs'>
                <Icons.check className='size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5' />
                <div className='space-y-0.5'>
                  <span className='font-bold text-emerald-700 dark:text-emerald-400 block text-xs'>
                    Slot Tersedia
                  </span>
                  <p className='text-[11.5px] text-muted-foreground'>
                    Slot waktu <strong className='text-foreground font-mono'>{slot.startTime} - {slot.endTime} WIB</strong> saat ini kosong dan dapat menerima pendaftaran pasien baru.
                  </p>
                </div>
              </div>
            )}

            {isClosed && (
              <div className='p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5 shadow-2xs'>
                <Icons.lock className='size-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5' />
                <div className='space-y-0.5'>
                  <span className='font-bold text-rose-700 dark:text-rose-400 block text-xs'>
                    Sesi Praktik Ditutup
                  </span>
                  <p className='text-[11.5px] text-muted-foreground'>
                    Sesi praktik pada jam ini sedang ditutup sehingga tidak dapat dipesan oleh pasien baru.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - No border-t */}
        <div className='pt-2 flex items-center justify-between gap-3 select-none shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='md'
            onClick={onClose}
            className='min-w-[90px] cursor-pointer'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2'>
            {data.onToggleSessionStatus && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='md'
                onClick={handleToggleStatus}
                className={cn(
                  'cursor-pointer text-xs',
                  isClosed ? 'hover:text-emerald-600' : 'hover:text-rose-600'
                )}
              >
                {isClosed ? 'Buka Jadwal' : 'Tutup Jadwal'}
              </Button>
            )}

            {data.onOpenReschedule && session.is_reschedule_eligible && (
              <Button
                type='button'
                variant='primary'
                shape='pill'
                size='md'
                onClick={handleReschedule}
                withTrailingCircleIcon={true}
                trailingIcon={<Icons.history className='size-3 stroke-[2.5]' />}
                className='cursor-pointer text-xs min-w-[120px]'
              >
                Reschedule
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
