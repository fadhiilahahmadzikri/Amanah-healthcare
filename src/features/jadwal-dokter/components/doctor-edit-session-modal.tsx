'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import { clinicRoomsQueryOptions } from '../api/queries';
import type { DoctorSchedule, DoctorDailySession, SessionStatus, ClinicRoom } from '../api/types';

export interface DoctorEditSessionModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
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

function getShiftGroupName(time: string): string {
  if (!time) return 'Sesi Praktik';
  const h = parseInt(time.split(':')[0] || '0', 10);
  if (h >= 0 && h < 6) return 'Dini Hari';
  if (h >= 6 && h < 12) return 'Sesi Pagi';
  if (h >= 12 && h < 17) return 'Sesi Siang';
  return 'Sesi Malam';
}

function normalizeRoomValue(
  rawRoom: string,
  roomList: ClinicRoom[]
): string {
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
  portalContainerRef
}: DoctorEditSessionModalProps) {
  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [jamMulai, setJamMulai] = useState('08:00');
  const [statusSesi, setStatusSesi] = useState<SessionStatus>('Buka');
  const [ruang, setRuang] = useState('');

  // Dynamic clinic rooms from master database (GET /api/v1/schedules/reference/rooms)
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery(clinicRoomsQueryOptions());

  useEffect(() => {
    if (session) {
      setJamMulai(session.jam_mulai || '08:00');
      const raw = (session.status_sesi || 'Buka').toUpperCase();
      setStatusSesi(raw === 'TUTUP' || raw === 'CLOSED' ? 'Tutup' : 'Buka');
      const rawRoom = session.ruang || doctor?.ruang_praktik || '';
      setRuang(normalizeRoomValue(rawRoom, rooms));
    }
  }, [session, doctor, rooms]);

  // Auto-accumulated end time (matches mobile duration projection)
  const jamSelesaiCalculated = useMemo(() => {
    return calculateEndTime(jamMulai, 30);
  }, [jamMulai]);

  // Auto-projected shift group name based on start time
  const autoShiftGroup = useMemo(() => {
    return getShiftGroupName(jamMulai);
  }, [jamMulai]);

  if (!doctor || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAvailable = statusSesi === 'Buka';

    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          nama_sesi: autoShiftGroup,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesaiCalculated,
          kuota_pasien: 1,
          slot_tersedia: isAvailable ? 1 : 0,
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
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Edit Sesi Dokter
            </h3>
            <p className='text-xs text-muted-foreground truncate'>
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

        {/* Record 1: Waktu Praktik (Jam Mulai & Jam Selesai) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Mulai
            </Label>
            <Select value={jamMulai} onValueChange={setJamMulai}>
              <SelectTrigger className='w-full h-8.5 text-xs font-mono font-semibold'>
                <SelectValue placeholder='Pilih jam' />
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

        {/* Record 2: Ruang Praktik & Status Sesi */}
        <div className='grid grid-cols-2 gap-2.5 pb-1'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Ruang Praktik
            </Label>
            <Select
              value={ruang || undefined}
              onValueChange={setRuang}
            >
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

          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Status Sesi
            </Label>
            <Select
              value={statusSesi}
              onValueChange={(val) => setStatusSesi(val as SessionStatus)}
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
                {(['Buka', 'Tutup'] as const).map((st) => {
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
                        <span className={cn('font-semibold', cfg.textGradient)}>
                          {cfg.label}
                        </span>
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
