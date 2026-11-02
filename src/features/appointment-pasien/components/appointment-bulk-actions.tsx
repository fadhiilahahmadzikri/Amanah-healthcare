'use client';

import React, { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { IconDoor } from '@tabler/icons-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { useBulkAppointmentOperations } from '../hooks/useBulkAppointmentOperations';
import type { AdminAppointment } from '../api/types';

interface AppointmentBulkActionsProps {
  table: Table<AdminAppointment>;
  onRefresh?: () => void;
}

export function AppointmentBulkActions({
  table,
  onRefresh
}: AppointmentBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const appointmentIds = selectedRows.map((r) => r.original.id);

  const bulkOps = useBulkAppointmentOperations({
    onClearSelection: () => table.resetRowSelection(),
    onSuccess: onRefresh
  });

  // Modal Dialog States
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorReason, setDoctorReason] = useState('');
  const [closeOldSchedule, setCloseOldSchedule] = useState(false);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [targetSession, setTargetSession] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (selectedCount === 0) {
    return null;
  }

  const handleConfirmDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    await bulkOps.assignDoctor({
      appointmentIds,
      doctorId: selectedDoctorId,
      reason: doctorReason.trim() || undefined,
      closeOldSchedule
    });
    setIsDoctorModalOpen(false);
    setSelectedDoctorId('');
    setDoctorReason('');
    setCloseOldSchedule(false);
  };

  const handleConfirmRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;
    await bulkOps.assignRoom({
      appointmentIds,
      roomId: selectedRoomId
    });
    setIsRoomModalOpen(false);
    setSelectedRoomId('');
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    await bulkOps.rescheduleAppointments({
      appointmentIds,
      targetDate,
      session: targetSession || undefined,
      reason: rescheduleReason.trim() || undefined
    });
    setIsRescheduleModalOpen(false);
    setTargetDate('');
    setTargetSession('');
    setRescheduleReason('');
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    await bulkOps.cancelAppointments({
      appointmentIds,
      reason: cancelReason.trim()
    });
    setIsCancelModalOpen(false);
    setCancelReason('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
        {/* 1. Bulk Assign Doctor */}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setIsDoctorModalOpen(true)}
          disabled={bulkOps.isAssigningDoctor}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg border-border/80 hover:bg-accent'
        >
          {bulkOps.isAssigningDoctor ? (
            <Icons.spinner className='size-3.5 animate-spin text-primary' />
          ) : (
            <Icons.userCheck className='size-3.5 text-primary' />
          )}
          <span>Tugaskan Dokter</span>
        </Button>

        {/* 2. Bulk Assign Room */}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setIsRoomModalOpen(true)}
          disabled={bulkOps.isAssigningRoom}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg border-border/80 hover:bg-accent'
        >
          {bulkOps.isAssigningRoom ? (
            <Icons.spinner className='size-3.5 animate-spin text-primary' />
          ) : (
            <IconDoor className='size-3.5 text-primary' />
          )}
          <span>Tugaskan Ruangan</span>
        </Button>

        {/* 3. Bulk Reschedule */}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setIsRescheduleModalOpen(true)}
          disabled={bulkOps.isRescheduling}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg border-border/80 hover:bg-accent'
        >
          {bulkOps.isRescheduling ? (
            <Icons.spinner className='size-3.5 animate-spin text-primary' />
          ) : (
            <Icons.calendar className='size-3.5 text-primary' />
          )}
          <span>Jadwalkan Ulang</span>
        </Button>

        {/* 4. Bulk Cancel */}
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={() => setIsCancelModalOpen(true)}
          disabled={bulkOps.isCancelling}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg'
        >
          {bulkOps.isCancelling ? (
            <Icons.spinner className='size-3.5 animate-spin' />
          ) : (
            <Icons.trash className='size-3.5' />
          )}
          <span>Batalkan ({selectedCount})</span>
        </Button>
      </div>

      {/* MODAL 1: TUGASKAN DOKTER */}
      <ModalWrapper
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        maxWidth='max-w-md'
      >
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <Icons.userCheck className='size-5' />
            </div>
            <div>
              <h3 className='text-base font-bold text-foreground'>
                Tugaskan Dokter ({selectedCount} Antrean)
              </h3>
              <p className='text-xs text-muted-foreground'>
                Pilih dokter penanggung jawab untuk seluruh antrean yang dipilih.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmDoctor} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-doctor-select' className='text-xs font-semibold'>
                Dokter Tujuan <span className='text-destructive'>*</span>
              </Label>
              <select
                id='bulk-doctor-select'
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className='w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
              >
                <option value=''>-- Pilih Dokter --</option>
                {bulkOps.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.specialty ? `(${d.specialty})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='bulk-doctor-reason' className='text-xs font-semibold'>
                Alasan Penugasan (Opsional)
              </Label>
              <Input
                id='bulk-doctor-reason'
                value={doctorReason}
                onChange={(e) => setDoctorReason(e.target.value)}
                placeholder='Misal: Penugasan sesi pagi'
                className='h-9 text-xs'
              />
            </div>

            <div className='flex items-center space-x-2 pt-1'>
              <Checkbox
                id='bulk-close-old'
                checked={closeOldSchedule}
                onCheckedChange={(checked) => setCloseOldSchedule(Boolean(checked))}
              />
              <Label htmlFor='bulk-close-old' className='text-xs font-normal text-muted-foreground cursor-pointer'>
                Tutup jadwal dokter lama jika dipindahkan
              </Label>
            </div>

            <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/50'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsDoctorModalOpen(false)}
                disabled={bulkOps.isAssigningDoctor}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!selectedDoctorId || bulkOps.isAssigningDoctor}
              >
                {bulkOps.isAssigningDoctor ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Menugaskan...
                  </>
                ) : (
                  'Tugaskan Dokter'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalWrapper>

      {/* MODAL 2: TUGASKAN RUANGAN */}
      <ModalWrapper
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        maxWidth='max-w-md'
      >
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <IconDoor className='size-5' />
            </div>
            <div>
              <h3 className='text-base font-bold text-foreground'>
                Tugaskan Ruangan ({selectedCount} Antrean)
              </h3>
              <p className='text-xs text-muted-foreground'>
                Pilih ruangan periksa untuk seluruh antrean yang dipilih.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmRoom} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-room-select' className='text-xs font-semibold'>
                Ruangan Periksa <span className='text-destructive'>*</span>
              </Label>
              <select
                id='bulk-room-select'
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
                className='w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
              >
                <option value=''>-- Pilih Ruangan --</option>
                {bulkOps.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.location ? `(${r.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/50'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsRoomModalOpen(false)}
                disabled={bulkOps.isAssigningRoom}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!selectedRoomId || bulkOps.isAssigningRoom}
              >
                {bulkOps.isAssigningRoom ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Menugaskan...
                  </>
                ) : (
                  'Tugaskan Ruangan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalWrapper>

      {/* MODAL 3: JADWALKAN ULANG (RESCHEDULE) */}
      <ModalWrapper
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        maxWidth='max-w-md'
      >
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <Icons.calendar className='size-5' />
            </div>
            <div>
              <h3 className='text-base font-bold text-foreground'>
                Jadwalkan Ulang ({selectedCount} Antrean)
              </h3>
              <p className='text-xs text-muted-foreground'>
                Pindahkan seluruh antrean terpilih ke tanggal atau sesi baru.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmReschedule} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-reschedule-date' className='text-xs font-semibold'>
                Tanggal Tujuan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='bulk-reschedule-date'
                type='date'
                min={todayStr}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='bulk-reschedule-session' className='text-xs font-semibold'>
                Sesi Kunjungan (Opsional)
              </Label>
              <select
                id='bulk-reschedule-session'
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className='w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
              >
                <option value=''>-- Sesuai Sesi Asal / Bebas --</option>
                {bulkOps.sessions.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.name} {s.startsAt ? `(${s.startsAt.slice(0, 5)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='bulk-reschedule-reason' className='text-xs font-semibold'>
                Alasan Penjadwalan Ulang (Opsional)
              </Label>
              <Input
                id='bulk-reschedule-reason'
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder='Misal: Dokter dinas luar kota'
                className='h-9 text-xs'
              />
            </div>

            <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/50'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsRescheduleModalOpen(false)}
                disabled={bulkOps.isRescheduling}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!targetDate || bulkOps.isRescheduling}
              >
                {bulkOps.isRescheduling ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Menjadwalkan...
                  </>
                ) : (
                  'Jadwalkan Ulang'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalWrapper>

      {/* MODAL 4: BATALKAN ANTREAN */}
      <ModalWrapper
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        maxWidth='max-w-md'
      >
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='size-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive'>
              <Icons.trash className='size-5' />
            </div>
            <div>
              <h3 className='text-base font-bold text-foreground'>
                Batalkan {selectedCount} Janji Temu?
              </h3>
              <p className='text-xs text-muted-foreground'>
                Tindakan ini akan membatalkan antrean dan melepaskan slot tiket pasien.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmCancel} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='bulk-cancel-reason' className='text-xs font-semibold'>
                Alasan Pembatalan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='bulk-cancel-reason'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='Misal: Pembatalan operasional klinik'
                required
                className='h-9 text-xs'
              />
            </div>

            <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/50'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsCancelModalOpen(false)}
                disabled={bulkOps.isCancelling}
              >
                Kembali
              </Button>
              <Button
                type='submit'
                variant='destructive'
                size='sm'
                disabled={!cancelReason.trim() || bulkOps.isCancelling}
              >
                {bulkOps.isCancelling ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Membatalkan...
                  </>
                ) : (
                  'Ya, Batalkan Semua'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </>
  );
}
