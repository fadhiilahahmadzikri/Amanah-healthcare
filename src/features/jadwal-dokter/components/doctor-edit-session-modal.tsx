'use client';

import React, { useState, useEffect } from 'react';
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
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import type { DoctorSchedule, DoctorDailySession, SessionStatus } from '../api/types';

export interface DoctorEditSessionModalProps {
  doctor: DoctorSchedule | null;
  session: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DoctorEditSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  portalContainerRef
}: DoctorEditSessionModalProps) {
  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [namaSesi, setNamaSesi] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [kuotaPasien, setKuotaPasien] = useState(10);
  const [slotTersedia, setSlotTersedia] = useState(10);
  const [statusSesi, setStatusSesi] = useState<SessionStatus>('Buka');
  const [ruang, setRuang] = useState('');

  useEffect(() => {
    if (session) {
      setNamaSesi(session.nama_sesi || 'Sesi Praktik');
      setJamMulai(session.jam_mulai || '08:00');
      setJamSelesai(session.jam_selesai || '12:00');
      setKuotaPasien(session.kuota_pasien || 10);
      setSlotTersedia(session.slot_tersedia ?? session.kuota_pasien ?? 10);
      setStatusSesi(session.status_sesi || 'Buka');
      setRuang(session.ruang || doctor?.ruang_praktik || '');
    }
  }, [session, doctor]);

  if (!doctor || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          nama_sesi: namaSesi,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          kuota_pasien: Number(kuotaPasien),
          slot_tersedia: Number(slotTersedia),
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
      maxWidth='max-w-[500px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* 1. Header Identitas */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Ubah sesi jadwal praktik
            </h3>
            <p className='text-xs text-muted-foreground'>
              {doctor.nama_dokter} • {session.nama_sesi}
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

        {/* 2. Nama Sesi & Jam */}
        <div className='pb-3 border-b border-border/40 space-y-3'>
          <div>
            <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
              Nama label sesi
            </span>
            <Input
              type='text'
              value={namaSesi}
              onChange={(e) => setNamaSesi(e.target.value)}
              placeholder='Contoh: Sesi Pagi, Sesi Sore'
              className='h-8 text-xs'
              required
            />
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
        <div className='pb-3 border-b border-border/40 space-y-3'>
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
                  <SelectItem value='Tutup'>⚪ Tutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
              Ruang praktik sesi
            </span>
            <Input
              type='text'
              value={ruang}
              onChange={(e) => setRuang(e.target.value)}
              placeholder='Contoh: Poli Penyakit Dalam, Ruang 201'
              className='h-8 text-xs'
            />
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
            disabled={updateSessionMutation.isPending}
            className='px-6 font-semibold text-xs'
          >
            {updateSessionMutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Simpan perubahan
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
