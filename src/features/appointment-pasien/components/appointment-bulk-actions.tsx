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
    </>
  );
}
