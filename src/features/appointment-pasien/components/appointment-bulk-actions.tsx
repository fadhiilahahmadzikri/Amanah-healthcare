'use client';

import React, { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { IconDoor, IconArrowBackUp } from '@tabler/icons-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { ReservationModal } from '@/features/klinik/components/reservation/reservation-modal';
import { AppointmentCancellationModal } from './appointment-cancellation-modal';
import { ChangeRoomModal } from './change-room-modal';
import { useBulkAppointmentOperations } from '../hooks/useBulkAppointmentOperations';
import type { AdminAppointment } from '../api/types';

interface AppointmentBulkActionsProps {
  table: Table<AdminAppointment>;
  onRefresh?: () => void;
}

export function AppointmentBulkActions({ table, onRefresh }: AppointmentBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const appointmentIds = selectedRows.map((r) => r.original.id);

  // Filter rows with settled proposals (approved proposal)
  const eligibleRevertRows = selectedRows.filter((r) => Boolean(r.original.hasSettledProposal));
  const eligibleRevertCount = eligibleRevertRows.length;
  const eligibleRevertIds = eligibleRevertRows.map((r) => r.original.id);

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
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [revertReason, setRevertReason] = useState('');

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

  const handleConfirmRevert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibleRevertIds.length === 0) return;
    await bulkOps.revertProposals({
      appointmentIds: eligibleRevertIds,
      reason: revertReason.trim() || undefined
    });
    setIsRevertModalOpen(false);
    setRevertReason('');
  };

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
          disabled={bulkOps.isProposingReschedule}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg border-border/80 hover:bg-accent'
        >
          {bulkOps.isProposingReschedule ? (
            <Icons.spinner className='size-3.5 animate-spin text-primary' />
          ) : (
            <Icons.calendar className='size-3.5 text-primary' />
          )}
          <span>Ajukan Jadwal Ulang</span>
        </Button>

        {/* 4. Bulk Cancel */}
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={() => setIsCancelModalOpen(true)}
          disabled={bulkOps.isProposingCancel}
          className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg'
        >
          {bulkOps.isProposingCancel ? (
            <Icons.spinner className='size-3.5 animate-spin' />
          ) : (
            <Icons.alertCircle className='size-3.5' />
          )}
          <span>Ajukan Batal ({selectedCount})</span>
        </Button>

        {/* 5. Bulk Revert Proposal (Tarik Perubahan) - Kondisional jika ada yang bersatus persetujuan */}
        {eligibleRevertCount > 0 && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsRevertModalOpen(true)}
            disabled={bulkOps.isRevertingProposal}
            className='h-8 text-xs font-semibold px-2.5 gap-1.5 rounded-lg border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          >
            {bulkOps.isRevertingProposal ? (
              <Icons.spinner className='size-3.5 animate-spin text-amber-500' />
            ) : (
              <IconArrowBackUp className='size-3.5 text-amber-500' />
            )}
            <span>Tarik Perubahan ({eligibleRevertCount})</span>
          </Button>
        )}
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
              <Label
                htmlFor='bulk-close-old'
                className='text-xs font-normal text-muted-foreground cursor-pointer'
              >
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

      {/* MODAL 2: TUGASKAN RUANGAN (REUSE ChangeRoomModal) */}
      <ChangeRoomModal
        isOpen={isRoomModalOpen}
        appointmentId={appointmentIds[0] || ''}
        appointmentIds={appointmentIds}
        onClose={() => setIsRoomModalOpen(false)}
        onSuccess={() => {
          table.resetRowSelection();
          onRefresh?.();
        }}
      />

      {/* MODAL 3: JADWALKAN ULANG (RESCHEDULE - MENGGUNAKAN RESERVATION MODAL) */}
      <ReservationModal
        isOpen={isRescheduleModalOpen}
        context={{
          mode: 'reschedule',
          appointmentIds,
          appointmentCount: selectedCount,
          initiator: 'admin'
        }}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSuccess={() => {
          table.resetRowSelection();
          onRefresh?.();
        }}
      />

      {/* MODAL 4: AJUKAN PEMBATALAN (APPOINTMENT CANCELLATION MODAL) */}
      <AppointmentCancellationModal
        isOpen={isCancelModalOpen}
        appointmentIds={appointmentIds}
        appointmentCount={selectedCount}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={() => {
          table.resetRowSelection();
          onRefresh?.();
        }}
      />

      {/* MODAL 5: TARIK PERUBAHAN (REVERT PROPOSAL) */}
      <ModalWrapper
        isOpen={isRevertModalOpen}
        onClose={() => setIsRevertModalOpen(false)}
        maxWidth='max-w-md'
      >
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='size-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400'>
              <IconArrowBackUp className='size-5' />
            </div>
            <div>
              <h3 className='text-base font-bold text-foreground'>
                Tarik Perubahan ({eligibleRevertCount} Antrean)
              </h3>
              <p className='text-xs text-muted-foreground'>
                Membatalkan persetujuan perubahan (revert settlement) dan mengembalikan jadwal ke kondisi semula.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmRevert} className='space-y-4'>
            <div className='p-3 bg-muted/50 rounded-lg text-xs space-y-1.5 text-muted-foreground border border-border/40'>
              <div className='font-semibold text-foreground flex items-center gap-1.5'>
                <Icons.info className='size-3.5 text-amber-500' />
                Dampak Penarikan Perubahan:
              </div>
              <ul className='list-disc pl-4 space-y-1'>
                <li>Pembatalan yang disetujui akan diaktifkan kembali menjadi antrean terjadwal.</li>
                <li>Jadwal ulang yang disetujui akan dikembalikan ke tanggal dan sesi asalnya.</li>
                <li>Pasien akan otomatis mendapatkan notifikasi pembatalan perubahan ini.</li>
              </ul>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='bulk-revert-reason' className='text-xs font-semibold'>
                Alasan Penarikan (Opsional)
              </Label>
              <Input
                id='bulk-revert-reason'
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                placeholder='Misal: Dokter konfirmasi jadwal semula tetap tersedia'
                className='h-9 text-xs'
              />
            </div>

            <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/50'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsRevertModalOpen(false)}
                disabled={bulkOps.isRevertingProposal}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                className='bg-amber-600 hover:bg-amber-700 text-white'
                disabled={bulkOps.isRevertingProposal || eligibleRevertCount === 0}
              >
                {bulkOps.isRevertingProposal ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Tarik Perubahan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </>
  );
}
