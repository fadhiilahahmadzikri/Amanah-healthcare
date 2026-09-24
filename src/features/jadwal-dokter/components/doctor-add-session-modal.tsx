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
import { cn } from '@/lib/utils';
import { useCreateDoctorSessionMutation } from '../api/mutations';
import { clinicRoomsQueryOptions } from '../api/queries';
import { toast } from 'sonner';
import type { DoctorSchedule, DoctorDailySession, SessionStatus, ClinicRoom } from '../api/types';

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
}

// 48 discrete 30-minute intervals covering 24 hours
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function calculateEndTime(startTime: string, durationMinutes: number = 30): string {
  if (!startTime) return '';
  const parts = startTime.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isNaN(h) || isNaN(m)) return '';
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function normalizeRoomValue(
  rawRoom: string,
  roomList: ClinicRoom[]
): string {
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

const PRESET_SHIFTS = [
  { name: 'Sesi Pagi', start: '08:00', label: '🌅 Sesi Pagi (06:00 - 12:00 WIB)' },
  { name: 'Sesi Siang / Sore', start: '13:00', label: '☀️ Sesi Siang / Sore (12:00 - 18:00 WIB)' },
  { name: 'Sesi Malam', start: '19:00', label: '🌃 Sesi Malam (18:00 - 24:00 WIB)' },
  { name: 'Shift Dini Hari', start: '00:00', label: '🌙 Shift Dini Hari (00:00 - 06:00 WIB)' },
  { name: 'Kustom', start: '08:00', label: '⚙️ Kustom Jam Lainnya' }
];

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

  const [sessionType, setSessionType] = useState<string>('Sesi Pagi');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [statusSesi, setStatusSesi] = useState<SessionStatus>('Buka');
  const [ruang, setRuang] = useState('');

  // Dynamic clinic rooms from master database (GET /api/v1/schedules/reference/rooms)
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery(clinicRoomsQueryOptions());

  React.useEffect(() => {
    if (isOpen) {
      if (initialStartTime) {
        setJamMulai(initialStartTime);
        setSessionType('Kustom');
      } else {
        setSessionType('Sesi Pagi');
        setJamMulai('08:00');
        setStatusSesi('Buka');
      }
      const rawRoom = doctor?.ruang_praktik || '';
      setRuang(normalizeRoomValue(rawRoom, rooms));
    }
  }, [isOpen, initialStartTime, doctor, rooms]);

  const jamSelesaiCalculated = useMemo(() => {
    return calculateEndTime(jamMulai, 30);
  }, [jamMulai]);

  if (!doctor) return null;

  const handleSessionTypeChange = (val: string) => {
    setSessionType(val);
    const preset = PRESET_SHIFTS.find((p) => p.name === val);
    if (preset && preset.name !== 'Kustom') {
      setJamMulai(preset.start);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveDate = targetDate || new Date().toISOString().split('T')[0];
    const isAvailable = statusSesi === 'Buka';

    const newSession: DoctorDailySession = {
      id: `${doctor.id}-s-${Date.now()}`,
      nama_sesi: sessionType,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesaiCalculated,
      waktu: `${jamMulai} - ${jamSelesaiCalculated} WIB`,
      kuota_pasien: 1,
      slot_tersedia: isAvailable ? 1 : 0,
      status_sesi: statusSesi,
      ruang: ruang || doctor.ruang_praktik
    };

    createSessionMutation.mutate(
      {
        doctorId: doctor.id,
        payload: {
          schedule_date: effectiveDate,
          nama_sesi: sessionType,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesaiCalculated,
          kuota_pasien: 1,
          slot_tersedia: isAvailable ? 1 : 0,
          status_sesi: statusSesi,
          ruang: ruang || doctor.ruang_praktik || undefined
        }
      },
      {
        onSuccess: () => {
          onSessionAdded?.(newSession);
          toast.success(`${sessionType} (${jamMulai} WIB) berhasil ditambahkan.`);
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
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Tambah Sesi Dokter
            </h3>
            <p className='text-xs text-muted-foreground truncate'>
              {doctor.nama_dokter} • {doctor.spesialisasi.toLowerCase().startsWith('poli') ? doctor.spesialisasi : `Poli ${doctor.spesialisasi}`}
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

        {/* 2. Status Praktik Segmented Pills */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground/80 block'>
            Status Praktik
          </Label>
          <div className='p-1 rounded-xl bg-muted/30 border border-border/50 grid grid-cols-3 gap-1'>
            {[
              {
                value: 'Buka',
                label: 'Buka',
                dot: 'bg-emerald-500',
                activeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold'
              },
              {
                value: 'Terisi',
                label: 'Terisi',
                dot: 'bg-sky-500',
                activeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 font-bold'
              },
              {
                value: 'Tutup',
                label: 'Tutup',
                dot: 'bg-muted-foreground/60',
                activeClass: 'bg-muted text-foreground border-border/60 font-bold'
              }
            ].map((item) => {
              const isActive = statusSesi === item.value;
              return (
                <button
                  key={item.value}
                  type='button'
                  onClick={() => setStatusSesi(item.value as SessionStatus)}
                  className={cn(
                    'py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border',
                    isActive
                      ? item.activeClass
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium'
                  )}
                >
                  <span className={cn('size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20', item.dot)} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Record 1: Waktu Praktik (2 Field: Jam Mulai & Jam Selesai) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Mulai
            </Label>
            <Select value={jamMulai} onValueChange={setJamMulai}>
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
            <div className='w-full h-8.5 px-3 rounded-md border border-border/50 bg-muted/30 text-xs font-mono font-semibold text-foreground flex items-center justify-between select-none'>
              <span>{jamSelesaiCalculated ? `${jamSelesaiCalculated} WIB` : '-'}</span>
              <span className='text-[10px] font-sans font-medium text-muted-foreground'>
                Otomatis
              </span>
            </div>
          </div>
        </div>

        {/* 4. Record 2: Shift / Template & Ruang Praktik (2 Field Side-by-Side) */}
        <div className='grid grid-cols-2 gap-2.5 pb-1'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Pilihan Shift
            </Label>
            <Select value={sessionType} onValueChange={handleSessionTypeChange}>
              <SelectTrigger className='w-full h-8.5 text-xs truncate font-medium'>
                <SelectValue placeholder='Pilih sesi' />
              </SelectTrigger>
              <SelectContent portalContainerRef={portalContainerRef}>
                {PRESET_SHIFTS.map((p) => (
                  <SelectItem key={p.name} value={p.name} className='text-xs'>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                      {room.name}{locationText}{room.isOccupied ? ` — Terisi (${room.occupiedBy || 'Dokter Lain'})` : ''}
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
