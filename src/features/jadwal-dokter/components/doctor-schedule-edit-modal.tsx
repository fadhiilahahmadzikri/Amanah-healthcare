'use client';

import React, { useEffect, useState } from 'react';
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
import type { DoctorSchedule } from '../api/types';

export interface DoctorScheduleEditModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorScheduleEditModal({ doctor, isOpen, onClose }: DoctorScheduleEditModalProps) {
  const updateMutation = useUpdateDoctorScheduleMutation();

  const [isCuti, setIsCuti] = useState(false);
  const [cutiReason, setCutiReason] = useState('');
  const [jadwalHariIni, setJadwalHariIni] = useState('');
  const [slotTersedia, setSlotTersedia] = useState(0);
  const [kapasitasPerHari, setKapasitasPerHari] = useState(30);
  const [ruangPraktik, setRuangPraktik] = useState('');
  const [statusJadwal, setStatusJadwal] = useState<'Aktif' | 'Sebagian' | 'Cuti / Tutup' | 'Tutup'>(
    'Aktif'
  );

  useEffect(() => {
    if (doctor) {
      setIsCuti(doctor.is_cuti);
      setCutiReason(doctor.cuti_reason || '');
      setJadwalHariIni(doctor.jadwal_hari_ini);
      setSlotTersedia(doctor.slot_tersedia);
      setKapasitasPerHari(doctor.kapasitas_per_hari);
      setRuangPraktik(doctor.ruang_praktik);
      setStatusJadwal(doctor.status_jadwal);
    }
  }, [doctor]);

  if (!doctor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateMutation.mutate(
      {
        id: doctor.id,
        payload: {
          is_cuti: isCuti,
          cuti_reason: isCuti ? cutiReason : undefined,
          status_dokter: isCuti ? 'Cuti' : 'Aktif',
          status_jadwal: isCuti ? 'Cuti / Tutup' : statusJadwal,
          jadwal_hari_ini: isCuti ? 'Tutup (Cuti)' : jadwalHariIni,
          slot_tersedia: isCuti ? 0 : Number(slotTersedia),
          kapasitas_per_hari: Number(kapasitasPerHari),
          ruang_praktik: ruangPraktik
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
      maxWidth='max-w-[580px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* 1. Header Identitas */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Atur jadwal & kuota praktik dokter
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

        {/* 2. Status Cuti Dokter */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Status cuti dokter
          </span>
          <div className='p-3 rounded-xl border border-border/40 bg-muted/15 space-y-2.5'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <span className='text-xs font-semibold text-foreground block'>
                  {isCuti ? 'Dokter sedang cuti operasional' : 'Dokter aktif berpraktek'}
                </span>
                <span className='text-[11px] text-muted-foreground block'>
                  {isCuti
                    ? 'Seluruh slot otomatis ditutup dan sinkron ke portal pasien.'
                    : 'Dokter melayani jadwal konsultasi & tindakan.'}
                </span>
              </div>
              <Button
                type='button'
                variant={isCuti ? 'destructive' : 'outline'}
                shape='pill'
                size='sm'
                onClick={() => setIsCuti(!isCuti)}
                className='font-medium text-xs shrink-0'
              >
                {isCuti ? 'Batalkan cuti' : 'Set dokter cuti'}
              </Button>
            </div>

            {isCuti && (
              <div className='pt-2 border-t border-border/40'>
                <span className='text-[11px] font-normal text-muted-foreground/70 block mb-1'>
                  Alasan cuti / keterangan
                </span>
                <Input
                  value={cutiReason}
                  onChange={(e) => setCutiReason(e.target.value)}
                  placeholder='Contoh: Cuti tahunan, seminar medis, izin sakit...'
                  className='h-8 text-xs bg-background'
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Jadwal & Kapasitas Harian */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Pengaturan jadwal & kuota harian
          </span>
          <div className='grid grid-cols-2 gap-y-3 gap-x-4'>
            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Jam praktik hari ini
              </span>
              <Input
                value={jadwalHariIni}
                onChange={(e) => setJadwalHariIni(e.target.value)}
                disabled={isCuti}
                placeholder='09.00 - 16.00'
                className='h-8 text-xs'
              />
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Status jadwal
              </span>
              <Select
                value={statusJadwal}
                onValueChange={(val) => setStatusJadwal(val as typeof statusJadwal)}
                disabled={isCuti}
              >
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue placeholder='Pilih status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Aktif'>Aktif (buka penuh)</SelectItem>
                  <SelectItem value='Sebagian'>Sebagian (slot terbatas)</SelectItem>
                  <SelectItem value='Cuti / Tutup'>Cuti / tutup</SelectItem>
                  <SelectItem value='Tutup'>Tutup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Kapasitas pasien / hari
              </span>
              <Input
                type='number'
                value={kapasitasPerHari}
                onChange={(e) => setKapasitasPerHari(Number(e.target.value))}
                disabled={isCuti}
                className='h-8 text-xs font-mono'
              />
            </div>

            <div>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Slot kuota tersedia
              </span>
              <Input
                type='number'
                value={slotTersedia}
                onChange={(e) => setSlotTersedia(Number(e.target.value))}
                disabled={isCuti}
                className='h-8 text-xs font-mono'
              />
            </div>

            <div className='col-span-2'>
              <span className='text-xs font-normal text-muted-foreground/70 block mb-1'>
                Ruang praktik dokter
              </span>
              <Input
                value={ruangPraktik}
                onChange={(e) => setRuangPraktik(e.target.value)}
                placeholder='Contoh: Poli Penyakit Dalam, Room 201'
                className='h-8 text-xs'
              />
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
            Simpan perubahan
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
