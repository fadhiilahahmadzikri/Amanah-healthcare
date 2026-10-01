'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useRescheduleDoctorSessionMutation } from '../api/mutations';
import { clinicRoomsQueryOptions, rescheduleEligibilityQueryOptions } from '../api/queries';
import {
  SCHEDULE_TIME_LABELS,
  SCHEDULE_BUTTON_LABELS,
  SCHEDULE_OCCUPANT_LABELS,
  SCHEDULE_RESCHEDULE_MESSAGES
} from '../constants/schedule-shift.constants';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';

export interface DoctorRescheduleSessionModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  initialDate?: string;
  /** The specific grid slot's start time (HH:mm) the admin hovered on. Pre-populates targetStartTime and shown in the session info card. */
  initialStartTime?: string;
}

// 48 discrete intervals covering 24 hours
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export function DoctorRescheduleSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  portalContainerRef,
  initialDate,
  initialStartTime
}: DoctorRescheduleSessionModalProps) {
  const rescheduleMutation = useRescheduleDoctorSessionMutation();

  const [targetDate, setTargetDate] = useState('');
  const [targetStartTime, setTargetStartTime] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [notes, setNotes] = useState('');
  const [rescheduleActiveAppointments, setRescheduleActiveAppointments] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Fetch dynamic clinic rooms from PostgreSQL SSOT
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery(clinicRoomsQueryOptions());

  // Live Pre-Check Reschedule Eligibility via Backend SSOT (only runs when targetStartTime is selected)
  const { data: eligibilityData, isFetching: isCheckingEligibility } = useQuery({
    ...rescheduleEligibilityQueryOptions(doctor?.id || '', session?.id || '', {
      targetDate,
      targetStartTime,
      targetRoomId: targetRoomId || undefined
    }),
    enabled: Boolean(isOpen && doctor?.id && session?.id && targetDate && targetStartTime)
  });

  useEffect(() => {
    setBannerDismissed(false);
  }, [targetDate, targetStartTime, targetRoomId]);

  const hasConflict = Boolean(targetStartTime && eligibilityData && !eligibilityData.isEligible);
  const showConflictBanner = hasConflict && !bannerDismissed;

  useEffect(() => {
    if (session) {
      setTargetStartTime(initialStartTime || '');
      setNotes('');
      setRescheduleActiveAppointments(true);
      if (initialDate) {
        setTargetDate(initialDate);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTargetDate(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [session, initialDate, initialStartTime]);

  // Set default targetRoomId to the session's current room if matched
  useEffect(() => {
    if (session && rooms.length > 0 && !targetRoomId) {
      const currentRoomName = (session.ruang ?? doctor?.ruang_praktik ?? '').trim();
      const matched = rooms.find(
        (r) =>
          r.name.toLowerCase() === currentRoomName.toLowerCase() ||
          currentRoomName.toLowerCase().startsWith(r.name.toLowerCase()) ||
          r.id.toLowerCase() === currentRoomName.toLowerCase()
      );
      if (matched) {
        setTargetRoomId(matched.id);
      }
    }
  }, [session, doctor, rooms, targetRoomId]);

  const selectedDateObj = useMemo(() => {
    if (!targetDate) return undefined;
    const parts = targetDate.split('-');
    if (parts.length !== 3) return undefined;
    const y = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const d = parseInt(parts[2] || '0', 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
    return new Date(y, m - 1, d);
  }, [targetDate]);

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDateObj) return SCHEDULE_TIME_LABELS.CHOOSE_DATE;
    return selectedDateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [selectedDateObj]);

  const targetEndTimeCalculated = useMemo(() => {
    return eligibilityData?.targetValidation?.projectedEndTime || '';
  }, [eligibilityData?.targetValidation?.projectedEndTime]);

  if (!doctor || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStartTime || !targetDate) return;

    const finalReason = notes.trim() ? notes.trim() : undefined;
    const derivedShift = eligibilityData?.targetSimulation?.targetShift;

    rescheduleMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          targetDate,
          targetStartTime,
          targetShift: derivedShift,
          targetRoomId: targetRoomId || undefined,
          notes: finalReason,
          reason: finalReason,
          rescheduleActiveAppointments
        }
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[480px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* Accordion Dropdown Ineligibility/Conflict Banner */}
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            showConflictBanner
              ? 'grid-rows-[1fr] opacity-100 mb-3'
              : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
          )}
        >
          <div className='overflow-hidden'>
            <div className='px-3.5 py-2.5 bg-destructive/10 dark:bg-destructive/20 border border-destructive/25 text-destructive flex items-center justify-between gap-3 select-none rounded-xl'>
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <Icons.warning className='size-4 shrink-0 text-destructive' />
                <div className='text-xs leading-snug min-w-0'>
                  <span className='font-bold mr-1'>
                    {SCHEDULE_RESCHEDULE_MESSAGES.INELIGIBLE_TITLE}
                  </span>
                  <span className='text-[11.5px] opacity-90'>
                    {eligibilityData?.targetValidation?.conflictMessage ??
                      eligibilityData?.actionableGuidance ??
                      SCHEDULE_RESCHEDULE_MESSAGES.DEFAULT_CONFLICT}
                  </span>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setBannerDismissed(true)}
                aria-label='Tutup pemberitahuan'
                className='p-1 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0'
              >
                <Icons.close className='size-3.5' />
              </button>
            </div>
          </div>
        </div>

        {/* Header Identitas */}
        <div className='flex items-center justify-between gap-3 pb-2.5 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Reschedule Sesi Dokter
            </h3>
            <p className='text-xs text-muted-foreground truncate'>
              {doctor.nama_dokter} •{' '}
              {doctor.spesialisasi.toLowerCase().startsWith('poli')
                ? doctor.spesialisasi
                : `Poli ${doctor.spesialisasi}`}
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

        {/* Sumber Info Sesi Asal (Fluid Full Width) */}
        <div className='w-full p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1.5'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5 font-semibold text-foreground truncate'>
              <Icons.calendar className='size-3.5 text-primary shrink-0' />
              <span>
                {session.nama_sesi}
                {initialStartTime ? (
                  <> &bull; <span className='font-mono'>{initialStartTime} WIB</span></>
                ) : (
                  <> ({session.jam_mulai} - {session.jam_selesai} WIB)</>
                )}
              </span>
            </div>
            <StatusBadge status={session.status_sesi} size='sm' className='shrink-0' />
          </div>
          <div className='text-[11.5px] text-muted-foreground flex items-center gap-1.5'>
            <Icons.location className='size-3 text-muted-foreground/70 shrink-0' />
            <span className='truncate'>{session.ruang}</span>
          </div>
        </div>

        {/* Record 1: Tanggal Tujuan & Ruang Tujuan (2 Fields Side-by-Side) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Tanggal Tujuan
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-8.5 px-2.5 justify-start text-left font-normal text-xs font-mono shadow-2xs hover:bg-muted/50 cursor-pointer'
                >
                  <Icons.calendar className='mr-1.5 size-3.5 text-muted-foreground shrink-0' />
                  <span className={cn('truncate', !targetDate && 'text-muted-foreground')}>
                    {formattedDisplayDate}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0 z-[70] shadow-xl' align='start' sideOffset={8}>
                <Calendar
                  mode='single'
                  selected={selectedDateObj}
                  onSelect={(d) => {
                    if (d) {
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setTargetDate(`${y}-${m}-${day}`);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Ruangan Tujuan
            </Label>
            <Select value={targetRoomId || undefined} onValueChange={setTargetRoomId}>
              <SelectTrigger className='w-full h-8.5 text-xs truncate'>
                <SelectValue placeholder='Pilih Ruangan Tujuan' />
              </SelectTrigger>
              <SelectContent className='z-[70]'>
                {rooms.map((room) => {
                  const locationText = room.location ? ` (${room.location})` : '';
                  return (
                    <SelectItem key={room.id} value={room.id} disabled={room.isOccupied}>
                      {room.name}
                      {locationText}
                      {room.isOccupied
                        ? ` — Terisi (${room.occupiedBy ?? SCHEDULE_OCCUPANT_LABELS.OTHER_DOCTOR})`
                        : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {isLoadingRooms && (
              <p className='text-[10px] text-muted-foreground mt-0.5'>Memuat ruangan...</p>
            )}
          </div>
        </div>

        {/* Record 2: Jam Mulai Baru & Jam Selesai Baru (2 Fields Side-by-Side) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Mulai Baru
            </Label>
            <Select value={targetStartTime || undefined} onValueChange={setTargetStartTime}>
              <SelectTrigger className='w-full h-8.5 text-xs font-mono font-semibold'>
                <SelectValue placeholder='Pilih jam mulai baru' />
              </SelectTrigger>
              <SelectContent className='max-h-56 z-[70]'>
                {TIME_OPTIONS.map((time) => {
                  const isOriginalTime =
                    time === session.jam_mulai &&
                    targetDate === (initialDate || doctor?.tanggal_praktik);
                  return (
                    <SelectItem key={time} value={time} className='font-mono text-xs'>
                      {time} {SCHEDULE_TIME_LABELS.TIMEZONE} {isOriginalTime ? '(Jadwal Asal)' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Selesai Baru
            </Label>
            <div className='w-full h-8.5 px-3 rounded-md border border-border/50 bg-muted/30 text-xs font-mono font-semibold text-foreground flex items-center justify-between select-none'>
              <span>
                {targetEndTimeCalculated
                  ? `${targetEndTimeCalculated} ${SCHEDULE_TIME_LABELS.TIMEZONE}`
                  : SCHEDULE_TIME_LABELS.DASH}
              </span>
              <span className='text-[10px] font-sans font-medium text-muted-foreground'>
                {SCHEDULE_TIME_LABELS.AUTOMATIC}
              </span>
            </div>
          </div>
        </div>

        {/* Catatan Pemindahan (Opsional) */}
        <div>
          <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
            Catatan Pemindahan <span className='text-muted-foreground font-normal'>(Opsional)</span>
          </Label>
          <Input
            type='text'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Contoh: Penyesuaian shift operasional dokter'
            className='h-8.5 text-xs'
          />
        </div>

        {/* Checkbox Alihkan Pasien */}
        <div className='flex items-start gap-2.5 p-2.5 rounded-xl border border-border/50 bg-muted/20'>
          <Checkbox
            id='reschedule-active'
            checked={rescheduleActiveAppointments}
            onCheckedChange={(checked) => setRescheduleActiveAppointments(Boolean(checked))}
            className='mt-0.5'
          />
          <div className='space-y-0.5'>
            <Label
              htmlFor='reschedule-active'
              className='text-xs font-bold text-foreground cursor-pointer'
            >
              Alihkan antrean pasien terdaftar secara otomatis
            </Label>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Seluruh janji temu pasien yang sudah booking pada jam ini akan otomatis dialihkan ke
              jadwal baru.
            </p>
          </div>
        </div>

        {/* Conflict Error Message Display */}
        {rescheduleMutation.isError && (
          <div className='p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1'>
            <div className='flex items-center gap-1.5 font-bold'>
              <Icons.warning className='size-3.5 shrink-0' />
              <span>Gagal Reschedule</span>
            </div>
            <p className='text-[11px]'>
              {(rescheduleMutation.error as Error)?.message ||
                'Terjadi bentrok jadwal atau ruangan sudah terpakai pada jam tersebut.'}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className='pt-2 flex items-center justify-end gap-2.5 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-4 font-medium text-xs'
          >
            {SCHEDULE_BUTTON_LABELS.CANCEL}
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='sm'
            disabled={
              !targetStartTime ||
              !targetDate ||
              rescheduleMutation.isPending ||
              isCheckingEligibility ||
              (eligibilityData !== undefined && !eligibilityData.isEligible)
            }
            className='px-5 font-semibold text-xs'
          >
            {rescheduleMutation.isPending || isCheckingEligibility ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.calendar className='mr-1.5 size-3.5' />
            )}
            Konfirmasi Reschedule
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
