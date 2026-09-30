'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Appointment, Doctor, MedicalIntakeRecord } from '../api/types';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { DoctorAvatar } from './doctor-avatar';
import { getDoctorByName } from '../api/service';
import { getMedicalFlowDefinition } from '../constants/medical-appointment-schemas';
import { getMedicalFieldLabel } from '../utils/medical-appointment';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';

export interface DetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
}

export function DetailsModal({
  isOpen,
  appointment,
  onClose,
  onReschedule,
  onCancel
}: DetailsModalProps) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingCancel(false);
      setCancelReason('');
      setIsCancelling(false);
    }
  }, [isOpen]);

  if (!appointment) return null;

  const doctor: Doctor = getDoctorByName(appointment.doctor_name) || {
    name: appointment.doctor_name || '',
    spec: appointment.doctor_specialty || '',
    avatar: '',
    location: '',
    rating: '',
    tags: [],
    schedule: ''
  };

  const displayLocation =
    appointment.poliklinik_name && appointment.room_name
      ? `${appointment.poliklinik_name}, ${appointment.room_name}`
      : appointment.poliklinik_name || appointment.room_name || '-';

  const doctorSpecialty = appointment.doctor_specialty || '-';

  const timeStr = appointment.time || '';
  const timeRangeMatch = timeStr.match(/(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})/);
  const sessionMatch = timeStr.match(/Sesi\s+[A-Za-z]+/i);

  const formatTimeSlot = (time?: string) => {
    if (!time) return null;
    const match = time.match(/(\d{1,2})[:.](\d{2})/);
    return match ? `${match[1].padStart(2, '0')}.${match[2]}` : null;
  };

  const startTime =
    formatTimeSlot(appointment.scheduled_start_time) ||
    (timeRangeMatch ? timeRangeMatch[1].replace(':', '.') : '-');
  const endTime =
    formatTimeSlot(appointment.scheduled_end_time) ||
    (timeRangeMatch ? timeRangeMatch[2].replace(':', '.') : '-');

  let durationText = sessionMatch ? sessionMatch[0] : '-';
  if (startTime !== '-' && endTime !== '-') {
    const startParts = startTime.split('.').map(Number);
    const endParts = endTime.split('.').map(Number);
    if (
      !isNaN(startParts[0]) &&
      !isNaN(startParts[1]) &&
      !isNaN(endParts[0]) &&
      !isNaN(endParts[1])
    ) {
      const diffMins = endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      if (diffMins > 0) {
        durationText = `${diffMins} minutes`;
      }
    }
  } else if (!sessionMatch && timeRangeMatch) {
    const startParts = timeRangeMatch[1].replace('.', ':').split(':').map(Number);
    const endParts = timeRangeMatch[2].replace('.', ':').split(':').map(Number);
    if (
      !isNaN(startParts[0]) &&
      !isNaN(startParts[1]) &&
      !isNaN(endParts[0]) &&
      !isNaN(endParts[1])
    ) {
      const diffMins = endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      if (diffMins > 0) {
        durationText = `${diffMins} minutes`;
      }
    }
  }

  const visitType = appointment.visit_type || '-';
  const statusConfig = getStatusConfig(appointment.status);

  const patientName = appointment.patient_name || '-';
  const serviceName = appointment.service || doctor.spec || '-';
  const complaintText = appointment.complaint || '-';

  const isCancelled =
    appointment.status === 'Batal' ||
    appointment.status === 'CANCELLED' ||
    appointment.status === 'Tidak Hadir' ||
    appointment.status === 'NO_SHOW';
  const isCompleted =
    appointment.status === 'Selesai' ||
    appointment.status === 'COMPLETED' ||
    appointment.status === 'Sedang Diperiksa' ||
    appointment.status === 'IN_SERVICE';
  const canCancel = !isCancelled && !isCompleted;
  const canReschedule = !isCancelled && !isCompleted;

  const handleConfirmCancel = async () => {
    if (!onCancel || !appointment) return;
    setIsCancelling(true);
    try {
      await onCancel(appointment, cancelReason.trim() || undefined);
      setIsConfirmingCancel(false);
      setCancelReason('');
    } catch {
      // handled in parent
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[560px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Doctor Identity Header */}
        <div className='flex items-center gap-4 pb-3 border-b border-border/40'>
          <div className='size-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
            <DoctorAvatar name={doctor.name} avatarUrl={doctor.avatar} size={64} />
          </div>
          <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
            <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
              {doctor.name || '-'}
            </h3>
            <p className='text-sm font-medium text-muted-foreground truncate w-full'>
              {doctorSpecialty}
            </p>
          </div>
        </div>

        {/* 2. Date & Location Row (Amanah Minimalist Underline Style) */}
        <div className='py-2.5 border-b border-border/40 flex items-center justify-between gap-3 text-sm'>
          <div className='flex items-center gap-2 text-foreground font-semibold min-w-0'>
            <Icons.calendar className='size-4 text-primary shrink-0' strokeWidth={1.8} />
            <span className='truncate'>{appointment.date || '-'}</span>
          </div>
          <div className='flex items-center gap-1.5 text-muted-foreground font-medium min-w-0'>
            <Icons.mapPin className='size-4 text-primary shrink-0' strokeWidth={1.8} />
            <span className='truncate'>{displayLocation}</span>
          </div>
        </div>

        {/* 3. Timeline Container (Amanah Minimalist Underline Style) */}
        <div className='py-2.5 border-b border-border/40 flex items-center justify-between'>
          <div className='flex flex-col items-start min-w-[60px]'>
            <span className='text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight'>
              {startTime}
            </span>
            <span className='text-xs font-normal text-muted-foreground mt-0.5'>Mulai</span>
          </div>

          <div className='flex-1 flex flex-col items-center px-3'>
            <span className='text-xs font-semibold text-muted-foreground mb-1'>{durationText}</span>
            <div className='w-full flex items-center justify-center relative'>
              <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
              <div className='flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 mx-2' />
              <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
            </div>
            <span className='text-xs font-medium text-muted-foreground mt-1 truncate max-w-full'>
              {visitType}
            </span>
          </div>

          <div className='flex flex-col items-end min-w-[60px]'>
            <span className='text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight'>
              {endTime}
            </span>
            <span className='text-xs font-normal text-muted-foreground mt-0.5'>Selesai</span>
          </div>
        </div>

        {/* 4. Patient & Service Details Grid (Symmetrical 3x2, Underline Style) */}
        <div className='grid grid-cols-2 gap-y-3 gap-x-5'>
          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Nama Pasien
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {patientName}
            </span>
          </div>

          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Nomor Antrean
            </span>
            <span className='text-sm font-bold font-mono text-primary block truncate'>
              {appointment.queue_number || '-'}
            </span>
          </div>

          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Layanan Poliklinik
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {serviceName}
            </span>
          </div>

          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Ruang & Lokasi
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {displayLocation}
            </span>
          </div>

          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-1'>
              Status Janji Temu
            </span>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
                statusConfig.pillBg,
                statusConfig.pillBorder
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                  statusConfig.dotGradient
                )}
              />
              <span
                className={cn(
                  'bg-clip-text text-transparent font-bold tracking-tight',
                  statusConfig.textGradient
                )}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className='border-b border-border/40 pb-2'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Tipe Kunjungan
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {visitType}
            </span>
          </div>
        </div>

        {/* 5. Medical Complaint (Amanah Minimalist Underline Style) */}
        <div className='border-b border-border/40 pb-3 pt-0.5'>
          <span className='text-xs font-normal text-muted-foreground block mb-1'>
            Keluhan Medis
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{complaintText}</p>
        </div>

        {appointment.medical_intake ? (
          <MedicalIntakeSummary intake={appointment.medical_intake} />
        ) : null}

        {/* 6. Inline Cancellation Confirmation Box */}
        {isConfirmingCancel && (
          <div className='p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3 animate-in fade-in-50 duration-200'>
            <div className='flex items-center gap-2 text-destructive font-bold text-xs'>
              <Icons.warning className='size-4 shrink-0' />
              <span>Konfirmasi Pembatalan Janji Temu</span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Apakah Anda yakin ingin membatalkan janji temu ini? 1 slot kuota jadwal praktik dokter akan dikembalikan secara otomatis.
            </p>
            <div className='space-y-1.5'>
              <label
                htmlFor='cancel-reason-input'
                className='text-xs font-semibold text-foreground block'
              >
                Alasan Pembatalan (Opsional)
              </label>
              <textarea
                id='cancel-reason-input'
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='Masukkan alasan pembatalan (misal: Berhalangan hadir karena ada keperluan mendesak)...'
                className='w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-destructive'
              />
            </div>
            <div className='flex items-center justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                onClick={() => setIsConfirmingCancel(false)}
                disabled={isCancelling}
                className='text-xs'
              >
                Kembali
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                shape='pill'
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className='text-xs font-bold'
              >
                {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
              </Button>
            </div>
          </div>
        )}

        {/* 7. Modal Action Buttons */}
        {!isConfirmingCancel && (
          <div className='pt-2 flex items-center justify-between gap-3'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='default'
              onClick={onClose}
              className='px-6 font-semibold'
            >
              Tutup
            </Button>

            <div className='flex items-center gap-2.5'>
              {canCancel && onCancel && (
                <Button
                  type='button'
                  variant='destructive'
                  shape='pill'
                  size='default'
                  onClick={() => setIsConfirmingCancel(true)}
                  className='px-5 font-medium'
                >
                  Batalkan
                </Button>
              )}

              {canReschedule && onReschedule && (
                <Button
                  type='button'
                  variant='outline'
                  shape='pill'
                  size='default'
                  onClick={() => {
                    onClose();
                    onReschedule(appointment);
                  }}
                  className='px-5 font-medium'
                >
                  Reschedule
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

const automaticLabels: Record<string, string> = {
  estimatedDueDate: 'HPL otomatis',
  gestationalAgeAtSubmit: 'Umur kehamilan saat submit',
  childAgeAtSubmit: 'Umur anak saat submit',
  imtAtSubmit: 'IMT (Indeks Massa Tubuh)'
};

function MedicalIntakeSummary({ intake }: { intake: MedicalIntakeRecord }) {
  const definition = getMedicalFlowDefinition(intake.flow);
  const automaticEntries = Object.entries(intake.automatic).filter(([, value]) => value);
  const answerEntries = Object.entries(intake.answersByFieldId).filter(([, value]) => value.trim());

  return (
    <div className='border-b border-border/40 pb-3'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <div>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Intake Medis
          </span>
          <p className='text-sm font-semibold text-foreground'>{definition.formTitle}</p>
        </div>
        <span className='shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground'>
          {intake.submittedAt}
        </span>
      </div>

      {automaticEntries.length > 0 ? (
        <div className='mb-2 grid gap-1.5 text-xs'>
          {automaticEntries.map(([key, value]) => (
            <IntakeRow key={key} label={automaticLabels[key] || key} value={value} />
          ))}
        </div>
      ) : null}

      <ScrollArea className='h-[160px] rounded-lg border border-border/60 p-3'>
        <div className='grid gap-1.5 pr-3 text-xs'>
          {answerEntries.map(([fieldId, value]) => (
            <IntakeRow
              key={fieldId}
              label={getMedicalFieldLabel(intake.flow, fieldId)}
              value={value}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function IntakeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-[130px_1fr] gap-3 border-b border-border/50 pb-1.5 last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium text-foreground'>{value}</span>
    </div>
  );
}
