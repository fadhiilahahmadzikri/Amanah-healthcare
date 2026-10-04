'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import {
  clinicRoomsQueryOptions,
  scheduleContextsQueryOptions,
  scheduleProjectionQueryOptions
} from '../api/queries';
import { resolveCanonicalShift } from '../utils/shift-slot-builder';
import {
  SCHEDULE_STATUS,
  SCHEDULE_OCCUPANT_LABELS,
  SCHEDULE_BUTTON_LABELS,
  SCHEDULE_TIME_LABELS
} from '../constants/schedule-shift.constants';
import { parseTimeToMinutes } from '../utils/schedule-availability-guard';
import type { DoctorSchedule, DoctorDailySession, ClinicRoom } from '../api/types';

export interface DoctorEditSessionModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function normalizeRoomValue(rawRoom: string | undefined | null, roomList: ClinicRoom[]): string {
  if (!rawRoom) return '';
  const trimmed = rawRoom.trim();
  const match = roomList.find(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase() || r.id.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match.name : trimmed;
}

function calculateProjectedEndTime(startTime: string, durationMinutes = 30): string {
  if (!startTime) return '';
  const totalMin = parseTimeToMinutes(startTime);
  if (totalMin === null) return '';
  const endTotal = totalMin + durationMinutes;
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function DoctorEditSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  onOpenReschedule,
  portalContainerRef,
  targetDate
}: DoctorEditSessionModalProps) {
  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [jamMulai, setJamMulai] = useState('08:00');
  const [kuotaPasien, setKuotaPasien] = useState<number>(12);
  const [ruang, setRuang] = useState('');

  const sessionDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    if (session?.tanggal && /^\d{4}-\d{2}-\d{2}$/.test(session.tanggal.trim())) {
      return session.tanggal.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate, session?.tanggal]);

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions(),
    enabled: isOpen
  });

  const { data: contexts = [] } = useQuery({
    ...scheduleContextsQueryOptions(sessionDate),
    enabled: Boolean(isOpen && sessionDate)
  });

  const activeContext = useMemo(() => {
    return contexts.find((c) => {
      const start = c.startTime;
      const end = c.endTime;
      return Boolean(start && end && jamMulai >= start && jamMulai < end);
    });
  }, [contexts, jamMulai]);

  const { data: projectionData } = useQuery({
    ...scheduleProjectionQueryOptions({
      scheduleContextId: activeContext?.id ?? 'morning',
      startTime: jamMulai,
      date: sessionDate,
      practitionerId: doctor?.id
    }),
    enabled: Boolean(isOpen && doctor?.id && sessionDate && jamMulai && activeContext)
  });

  const duration = activeContext?.slotIntervalMinutes ?? 30;

  const jamSelesaiCalculated = useMemo(() => {
    if (projectionData?.projectedEndTime) {
      return projectionData.projectedEndTime;
    }
    if (jamMulai === session?.jam_mulai && session?.jam_selesai) {
      return session.jam_selesai;
    }
    if (jamMulai) {
      return calculateProjectedEndTime(jamMulai, duration);
    }
    return '';
  }, [
    projectionData?.projectedEndTime,
    jamMulai,
    session?.jam_mulai,
    session?.jam_selesai,
    duration
  ]);

  useEffect(() => {
    if (session) {
      setJamMulai(session.jam_mulai);
      setKuotaPasien(session.kuota_pasien);
      const roomToNormalize = session.ruang ? session.ruang : doctor?.ruang_praktik;
      setRuang(normalizeRoomValue(roomToNormalize, rooms));
    }
  }, [session, doctor?.ruang_praktik, rooms]);

  const bookedCount = useMemo(() => {
    if (!session) return 0;
    if (typeof session.pasien_terdaftar === 'number') {
      return session.pasien_terdaftar;
    }
    const raw = session.status_sesi ? session.status_sesi.toUpperCase() : '';
    if (raw === SCHEDULE_STATUS.CLOSED || raw === SCHEDULE_STATUS.CUTI) {
      return 0;
    }
    if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
      return doctor.timeline_intervals.filter(
        (it) =>
          ((it.startTime >= session.jam_mulai && it.startTime < session.jam_selesai) ||
            it.startTime === session.jam_mulai) &&
          Boolean(it.appointmentRef || (it.isOccupied && it.status === SCHEDULE_STATUS.OCCUPIED))
      ).length;
    }
    if (raw === SCHEDULE_STATUS.OCCUPIED) {
      const cap = session.kuota_pasien;
      return Math.max(0, cap - (session.slot_tersedia ?? 0));
    }
    return 0;
  }, [session, doctor?.timeline_intervals]);

  const sessionName = useMemo(() => {
    if (session?.nama_sesi && session.nama_sesi !== 'Sesi Praktik') {
      return session.nama_sesi;
    }
    return activeContext?.name ?? 'Sesi Praktik';
  }, [session?.nama_sesi, activeContext]);

  if (!doctor || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const computedAvailableSlots = Math.max(0, kuotaPasien - bookedCount);
    const resolvedEndTime =
      jamSelesaiCalculated !== '' ? jamSelesaiCalculated : session.jam_selesai;

    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          nama_sesi: sessionName,
          session: resolveCanonicalShift(sessionName),
          jam_mulai: jamMulai,
          jam_selesai: resolvedEndTime,
          startTime: jamMulai,
          endTime: resolvedEndTime,
          kuota_pasien: kuotaPasien,
          slot_tersedia: computedAvailableSlots,
          capacity: kuotaPasien,
          status: SCHEDULE_STATUS.OPEN,
          status_sesi: SCHEDULE_STATUS.OPEN,
          ruang: ruang !== '' ? ruang : undefined
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
        <div className='flex items-center justify-between gap-3 pb-2.5 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>Edit Sesi Dokter</h3>
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

        <div className='w-full p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1.5'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5 font-semibold text-foreground truncate'>
              <Icons.calendar className='size-3.5 text-primary shrink-0' />
              <span>
                {session.nama_sesi} ({session.jam_mulai} - {session.jam_selesai} WIB)
              </span>
            </div>
            <StatusBadge status={session.status_sesi} size='sm' className='shrink-0' />
          </div>
          <div className='text-[11.5px] text-muted-foreground flex items-center gap-1.5'>
            <Icons.location className='size-3 text-muted-foreground/70 shrink-0' />
            <span className='truncate'>
              {session.ruang !== '' ? session.ruang : doctor.ruang_praktik}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>Jam Mulai</Label>
            <Select value={jamMulai} onValueChange={setJamMulai}>
              <SelectTrigger className='w-full h-8.5 text-xs font-mono font-semibold'>
                <SelectValue placeholder='Pilih jam mulai' />
              </SelectTrigger>
              <SelectContent className='max-h-56 z-[70]'>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time} className='font-mono text-xs'>
                    {time} {SCHEDULE_TIME_LABELS.TIMEZONE}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Selesai
            </Label>
            <div className='w-full h-8.5 px-3 rounded-md border border-border/50 bg-muted/30 text-xs font-mono font-semibold text-foreground flex items-center justify-between select-none'>
              <span>
                {jamSelesaiCalculated
                  ? `${jamSelesaiCalculated} ${SCHEDULE_TIME_LABELS.TIMEZONE}`
                  : SCHEDULE_TIME_LABELS.DASH}
              </span>
              <span className='text-[10px] font-sans font-medium text-muted-foreground'>
                {SCHEDULE_TIME_LABELS.AUTOMATIC}
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Ruang Praktik
            </Label>
            <Select value={ruang !== '' ? ruang : undefined} onValueChange={setRuang}>
              <SelectTrigger className='w-full h-8.5 text-xs truncate'>
                <SelectValue placeholder='Pilih Ruang Praktik' />
              </SelectTrigger>
              <SelectContent className='z-[70]'>
                {ruang && !rooms.some((r) => r.name === ruang) && (
                  <SelectItem value={ruang}>{ruang}</SelectItem>
                )}
                {rooms.map((room) => {
                  const locationText = room.location ? ` (${room.location})` : '';
                  return (
                    <SelectItem key={room.id} value={room.name} disabled={room.isOccupied}>
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

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Kuota Pasien
            </Label>
            <Input
              type='number'
              min={Math.max(1, bookedCount)}
              max={100}
              value={kuotaPasien}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                setKuotaPasien(Math.max(1, Number.isNaN(parsed) ? 1 : parsed));
              }}
              className='w-full h-8.5 text-xs font-mono font-semibold'
            />
            {bookedCount > 0 && (
              <p className='text-[10px] text-muted-foreground mt-0.5'>
                Minimal {bookedCount} (jumlah booking)
              </p>
            )}
          </div>
        </div>

        <div className='pt-2 flex items-center justify-between gap-2.5 border-t border-border/40'>
          {onOpenReschedule ? (
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='sm'
              onClick={() => {
                onClose();
                onOpenReschedule(session);
              }}
              className='font-semibold text-xs text-primary border-primary/30 hover:bg-primary/5'
            >
              <Icons.calendar className='mr-1.5 size-3.5 text-primary' />
              Reschedule
            </Button>
          ) : (
            <div />
          )}

          <div className='flex items-center gap-2'>
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
              disabled={!jamMulai || !jamSelesaiCalculated || updateSessionMutation.isPending}
              className='px-5 font-semibold text-xs'
            >
              {updateSessionMutation.isPending ? (
                <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
              ) : (
                <Icons.check className='mr-1.5 size-3.5' />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
