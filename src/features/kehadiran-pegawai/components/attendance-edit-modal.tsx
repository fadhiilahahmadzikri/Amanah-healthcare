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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { useUpdateAttendanceMutation } from '../api/mutations';
import type { StaffAttendance, AttendanceStatus, WorkShift, StaffCategory } from '../api/types';

export interface AttendanceEditModalProps {
  attendance: StaffAttendance | null;
  isOpen: boolean;
  onClose: () => void;
}

function getCurrentPresenceTime(): string {
  return `${new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })} WIB`;
}

export function AttendanceEditModal({ attendance, isOpen, onClose }: AttendanceEditModalProps) {
  const updateMutation = useUpdateAttendanceMutation();

  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [shift, setShift] = useState<WorkShift>('Pagi');
  const [kategori, setKategori] = useState<StaffCategory>('Staf');
  const [waktu, setWaktu] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>('');

  useEffect(() => {
    if (attendance) {
      setStatus(attendance.status);
      setShift(attendance.shift);
      setKategori(attendance.kategori);
      setWaktu(attendance.waktu || '');
      setTanggal(attendance.tanggal_presensi || '');
    }
  }, [attendance]);

  if (!attendance) return null;

  const initials = attendance.nama_staf
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateMutation.mutate(
      {
        id: attendance.id,
        payload: {
          status,
          shift,
          kategori,
          waktu: status === 'Hadir' ? waktu : '-',
          tanggal_presensi: tanggal
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
      maxWidth='max-w-[540px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* 1. Header Identitas Staf (Sesuai Paradigma Modal Detail Codebase) */}
        <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-3.5 min-w-0 flex-1'>
            <Avatar className='size-13 rounded-full border border-border/40 shrink-0'>
              {attendance.avatar && (
                <AvatarImage src={attendance.avatar} alt={attendance.nama_staf} />
              )}
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-sm'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                {attendance.nama_staf}
              </h3>
              <p className='text-xs font-medium text-muted-foreground truncate w-full font-mono'>
                ID Staf: {attendance.id_staf}
              </p>
              <div className='pt-0.5'>
                <span className='inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold bg-muted text-muted-foreground border border-border/50'>
                  {attendance.kategori}
                </span>
              </div>
            </div>
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

        {/* 2. Detail Pengaturan Presensi */}
        <div className='space-y-3.5'>
          <div>
            <span className='text-xs font-semibold text-foreground block mb-2'>
              Informasi & Status Kehadiran
            </span>
            <div className='grid grid-cols-2 gap-3.5'>
              {/* Status Kehadiran */}
              <div>
                <label
                  htmlFor='attendance-status'
                  className='text-xs font-normal text-muted-foreground/80 block mb-1'
                >
                  Status Presensi
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val as AttendanceStatus);
                    if (val === 'Tidak Hadir') {
                      setWaktu('-');
                    } else if (waktu === '-') {
                      setWaktu(getCurrentPresenceTime());
                    }
                  }}
                >
                  <SelectTrigger id='attendance-status' className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Hadir' className='text-xs'>
                      <div className='flex items-center gap-2'>
                        <span className='size-2 rounded-full bg-emerald-500' />
                        <span>Hadir</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='Tidak Hadir' className='text-xs'>
                      <div className='flex items-center gap-2'>
                        <span className='size-2 rounded-full bg-rose-500' />
                        <span>Tidak Hadir / Izin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shift Kerja */}
              <div>
                <label
                  htmlFor='attendance-shift'
                  className='text-xs font-normal text-muted-foreground/80 block mb-1'
                >
                  Shift Kerja
                </label>
                <Select value={shift} onValueChange={(val) => setShift(val as WorkShift)}>
                  <SelectTrigger id='attendance-shift' className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih Shift' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Pagi' className='text-xs'>
                      Shift Pagi (07:00 - 15:00)
                    </SelectItem>
                    <SelectItem value='Siang' className='text-xs'>
                      Shift Siang (14:00 - 22:00)
                    </SelectItem>
                    <SelectItem value='Malam' className='text-xs'>
                      Shift Malam (21:00 - 07:00)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Waktu Presensi */}
              <div>
                <label
                  htmlFor='attendance-time'
                  className='text-xs font-normal text-muted-foreground/80 block mb-1'
                >
                  Waktu Jam Masuk
                </label>
                <Input
                  id='attendance-time'
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  disabled={status === 'Tidak Hadir'}
                  placeholder='Contoh: 07:45 WIB'
                  className='h-9 text-xs font-mono bg-background'
                />
              </div>

              {/* Tanggal Presensi */}
              <div>
                <label
                  htmlFor='attendance-date'
                  className='text-xs font-normal text-muted-foreground/80 block mb-1'
                >
                  Tanggal Presensi
                </label>
                <Input
                  id='attendance-date'
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  placeholder='DD/MM/YYYY'
                  className='h-9 text-xs font-mono bg-background'
                />
              </div>

              {/* Kategori Staf */}
              <div className='col-span-2'>
                <label
                  htmlFor='attendance-category'
                  className='text-xs font-normal text-muted-foreground/80 block mb-1'
                >
                  Kategori Jabatan / Profesi
                </label>
                <Select value={kategori} onValueChange={(val) => setKategori(val as StaffCategory)}>
                  <SelectTrigger id='attendance-category' className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih Kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Dokter' className='text-xs'>
                      Dokter / Tenaga Medis
                    </SelectItem>
                    <SelectItem value='Staf' className='text-xs'>
                      Staf / Administrasi / Operasional
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-2.5 border-t border-border/40'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            disabled={updateMutation.isPending}
            className='px-4 font-medium text-xs'
          >
            Batal
          </Button>

          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='sm'
            disabled={updateMutation.isPending}
            className='px-5 font-semibold text-xs gap-1.5'
          >
            {updateMutation.isPending ? (
              <Icons.spinner className='size-3.5 animate-spin' />
            ) : (
              <Icons.check className='size-3.5' />
            )}
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
