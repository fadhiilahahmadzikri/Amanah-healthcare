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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useCreateDoctorSessionMutation } from '../api/mutations';
import {
  clinicRoomsQueryOptions,
  scheduleContextsQueryOptions,
  scheduleProjectionQueryOptions
} from '../api/queries';
import { toast } from 'sonner';
import { resolveCanonicalShift } from '../utils/shift-slot-builder';
import { SCHEDULE_STATUS } from '../constants/schedule-shift.constants';
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

function calculateProjectedEndTime(startTime: string, durationMinutes = 30): string {
  if (!startTime) return '';
  const [hStr, mStr] = startTime.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
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

  const defaultDate = useMemo(() => {
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      return targetDate.trim();
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [targetDate]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [jamMulai, setJamMulai] = useState('');
  const [ruang, setRuang] = useState('');

  // 1. Dynamic clinic rooms from master database
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    ...clinicRoomsQueryOptions(),
    enabled: isOpen
  });

  // 2. Dynamic schedule contexts from backend SSOT
  const { data: contexts = [] } = useQuery({
    ...scheduleContextsQueryOptions(selectedDate),
    enabled: Boolean(isOpen && selectedDate)
  });

  // 3. Resolve active context dynamically from backend contexts
  const activeContext = useMemo(() => {
    if (!jamMulai) return undefined;
    return contexts.find((c) => {
      const start = c.boundaryStartTime || c.startTime;
      const end = c.boundaryEndTime || c.endTime;
      return Boolean(start && end && jamMulai >= start && jamMulai < end);
    });
  }, [contexts, jamMulai]);

  // 4. Live Schedule Projection from Backend SSOT
  const { data: projectionData } = useQuery({
    ...scheduleProjectionQueryOptions({
      scheduleContextId:
        activeContext?.contextId || activeContext?.id || activeContext?.sessionShift || 'morning',
      startTime: jamMulai,
      date: selectedDate,
      practitionerId: doctor?.id
    }),
    enabled: Boolean(isOpen && doctor?.id && selectedDate && jamMulai && activeContext)
  });

  const duration = activeContext?.effectiveConsultationDurationMinutes || 30;

  // Instant calculation matching backend ScheduleSlotFactory.calculateSessionTiming + live projection fallback
  const jamSelesaiCalculated = useMemo(() => {
    if (projectionData?.projectedEndTime) {
      return projectionData.projectedEndTime;
    }
    if (jamMulai) {
      return calculateProjectedEndTime(jamMulai, duration);
    }
    return '';
  }, [projectionData?.projectedEndTime, jamMulai, duration]);

  // Synchronize initial state upon modal opening
  useEffect(() => {
    if (isOpen) {
      const initialDateValue =
        targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
          ? targetDate.trim()
          : defaultDate;
      setSelectedDate(initialDateValue);

      if (initialStartTime) {
        setJamMulai(initialStartTime);
      } else {
        setJamMulai('');
      }

      const rawRoom = doctor?.ruang_praktik || '';
      setRuang(normalizeRoomValue(rawRoom, rooms));
    }
  }, [isOpen, initialStartTime, doctor?.ruang_praktik, rooms, targetDate, defaultDate]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return undefined;
    const y = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const d = parseInt(parts[2] || '0', 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDateObj) return 'Pilih tanggal';
    return selectedDateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [selectedDateObj]);

  if (!doctor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !jamMulai || !jamSelesaiCalculated) return;

    const capacity = projectionData?.capacity || projectionData?.slotCount || 1;
    const sessionName =
      activeContext?.contextLabel ||
      activeContext?.sessionShift ||
      activeContext?.name ||
      'Sesi Praktik';

    const newSession: DoctorDailySession = {
      id: `${doctor.id}-s-${Date.now()}`,
      nama_sesi: sessionName,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesaiCalculated,
      waktu: `${jamMulai} - ${jamSelesaiCalculated} WIB`,
      kuota_pasien: capacity,
      slot_tersedia: capacity,
      status_sesi: 'OPEN',
      ruang: ruang || doctor.ruang_praktik
    };

    createSessionMutation.mutate(
      {
        doctorId: doctor.id,
        payload: {
          schedule_date: selectedDate,
          nama_sesi: sessionName,
          session: resolveCanonicalShift(sessionName),
          jam_mulai: jamMulai,
          jam_selesai: jamSelesaiCalculated,
          startTime: jamMulai,
          endTime: jamSelesaiCalculated,
          kuota_pasien: capacity,
          slot_tersedia: capacity,
          capacity: capacity,
          status: SCHEDULE_STATUS.OPEN,
          status_sesi: SCHEDULE_STATUS.OPEN,
          ruang: ruang || doctor.ruang_praktik || undefined
        }
      },
      {
        onSuccess: () => {
          onSessionAdded?.(newSession);
          toast.success(
            `${sessionName} (${jamMulai} - ${jamSelesaiCalculated} WIB) berhasil ditambahkan.`
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
      maxWidth='max-w-[480px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* Header Identitas */}
        <div className='flex items-center justify-between gap-3 pb-2.5 border-b border-border/40'>
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

        {/* Record 1: Tanggal Praktik & Ruang Praktik (2 Kolom Side-by-Side) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Tanggal Praktik
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-8.5 px-2.5 justify-start text-left font-normal text-xs font-mono shadow-2xs hover:bg-muted/50 cursor-pointer'
                >
                  <Icons.calendar className='mr-1.5 size-3.5 text-muted-foreground shrink-0' />
                  <span className={cn('truncate', !selectedDate && 'text-muted-foreground')}>
                    {formattedDisplayDate}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0 z-50'
                align='start'
                portalContainerRef={portalContainerRef}
              >
                <Calendar
                  mode='single'
                  selected={selectedDateObj}
                  onSelect={(d) => {
                    if (d) {
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setSelectedDate(`${y}-${m}-${day}`);
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
        </div>

        {/* Record 2: Jam Mulai & Jam Selesai (2 Kolom Side-by-Side) */}
        <div className='grid grid-cols-2 gap-2.5'>
          <div>
            <Label className='text-xs font-semibold text-foreground/80 block mb-1'>
              Jam Mulai Praktik
            </Label>
            <Select value={jamMulai || undefined} onValueChange={setJamMulai}>
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
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='sm'
            disabled={
              !selectedDate || !jamMulai || !jamSelesaiCalculated || createSessionMutation.isPending
            }
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
