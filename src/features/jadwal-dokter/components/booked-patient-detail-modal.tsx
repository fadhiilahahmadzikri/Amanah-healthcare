'use client';

import React, { useState } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import {
  useCancelAppointmentMutation,
  useCallPatientAppointmentMutation,
  useCompletePatientAppointmentMutation
} from '../api/mutations';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { BookedPatientKiaIntake } from './booked-patient-kia-intake';

export interface BookedPatientDetailModalProps {
  patient: BookedPatientItem | null;
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  sessionId: string;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  onAppointmentCancelled?: (appointmentId: string) => void;
  onAppointmentUpdated?: (appointmentId: string, newStatus: string) => void;
}

export function BookedPatientDetailModal({
  patient,
  isOpen,
  onClose,
  doctorId,
  sessionId,
  portalContainerRef,
  onAppointmentCancelled,
  onAppointmentUpdated
}: BookedPatientDetailModalProps) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLateReason, setIsLateReason] = useState(false);

  const cancelMutation = useCancelAppointmentMutation(doctorId, sessionId);
  const callMutation = useCallPatientAppointmentMutation(doctorId, sessionId);
  const completeMutation = useCompletePatientAppointmentMutation(doctorId, sessionId);

  if (!patient) return null;

  const demographics = patient.patient;
  const isCancelled =
    patient.status === 'cancelled' || patient.status === 'BATAL' || patient.status === 'no_doctor';
  const isWaiting =
    patient.status === 'waiting' ||
    patient.status === 'Menunggu' ||
    patient.statusBadge?.toLowerCase() === 'menunggu';
  const isInService = patient.status === 'in_service' || patient.status === 'SEDANG_DILAYANI';
  const isCompleted = patient.status === 'completed' || patient.status === 'SELESAI';

  const isCancellable = patient.isCancellable && !isCancelled && !isInService && !isCompleted;

  const initials = demographics.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = isLateReason
      ? `[Terlambat/No-Show] ${cancellationReason.trim() || 'Pasien terlambat melebihi batas waktu janji temu'}`
      : cancellationReason.trim();

    if (finalReason.length < 5) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        appointmentId: patient.appointmentId,
        payload: {
          cancellationReason: finalReason,
          notifyPatient: true
        }
      });
      setIsConfirmingCancel(false);
      setCancellationReason('');
      onAppointmentCancelled?.(patient.appointmentId);
      onClose();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => {
        setIsConfirmingCancel(false);
        setCancellationReason('');
        onClose();
      }}
      maxWidth='max-w-[580px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
    >
      <div className='relative font-sans space-y-4 max-h-[85vh] overflow-y-auto pr-1'>
        {/* 1. Header: Patient Identity & Status */}
        <div className='flex items-start justify-between gap-3 pb-3.5 border-b border-border/40'>
          <div className='flex items-center gap-3 min-w-0'>
            <Avatar className='size-11 rounded-full border border-border/60 bg-muted shrink-0'>
              {demographics.avatarUrl && (
                <AvatarImage
                  src={demographics.avatarUrl}
                  alt={demographics.fullName}
                  className='size-full object-cover'
                />
              )}
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60'>
                  {patient.queueNumber}
                </span>
                <StatusBadge status={patient.status} size='sm' variant='pill' />
              </div>
              <h3 className='text-base font-bold text-foreground tracking-tight truncate mt-1'>
                {demographics.fullName}
              </h3>
              <p className='text-xs font-mono text-muted-foreground'>
                No. RM: {demographics.medicalRecordNumber}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* 2. Demographic Information Section (Lengkap & Terstruktur) */}
        <div className='space-y-2.5'>
          <span className='text-xs font-bold text-foreground tracking-tight block'>
            Data Demografis Pasien
          </span>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-muted/15 border border-border/50 text-xs'>
            <div>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Nomor Induk Kependudukan (NIK)
              </span>
              <span className='font-mono font-semibold text-foreground'>
                {demographics.nik || '-'}
              </span>
            </div>

            <div>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Jenis Kelamin
              </span>
              <span className='font-semibold text-foreground'>{demographics.gender}</span>
            </div>

            <div>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Tanggal Lahir & Usia
              </span>
              <span className='font-semibold text-foreground'>
                {demographics.birthDate || '-'} ({demographics.age})
              </span>
            </div>

            <div>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Nomor Kontak / WhatsApp
              </span>
              <span className='font-mono font-semibold text-foreground'>
                {demographics.phoneNumber || '-'}
              </span>
            </div>

            <div className='sm:col-span-2'>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Nama Wali / Kontak Darurat
              </span>
              <span className='font-semibold text-foreground'>
                {demographics.guardianName || 'Pasien Mandiri (Tanpa Wali)'}
              </span>
            </div>

            <div className='sm:col-span-2'>
              <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                Alamat KTP / Domisili
              </span>
              <span className='text-foreground leading-relaxed'>
                {demographics.address || 'Alamat belum tercatat di profil rekam medis'}
              </span>
            </div>
          </div>
        </div>

        {/* 2.5 Specialized KIA Medical Intake */}
        <BookedPatientKiaIntake appointmentId={patient.appointmentId} />

        {/* 3. Clinical Intake & Queue Details */}
        <div className='space-y-2.5'>
          <span className='text-xs font-bold text-foreground tracking-tight block'>
            Detail Janji Temu & Keluhan
          </span>

          <div className='p-3.5 rounded-xl bg-muted/15 border border-border/50 text-xs space-y-2.5'>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                  Jam Antrean Praktik
                </span>
                <span className='font-mono font-bold text-foreground'>{patient.timeSlot}</span>
              </div>

              <div>
                <span className='text-[11px] font-medium text-muted-foreground block mb-0.5'>
                  Ruangan Praktik
                </span>
                <span className='font-semibold text-foreground truncate block'>
                  {patient.clinicRoomName}
                </span>
              </div>
            </div>

            <div className='pt-2 border-t border-border/30'>
              <span className='text-[11px] font-medium text-muted-foreground block mb-1'>
                Keluhan Utama (Chief Complaint)
              </span>
              <div className='p-2 rounded-lg bg-card border border-border/40 text-foreground font-normal leading-relaxed text-[11.5px]'>
                {patient.chiefComplaint || 'Tidak ada keluhan khusus yang dicatat.'}
              </div>
            </div>

            {/* Riwayat Pembatalan jika status Batal */}
            {isCancelled && patient.bookingMetadata?.cancelReason && (
              <div className='pt-2 border-t border-border/30'>
                <span className='text-[11px] font-medium text-destructive block mb-1'>
                  Alasan Pembatalan
                </span>
                <div className='p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11.5px]'>
                  {patient.bookingMetadata.cancelReason}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Cancellation Box (Interactive Consideration & Reason Prompt) */}
        {isConfirmingCancel ? (
          <form
            onSubmit={handleCancelSubmit}
            className='p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3'
          >
            <div className='flex items-center gap-2 text-destructive font-bold text-xs'>
              <Icons.warning className='size-4' />
              <span>Konfirmasi Pembatalan Janji Temu Pasien</span>
            </div>

            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Membatalkan janji temu ini akan <strong>mengembalikan 1 slot kuota</strong> ke sesi
              jadwal praktik dokter secara otomatis.
            </p>

            <div className='space-y-1.5'>
              <label
                htmlFor='cancellation-reason'
                className='text-[11px] font-semibold text-foreground block'
              >
                Alasan Pembatalan <span className='text-destructive'>*</span>
              </label>
              <textarea
                id='cancellation-reason'
                rows={2}
                required
                aria-label='Alasan pembatalan janji temu'
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder='Masukkan alasan pembatalan (misal: Pasien berhalangan hadir atau telah melewati toleransi waktu)...'
                className='w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-destructive'
              />
              <span className='text-[10px] text-muted-foreground block'>Minimal 5 karakter.</span>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='late-reason-toggle'
                aria-label='Tandai sebagai pasien terlambat'
                checked={isLateReason}
                onChange={(e) => setIsLateReason(e.target.checked)}
                className='rounded border-border text-primary focus:ring-primary size-3.5 cursor-pointer'
              />
              <label
                htmlFor='late-reason-toggle'
                className='text-[11px] font-medium text-foreground cursor-pointer select-none'
              >
                Tandai sebagai Pasien Terlambat (No-Show)
              </label>
            </div>

            <div className='flex items-center justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                onClick={() => setIsConfirmingCancel(false)}
                disabled={cancelMutation.isPending}
                className='text-xs'
              >
                Kembali
              </Button>
              <Button
                type='submit'
                variant='destructive'
                size='sm'
                shape='pill'
                disabled={
                  cancelMutation.isPending ||
                  (!isLateReason && cancellationReason.trim().length < 5)
                }
                className='text-xs font-bold'
              >
                {cancelMutation.isPending ? 'Membatalkan...' : 'Ya, Batalkan Janji Temu'}
              </Button>
            </div>
          </form>
        ) : (
          /* 5. Standard Action Footer */
          <div className='pt-2 flex items-center justify-between gap-3 border-t border-border/40'>
            <div>
              {!isCancellable && (
                <span className='text-[10.5px] text-muted-foreground italic block'>
                  {isInService
                    ? 'Pasien sedang diperiksa di ruang dokter.'
                    : isCompleted
                      ? 'Pemeriksaan telah selesai.'
                      : isCancelled
                        ? 'Janji temu sudah dibatalkan.'
                        : 'Janji temu tidak dapat dibatalkan.'}
                </span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                onClick={onClose}
                className='px-4 font-medium text-xs'
              >
                Tutup
              </Button>

              {isWaiting && (
                <Button
                  type='button'
                  variant='default'
                  size='sm'
                  shape='pill'
                  disabled={callMutation.isPending}
                  onClick={async () => {
                    try {
                      await callMutation.mutateAsync(patient.appointmentId);
                      onAppointmentUpdated?.(patient.appointmentId, 'in_service');
                      onClose();
                    } catch {
                      // Handled by mutation toast
                    }
                  }}
                  className='text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white'
                  leadingIcon={
                    callMutation.isPending ? (
                      <Icons.spinner className='size-3.5 animate-spin' />
                    ) : (
                      <Icons.notification className='size-3.5' />
                    )
                  }
                >
                  Panggil Pasien
                </Button>
              )}

              {isInService && (
                <Button
                  type='button'
                  variant='default'
                  size='sm'
                  shape='pill'
                  disabled={completeMutation.isPending}
                  onClick={async () => {
                    try {
                      await completeMutation.mutateAsync(patient.appointmentId);
                      onAppointmentUpdated?.(patient.appointmentId, 'completed');
                      onClose();
                    } catch {
                      // Handled by mutation toast
                    }
                  }}
                  className='text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white'
                  leadingIcon={
                    completeMutation.isPending ? (
                      <Icons.spinner className='size-3.5 animate-spin' />
                    ) : (
                      <Icons.check className='size-3.5' />
                    )
                  }
                >
                  Selesai Periksa
                </Button>
              )}

              {isCancellable && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  disabled={!isCancellable}
                  onClick={() => setIsConfirmingCancel(true)}
                  className='text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60'
                  leadingIcon={<Icons.close className='size-3.5' />}
                >
                  Batalkan Janji Temu
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
