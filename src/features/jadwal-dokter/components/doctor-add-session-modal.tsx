'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useUpdateDoctorScheduleMutation } from '../api/mutations';
import { toast } from 'sonner';
import type { DoctorSchedule, DoctorDailySession, SessionStatus } from '../api/types';

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

const PRESET_SESSIONS = [
  {
    name: 'Sesi Pagi',
    start: '07:30',
    end: '11:30',
    kuota: 12
  },
  {
    name: 'Sesi Siang / Sore',
    start: '14:00',
    end: '17:30',
    kuota: 15
  },
  {
    name: 'Sesi Malam',
    start: '19:00',
    end: '22:00',
    kuota: 10
  },
  {
    name: 'Shift Dini Hari',
    start: '23:00',
    end: '06:00',
    kuota: 8
  }
];

export function DoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  portalContainerRef
}: DoctorAddSessionModalProps) {
  const updateMutation = useUpdateDoctorScheduleMutation();

  const [sessionType, setSessionType] = useState<string>('Sesi Pagi');
  const [jamMulai, setJamMulai] = useState('07:30');
  const [jamSelesai, setJamSelesai] = useState('11:30');
  const [kuotaPasien, setKuotaPasien] = useState(12);
  const [slotTersedia, setSlotTersedia] = useState(12);
  const [statusSesi, setStatusSesi] = useState<SessionStatus>('Buka');

  if (!doctor) return null;

  const handleSessionTypeChange = (val: string) => {
    setSessionType(val);
    const preset = PRESET_SESSIONS.find((p) => p.name === val);
    if (preset) {
      setJamMulai(preset.start);
      setJamSelesai(preset.end);
      setKuotaPasien(preset.kuota);
      setSlotTersedia(preset.kuota);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSession: DoctorDailySession = {
      id: `${doctor.id}-s-${Date.now()}`,
      nama_sesi: sessionType,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      waktu: `${jamMulai} - ${jamSelesai}`,
      kuota_pasien: Number(kuotaPasien),
      slot_tersedia: Number(slotTersedia),
      status_sesi: statusSesi,
      ruang: doctor.ruang_praktik
    };

    const currentSessions = doctor.sesi_harian || [];
    const updatedSessions = [...currentSessions, newSession];

    const updatedTotalCapacity = doctor.kapasitas_per_hari + Number(kuotaPasien);
    const updatedTotalSlots = doctor.slot_tersedia + Number(slotTersedia);

    updateMutation.mutate(
      {
        id: doctor.id,
        payload: {
          sesi_harian: updatedSessions,
          kapasitas_per_hari: updatedTotalCapacity,
          slot_tersedia: updatedTotalSlots
        }
      },
      {
        onSuccess: () => {
          onSessionAdded?.(newSession);
          toast.success(
            `${sessionType} (${jamMulai} - ${jamSelesai}) berhasil ditambahkan ke jadwal.`
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
      maxWidth='max-w-[500px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* 1. Header Identitas */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Tambah sesi jadwal praktik
            </h3>
            <p className='text-xs text-muted-foreground'>
              {doctor.nama_dokter} • {doctor.spesialisasi}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* 2. Pilihan Periode Sesi */}
        <div className='pb-3 border-b border-border/40 space-y-3'>
          <div>
            <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
              Pilihan sesi / shift
            </span>
            <Select value={sessionType} onValueChange={handleSessionTypeChange}>
              <SelectTrigger className='h-9 text-xs'>
                <SelectValue placeholder='Pilih sesi' />
              </SelectTrigger>
              <SelectContent portalContainerRef={portalContainerRef}>
                <SelectItem value='Sesi Pagi'>🌅 Sesi Pagi (06:00 - 12:00)</SelectItem>
                <SelectItem value='Sesi Siang / Sore'>
                  ☀️ Sesi Siang / Sore (12:00 - 18:00)
                </SelectItem>
                <SelectItem value='Sesi Malam'>🌃 Sesi Malam (18:00 - 24:00)</SelectItem>
                <SelectItem value='Shift Dini Hari'>🌙 Shift Dini Hari (00:00 - 06:00)</SelectItem>
                <SelectItem value='Kustom'>⚙️ Kustom Jam Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Jam mulai praktik
              </span>
              <Input
                type='text'
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                placeholder='08:00'
                className='h-8 text-xs font-mono'
                required
              />
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Jam selesai praktik
              </span>
              <Input
                type='text'
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                placeholder='12:00'
                className='h-8 text-xs font-mono'
                required
              />
            </div>
          </div>
        </div>

        {/* 3. Kapasitas & Status Sesi */}
        <div className='pb-3 border-b border-border/40'>
          <div className='grid grid-cols-3 gap-3'>
            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Kuota pasien
              </span>
              <Input
                type='number'
                min={1}
                value={kuotaPasien}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setKuotaPasien(val);
                  setSlotTersedia(val);
                }}
                className='h-8 text-xs font-mono'
                required
              />
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Slot tersedia
              </span>
              <Input
                type='number'
                min={0}
                max={kuotaPasien}
                value={slotTersedia}
                onChange={(e) => setSlotTersedia(Number(e.target.value))}
                className='h-8 text-xs font-mono'
                required
              />
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Status sesi
              </span>
              <Select
                value={statusSesi}
                onValueChange={(val) => setStatusSesi(val as SessionStatus)}
              >
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue placeholder='Pilih status' />
                </SelectTrigger>
                <SelectContent portalContainerRef={portalContainerRef}>
                  <SelectItem value='Buka'>🟢 Buka</SelectItem>
                  <SelectItem value='Penuh'>🟡 Penuh</SelectItem>
                  <SelectItem value='Cuti'>🔵 Cuti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div className='pt-2 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            className='px-5 font-medium text-xs'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='sm'
            disabled={updateMutation.isPending}
            className='px-6 font-semibold text-xs'
          >
            {updateMutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Tambahkan sesi
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
