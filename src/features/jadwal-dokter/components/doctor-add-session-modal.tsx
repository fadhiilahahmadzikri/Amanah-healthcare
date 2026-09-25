'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
import { useCreateDoctorSessionMutation } from '../api/mutations';
import { clinicRoomsQueryOptions, scheduleContextsQueryOptions } from '../api/queries';
import { getScheduleProjection } from '../api/service';
import { toast } from 'sonner';
import type { DoctorSchedule, DoctorDailySession, ClinicRoom } from '../api/types';

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
}

// 48 discrete 30-minute intervals covering 24 hours (00:00 - 23:30)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

interface DerivedShiftInfo {
  contextId: string;
  shift: string;
  name: string;
  icon: string;
  boundaryEnd: string;
}

function deriveShiftFromTime(
  timeStr: string,
  contexts: Array<{
    id?: string;
    shift?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
  }> = []
): DerivedShiftInfo {
  const [hStr, mStr] = (timeStr || '06:00').split(':');
  const h = parseInt(hStr || '6', 10);
  const m = parseInt(mStr || '0', 10);
  const minutes = h * 60 + m;

  let shift = 'morning';
  let name = 'Sesi Pagi';
  let icon = '🌅';
  let boundaryEnd = '12:00';

  if (minutes < 360) {
    shift = 'early_morning';
    name = 'Shift Dini Hari';
    icon = '🌙';
    boundaryEnd = '06:00';
  } else if (minutes < 720) {
    shift = 'morning';
    name = 'Sesi Pagi';
    icon = '🌅';
    boundaryEnd = '12:00';
  } else if (minutes < 1080) {
    shift = 'afternoon';
    name = 'Sesi Siang / Sore';
    icon = '☀️';
    boundaryEnd = '18:00';
  } else {
    shift = 'night';
    name = 'Sesi Malam';
    icon = '🌃';
    boundaryEnd = '24:00';
  }

  const matchedContext = contexts.find(
    (c) =>
      c.shift?.toLowerCase() === shift ||
      (c.startTime && c.endTime && timeStr >= c.startTime && timeStr < c.endTime)
  );

  return {
    contextId: matchedContext?.id || shift,
    shift,
    name: matchedContext?.name || name,
    icon,
    boundaryEnd
  };
}

function calculateDynamicCapacity(startTime: string, endTime: string, slotDuration = 30): number {
  const [startH, startM] = startTime.split(':').map((v) => parseInt(v, 10));
  const [endH, endM] = endTime.split(':').map((v) => parseInt(v, 10));
  const startMin = (startH ?? 6) * 60 + (startM ?? 0);
  const endMin = (endH === 24 ? 24 : (endH ?? 12)) * 60 + (endM ?? 0);
  const diff = Math.max(0, endMin - startMin);
  return Math.max(1, Math.floor(diff / slotDuration));
}

function normalizeRoomValue(rawRoom: string, roomList: ClinicRoom[]): string {
  if (!rawRoom) return '';
  const trimmed = rawRoom.trim();
  const exact = roomList.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact.name;
  const byId = roomList.find((r) => r.id.toLowerCase() === trimmed.toLowerCase());
  if (byId) return byId.name;
  const startsWith = roomList.find((r) => trimmed.toLowerCase().startsWith(r.name.toLowerCase()));
  if (startsWith) return startsWith.name;
  const partial = roomList.find(
    (r) =>
      r.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(r.name.toLowerCase())
  );
  if (partial) return partial.name;
  return trimmed;
}

export function DoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  portalContainerRef,
  targetDate,
  initialStartTime
}: DoctorAddSessionModalProps) {
  const createSessionMutation = useCreateDoctorSessionMutation();

  // Dynamic schedule contexts from backend SSOT
  const { data: contexts = [] } = useQuery(scheduleContextsQueryOptions(targetDate));

  const [jamMulai, setJamMulai] = useState('06:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [kuotaPasien, setKuotaPasien] = useState<number>(12);
  const [ruang, setRuang] = useState('');

  // Sequence reference to prevent race conditions / out-of-order async collision
  const projectionReqRef = React.useRef(0);

  // Dynamic clinic rooms from master database (GET /api/v1/schedules/reference/rooms)
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery(clinicRoomsQueryOptions());

  const derivedShift = useMemo(() => {
    return deriveShiftFromTime(jamMulai, contexts);
  }, [jamMulai, contexts]);

  // Synchronize initial start time, room, and dynamic slot projection
  React.useEffect(() => {
    if (isOpen) {
      const initialStart = initialStartTime || '06:00';
      setJamMulai(initialStart);

      const shiftInfo = deriveShiftFromTime(initialStart, contexts);
      const defaultProjectedEnd = shiftInfo.boundaryEnd;
      setJamSelesai(defaultProjectedEnd);

      const initialCap = calculateDynamicCapacity(initialStart, defaultProjectedEnd);
      setKuotaPasien(initialCap);

      const currentReq = ++projectionReqRef.current;
      getScheduleProjection({
        scheduleContextId: shiftInfo.contextId,
        startTime: initialStart,
        date: targetDate,
        practitionerId: doctor?.id
      })
        .then((res) => {
          if (currentReq !== projectionReqRef.current) return;
          if (res?.projectedEndTime) {
            setJamSelesai(res.projectedEndTime);
            const cap =
              typeof res.capacity === 'number'
                ? res.capacity
                : calculateDynamicCapacity(initialStart, res.projectedEndTime);
            setKuotaPasien(cap);
          }
        })
        .catch((err) => {
          if (currentReq !== projectionReqRef.current) return;
          console.error('Initial projection error:', err);
        });

      const rawRoom = doctor?.ruang_praktik || '';
      setRuang(normalizeRoomValue(rawRoom, rooms));
    }
  }, [isOpen, initialStartTime, doctor?.id, doctor?.ruang_praktik, rooms, contexts, targetDate]);

  if (!doctor) return null;

  const handleJamMulaiChange = (newMulai: string) => {
    setJamMulai(newMulai);
    const shiftInfo = deriveShiftFromTime(newMulai, contexts);
    const defaultProjectedEnd = shiftInfo.boundaryEnd;
    setJamSelesai(defaultProjectedEnd);

    const initialCap = calculateDynamicCapacity(newMulai, defaultProjectedEnd);
    setKuotaPasien(initialCap);

    const currentReq = ++projectionReqRef.current;
    getScheduleProjection({
      scheduleContextId: shiftInfo.contextId,
      startTime: newMulai,
      date: targetDate,
      practitionerId: doctor.id
    })
      .then((res) => {
        if (currentReq !== projectionReqRef.current) return;
        if (res?.projectedEndTime) {
          setJamSelesai(res.projectedEndTime);
          const cap =
            typeof res.capacity === 'number'
              ? res.capacity
              : calculateDynamicCapacity(newMulai, res.projectedEndTime);
          setKuotaPasien(cap);
        }
      })
      .catch((err) => {
        if (currentReq !== projectionReqRef.current) return;
        console.error('Projection error:', err);
      });
  };

  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Hari Ini';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveDate = targetDate || new Date().toISOString().split('T')[0];
    const newSession: DoctorDailySession = {
      id: `${doctor.id}-s-${Date.now()}`,
      nama_sesi: derivedShift.name,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      waktu: `${jamMulai} - ${jamSelesai} WIB`,
      kuota_pasien: kuotaPasien,
      slot_tersedia: kuotaPasien,
      status_sesi: 'OPEN',
      ruang: ruang || doctor.ruang_praktik
    };

    createSessionMutation.mutate(
      {
        doctorId: doctor.id,
        payload: {
          schedule_date: effectiveDate,
          nama_sesi: derivedShift.name,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          kuota_pasien: kuotaPasien,
          slot_tersedia: kuotaPasien,
          status_sesi: 'OPEN',
          ruang: ruang || doctor.ruang_praktik || undefined
        }
      },
      {
        onSuccess: () => {
          onSessionAdded?.(newSession);
          toast.success(
            `${derivedShift.name} (${jamMulai} - ${jamSelesai} WIB) berhasil ditambahkan.`
          );
          onClose();
        }
      }
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[460px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* 1. Header Identitas */}
        <div className='flex items-start justify-between gap-3 pb-2.5 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Tambah Sesi Praktik Dokter
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

        {/* 2. Tanggal Praktik Badge */}
        <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-xs text-foreground/80'>
          <Icons.calendar className='size-3.5 text-primary shrink-0' />
          <span className='font-medium text-muted-foreground'>Tanggal Praktik:</span>
          <span className='font-semibold text-foreground truncate'>{formattedDate}</span>
        </div>

        {/* 3. Input Controls: Jam Mulai & Ruang Praktik */}
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label className='text-xs font-semibold text-foreground/85 block mb-1.5'>
              Jam Mulai Praktik
            </Label>
            <Select value={jamMulai} onValueChange={handleJamMulaiChange}>
              <SelectTrigger className='w-full h-9 text-xs font-mono font-semibold'>
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
            <Label className='text-xs font-semibold text-foreground/85 block mb-1.5'>
              Ruang Praktik
            </Label>
            <Select value={ruang || undefined} onValueChange={setRuang}>
              <SelectTrigger className='w-full h-9 text-xs truncate'>
                <SelectValue placeholder='Pilih Ruangan' />
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
        </div>

        {/* 4. Otomasi Kalkulasi & Proyeksi Slot (Dynamic Slot Derivation SSOT) */}
        <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2.5'>
          <div className='flex items-center justify-between gap-2 border-b border-border/40 pb-2'>
            <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
              Proyeksi Otomatis Jadwal
            </span>
            <div className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-bold'>
              <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
              Buka
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div>
              <span className='text-[11px] text-muted-foreground block'>Shift Otomatis</span>
              <span className='font-semibold text-foreground flex items-center gap-1 mt-0.5'>
                <span>{derivedShift.icon}</span>
                <span>{derivedShift.name}</span>
              </span>
            </div>

            <div>
              <span className='text-[11px] text-muted-foreground block'>Jam Selesai</span>
              <span className='font-mono font-semibold text-foreground block mt-0.5'>
                {jamSelesai} WIB
              </span>
            </div>
          </div>

          <div className='pt-1 flex items-center justify-between gap-2 text-xs border-t border-border/30'>
            <span className='text-muted-foreground text-[11.5px]'>
              Alokasi Kuota ({jamMulai} - {jamSelesai})
            </span>
            <span className='font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded-md border border-border/60'>
              {kuotaPasien} Pasien ({kuotaPasien * 30} mnt)
            </span>
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className='pt-2 flex items-center justify-end gap-2.5 border-t border-border/40'>
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
            disabled={createSessionMutation.isPending}
            className='px-5 font-semibold text-xs'
          >
            {createSessionMutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Tambahkan Sesi
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
