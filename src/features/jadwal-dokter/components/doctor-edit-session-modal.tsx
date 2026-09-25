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
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import {
  clinicRoomsQueryOptions,
  scheduleReferenceOptionsQueryOptions,
  scheduleContextsQueryOptions
} from '../api/queries';
import { getScheduleProjection } from '../api/service';
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

// 49 discrete intervals covering 24 hours including 24:00 boundary
const TIME_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  }),
  '24:00'
];

function normalizeRoomValue(rawRoom: string, roomList: ClinicRoom[]): string {
  if (!rawRoom) return '';
  const trimmed = rawRoom.trim();
  // 1. Exact match by name
  const exact = roomList.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact.name;
  // 2. Exact match by id
  const byId = roomList.find((r) => r.id.toLowerCase() === trimmed.toLowerCase());
  if (byId) return byId.name;
  // 3. Match if rawRoom starts with room.name (e.g. "Ruang KIA 1, Gedung Utama" -> "Ruang KIA 1")
  const startsWith = roomList.find((r) => trimmed.toLowerCase().startsWith(r.name.toLowerCase()));
  if (startsWith) return startsWith.name;
  // 4. Partial substring match
  const partial = roomList.find(
    (r) =>
      r.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(r.name.toLowerCase())
  );
  if (partial) return partial.name;
  return trimmed;
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
  const [jamSelesai, setJamSelesai] = useState('08:30');
  const [kuotaPasien, setKuotaPasien] = useState<number>(12);
  const [statusSesi, setStatusSesi] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [ruang, setRuang] = useState('');

  const sessionDate = targetDate || session?.tanggal || doctor?.tanggal_praktik;

  // Sequence reference to prevent race conditions / collision
  const projectionReqRef = React.useRef(0);

  // Dynamic clinic rooms from master database (GET /api/v1/schedules/reference/rooms)
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery(clinicRoomsQueryOptions());
  // Dynamic reference options & schedule contexts from backend SSOT
  const { data: refOptions } = useQuery(scheduleReferenceOptionsQueryOptions());
  const { data: contexts = [] } = useQuery(scheduleContextsQueryOptions(sessionDate));

  const resolveContextId = React.useCallback(
    (shiftNameOrId: string, time: string) => {
      const match = contexts.find(
        (c) =>
          c.id === shiftNameOrId ||
          c.shift?.toLowerCase() === shiftNameOrId.toLowerCase() ||
          c.name?.toLowerCase() === shiftNameOrId.toLowerCase() ||
          (time >= c.startTime && time < c.endTime)
      );
      return match?.id;
    },
    [contexts]
  );

  useEffect(() => {
    if (session) {
      setJamMulai(session.jam_mulai || '08:00');
      setJamSelesai(session.jam_selesai || '08:30');
      setKuotaPasien(session.kuota_pasien || 12);
      const raw = (session.status_sesi || 'OPEN').toUpperCase();
      setStatusSesi(raw === 'CLOSED' ? 'CLOSED' : 'OPEN');
      const rawRoom = session.ruang || doctor?.ruang_praktik || '';
      setRuang(normalizeRoomValue(rawRoom, rooms));
    }
  }, [session, doctor?.ruang_praktik, rooms]);

  const bookedCount = useMemo(() => {
    if (!session) return 0;
    // Single Source of Truth from backend canonical producer
    if (typeof session.pasien_terdaftar === 'number') {
      return session.pasien_terdaftar;
    }
    const raw = (session.status_sesi || '').toUpperCase();
    if (raw === 'CLOSED' || raw === 'CUTI') {
      return 0;
    }
    if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
      return doctor.timeline_intervals.filter(
        (it) =>
          ((it.startTime >= session.jam_mulai && it.startTime < session.jam_selesai) ||
            it.startTime === session.jam_mulai) &&
          Boolean(it.appointmentRef || (it.isOccupied && it.status === 'OCCUPIED'))
      ).length;
    }
    if (raw === 'OCCUPIED') {
      const cap = session.kuota_pasien || 12;
      return Math.max(0, cap - (session.slot_tersedia ?? 0));
    }
    return 0;
  }, [session, doctor?.timeline_intervals]);

  const availableEndTimes = useMemo(() => {
    return TIME_OPTIONS.filter((t) => t > jamMulai);
  }, [jamMulai]);

  const handleJamMulaiChange = (newMulai: string) => {
    setJamMulai(newMulai);
    const contextId = resolveContextId(session?.nama_sesi || '', newMulai);
    const currentReq = ++projectionReqRef.current;
    getScheduleProjection({
      scheduleContextId: contextId,
      startTime: newMulai,
      date: sessionDate,
      practitionerId: doctor?.id
    })
      .then((res) => {
        if (currentReq !== projectionReqRef.current) return;
        if (res?.projectedEndTime) {
          if (jamSelesai <= newMulai) {
            setJamSelesai(res.projectedEndTime);
          }
        }
      })
      .catch((err) => {
        if (currentReq !== projectionReqRef.current) return;
        console.error('Projection error:', err);
      });
  };

  // Auto-projected shift group name based on canonical 24-hour cycle from backend
  const autoShiftGroup = useMemo(() => {
    if (session?.nama_sesi && session.nama_sesi !== 'Sesi Praktik') {
      return session.nama_sesi;
    }
    if (refOptions?.shifts && refOptions.shifts.length > 0) {
      const match = refOptions.shifts.find((s) => {
        const start = s.startTime || '00:00';
        const end = s.endTime || '24:00';
        return jamMulai >= start && jamMulai < end;
      });
      if (match) return match.label || match.name || match.shift;
    }
    const h = parseInt(jamMulai.split(':')[0] || '0', 10);
    if (h >= 0 && h < 6) return 'Shift Dini Hari';
    if (h >= 6 && h < 12) return 'Sesi Pagi';
    if (h >= 12 && h < 18) return 'Sesi Siang / Sore';
    return 'Sesi Malam';
  }, [session?.nama_sesi, jamMulai, refOptions?.shifts]);

  if (!doctor || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAvailable = statusSesi === 'OPEN';
    const computedAvailableSlots = isAvailable ? Math.max(0, kuotaPasien - bookedCount) : 0;

    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          nama_sesi: autoShiftGroup,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          kuota_pasien: kuotaPasien,
          slot_tersedia: computedAvailableSlots,
          status_sesi: statusSesi,
          ruang: ruang || undefined
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
        {/* 1. Header Identitas */}
        <div className='flex items-start justify-between gap-3 pb-2.5 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>Edit Sesi Dokter</h3>
            <p className='text-xs text-muted-foreground truncate'>
              {doctor.nama_dokter} • {session.nama_sesi} ({session.jam_mulai} -{' '}
              {session.jam_selesai} WIB)
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

        {/* Record 1: Waktu Praktik (Jam Mulai & Jam Selesai) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>Jam Mulai</Label>
            <Select value={jamMulai} onValueChange={handleJamMulaiChange}>
              <SelectTrigger className='w-full h-8.5 text-xs font-mono font-semibold'>
                <SelectValue placeholder='Pilih jam mulai' />
              </SelectTrigger>
              <SelectContent className='max-h-56' portalContainerRef={portalContainerRef}>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time} className='font-mono text-xs'>
                    {time} WIB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Selesai
            </Label>
            <Select value={jamSelesai} onValueChange={setJamSelesai}>
              <SelectTrigger className='w-full h-8.5 text-xs font-mono font-semibold'>
                <SelectValue placeholder='Pilih jam selesai' />
              </SelectTrigger>
              <SelectContent className='max-h-56' portalContainerRef={portalContainerRef}>
                {availableEndTimes.map((time) => (
                  <SelectItem key={time} value={time} className='font-mono text-xs'>
                    {time} WIB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Record 2: Kuota Pasien & Slot Tersedia */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Kuota Pasien
            </Label>
            <Input
              type='number'
              min={Math.max(1, bookedCount)}
              max={100}
              value={kuotaPasien}
              onChange={(e) => setKuotaPasien(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className='w-full h-8.5 text-xs font-mono font-semibold'
            />
            {bookedCount > 0 && (
              <p className='text-[10px] text-muted-foreground mt-0.5'>
                Minimal {bookedCount} (jumlah pasien booking)
              </p>
            )}
          </div>

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Slot Tersedia
            </Label>
            <div className='w-full h-8.5 px-3 rounded-md border border-border/50 bg-muted/30 text-xs font-mono font-semibold text-foreground flex items-center justify-between select-none'>
              <span>{statusSesi === 'CLOSED' ? '0' : Math.max(0, kuotaPasien - bookedCount)}</span>
              <span className='text-[10px] font-sans font-medium text-muted-foreground'>
                {bookedCount} terisi
              </span>
            </div>
          </div>
        </div>

        {/* Record 2: Ruang Praktik & Status Sesi */}
        <div className='grid grid-cols-2 gap-2.5 pb-1'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Ruang Praktik
            </Label>
            <Select value={ruang || undefined} onValueChange={setRuang}>
              <SelectTrigger className='w-full h-8.5 text-xs truncate'>
                <SelectValue placeholder='Pilih Ruang Praktik' />
              </SelectTrigger>
              <SelectContent portalContainerRef={portalContainerRef}>
                {ruang && !rooms.some((r) => r.name === ruang) && (
                  <SelectItem value={ruang}>{ruang}</SelectItem>
                )}
                {rooms.map((room) => {
                  const locationText = room.location ? ` (${room.location})` : '';
                  return (
                    <SelectItem key={room.id} value={room.name} disabled={room.isOccupied}>
                      {room.name}
                      {locationText}
                      {room.isOccupied ? ` — Terisi (${room.occupiedBy || 'Dokter Lain'})` : ''}
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
              Status Sesi
            </Label>
            <Select
              value={statusSesi}
              onValueChange={(val) => setStatusSesi(val as 'OPEN' | 'CLOSED')}
            >
              <SelectTrigger className='w-full h-8.5 text-xs font-semibold'>
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                      getStatusConfig(statusSesi).dotGradient
                    )}
                  />
                  <span className={getStatusConfig(statusSesi).textGradient}>
                    {getStatusConfig(statusSesi).label}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent portalContainerRef={portalContainerRef}>
                {(['OPEN', 'CLOSED'] as const).map((st) => {
                  const cfg = getStatusConfig(st);
                  return (
                    <SelectItem key={st} value={st} className='text-xs'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                            cfg.dotGradient
                          )}
                        />
                        <span className={cn('font-semibold', cfg.textGradient)}>{cfg.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className='pt-2 flex items-center justify-between gap-2.5 border-t border-border/40'>
          {onOpenReschedule && (
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
              leadingIcon={<Icons.calendar className='size-3.5 text-primary' />}
            >
              Reschedule
            </Button>
          )}

          <div className='flex items-center gap-2 ml-auto'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='sm'
              onClick={onClose}
              className='px-4 font-medium text-xs'
            >
              Batal
            </Button>
            <Button
              type='submit'
              variant='default'
              shape='pill'
              size='sm'
              disabled={updateSessionMutation.isPending}
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
