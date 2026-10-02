'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Appointment, Doctor } from '../api/types';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { DoctorAvatar } from './doctor-avatar';
import { CancelStepContent } from './cancel-step-content';
import { AppointmentFormInspector } from './appointment-form-inspector';
import { getDoctorByName } from '../api/service';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';

export interface DetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
}

type ModalStep = 'details' | 'cancel-confirm';

function formatTimeSlot(time?: string) {
  if (!time) return null;
  const match = time.match(/(\d{1,2})[:.](\d{2})/);
  return match ? `${match[1].padStart(2, '0')}.${match[2]}` : null;
}

export function DetailsModal({
  isOpen,
  appointment,
  onClose,
  onReschedule,
  onCancel
}: DetailsModalProps) {
  const [modalStep, setModalStep] = useState<ModalStep>('details');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setModalStep('details');
      setCancelReason('');
      setIsCancelling(false);
      setIsFormExpanded(false);
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
      setCancelReason('');
      setModalStep('details');
    } catch {
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={isFormExpanded ? 'max-w-5xl' : 'max-w-lg'}
      showCloseButton={false}
      dismissible={!isCancelling}
      className='transition-[max-width] duration-300 ease-out'
    >
      <div
        className={cn(
          'w-full flex items-stretch min-h-[460px]',
          isFormExpanded ? 'flex-col md:flex-row' : 'flex-col'
        )}
      >
        <div
          className={cn(
            'w-full flex flex-col font-sans select-none justify-between h-full min-h-0 min-w-0 transition-all duration-300 ease-out',
            isFormExpanded ? 'md:w-[460px] md:shrink-0 md:pr-10' : 'w-full'
          )}
        >
          {modalStep === 'details' && (
            <DetailsStepContent
              appointment={appointment}
              doctor={doctor}
              doctorSpecialty={doctorSpecialty}
              statusConfig={statusConfig}
              displayLocation={displayLocation}
              startTime={startTime}
              endTime={endTime}
              durationText={durationText}
              visitType={visitType}
              patientName={patientName}
              serviceName={serviceName}
              complaintText={complaintText}
              canCancel={canCancel}
              canReschedule={canReschedule}
              isFormExpanded={isFormExpanded}
              onToggleForm={() => setIsFormExpanded((prev) => !prev)}
              onClose={onClose}
              onReschedule={onReschedule}
              onCancel={onCancel}
              onStartCancel={() => setModalStep('cancel-confirm')}
            />
          )}

          {modalStep === 'cancel-confirm' && (
            <CancelStepContent
              appointment={appointment}
              patientName={patientName}
              doctorName={doctor.name}
              queueNumber={appointment.queue_number || '-'}
              appointmentDate={appointment.date || '-'}
              cancelReason={cancelReason}
              setCancelReason={setCancelReason}
              isCancelling={isCancelling}
              onBack={() => setModalStep('details')}
              onConfirm={handleConfirmCancel}
            />
          )}
        </div>

        {isFormExpanded && modalStep === 'details' && (
          <div className='w-full flex-1 flex flex-col font-sans select-none h-full min-h-0 min-w-0 md:pl-10 md:border-l border-border/40 pt-6 md:pt-0 animate-in fade-in-0 slide-in-from-right-6 duration-300 ease-out'>
            <AppointmentFormInspector
              appointment={appointment}
              onClose={() => setIsFormExpanded(false)}
            />
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

interface DetailsStepProps {
  appointment: Appointment;
  doctor: Doctor;
  doctorSpecialty: string;
  statusConfig: ReturnType<typeof getStatusConfig>;
  displayLocation: string;
  startTime: string;
  endTime: string;
  durationText: string;
  visitType: string;
  patientName: string;
  serviceName: string;
  complaintText: string;
  canCancel: boolean;
  canReschedule: boolean;
  isFormExpanded: boolean;
  onToggleForm: () => void;
  onClose: () => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
  onStartCancel: () => void;
}

function DetailsStepContent({
  appointment,
  doctor,
  doctorSpecialty,
  statusConfig,
  displayLocation,
  startTime,
  endTime,
  durationText,
  visitType,
  patientName,
  serviceName,
  complaintText,
  canCancel,
  canReschedule,
  isFormExpanded,
  onToggleForm,
  onClose,
  onReschedule,
  onCancel,
  onStartCancel
}: DetailsStepProps) {
  return (
    <>
      <div className='flex items-center justify-between gap-3 pb-3 border-b border-border/40 min-h-[77px]'>
        <div className='flex items-center gap-3.5 min-w-0 flex-1'>
          <div className='size-14 min-w-[56px] min-h-[56px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
            <DoctorAvatar name={doctor.name} avatarUrl={doctor.avatar} size={56} />
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

        <div className='shrink-0'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer select-none'
                aria-label='Opsi tindakan janji temu'
              >
                <Icons.ellipsis className='size-5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48 p-1.5 rounded-xl shadow-lg border border-border/60 bg-card font-sans text-xs'
            >
              {!isFormExpanded && (
                <DropdownMenuItem
                  onClick={onToggleForm}
                  className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                >
                  <Icons.forms className='size-4 text-primary shrink-0' />
                  <span>Lihat Formulir</span>
                </DropdownMenuItem>
              )}

              {canReschedule && onReschedule && (
                <DropdownMenuItem
                  onClick={() => {
                    onClose();
                    onReschedule(appointment);
                  }}
                  className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                >
                  <Icons.calendar className='size-4 text-muted-foreground shrink-0' />
                  <span>Reschedule Jadwal</span>
                </DropdownMenuItem>
              )}

              {canCancel && onCancel && (
                <>
                  <DropdownMenuSeparator className='my-1 border-border/40' />
                  <DropdownMenuItem
                    onClick={onStartCancel}
                    className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors'
                  >
                    <Icons.close className='size-4 text-destructive shrink-0' />
                    <span>Batalkan Janji Temu</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='py-2.5 border-b border-border/40 flex items-center justify-between gap-3 text-sm min-w-0'>
        <div className='flex items-center gap-2 text-foreground font-semibold min-w-0 shrink-0'>
          <Icons.calendar className='size-4 text-primary shrink-0' strokeWidth={1.8} />
          <span className='truncate'>{appointment.date || '-'}</span>
        </div>
        <div className='flex items-center gap-1.5 text-muted-foreground font-medium min-w-0 max-w-[55%] justify-end shrink'>
          <Icons.mapPin className='size-4 text-primary shrink-0' strokeWidth={1.8} />
          <span className='truncate text-right'>{displayLocation}</span>
        </div>
      </div>

      <div className='py-3 border-b border-border/40 flex items-center justify-between min-w-0'>
        <div className='flex flex-col items-start min-w-[54px] shrink-0'>
          <span className='text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight'>
            {startTime}
          </span>
          <span className='text-xs font-normal text-muted-foreground mt-0.5'>Mulai</span>
        </div>

        <div className='flex-1 flex flex-col items-center px-2 min-w-0'>
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

        <div className='flex flex-col items-end min-w-[54px] shrink-0'>
          <span className='text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight'>
            {endTime}
          </span>
          <span className='text-xs font-normal text-muted-foreground mt-0.5'>Selesai</span>
        </div>
      </div>

      <div className='pt-4 pb-1 grid grid-cols-2 gap-y-3.5 gap-x-6 min-w-0'>
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
            Status Janji Temu
          </span>
          <div className='pt-0.5'>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
                statusConfig.pillBg,
                statusConfig.pillBorder
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
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
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Tipe Kunjungan
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>{visitType}</span>
        </div>
      </div>

      <div className='border-b border-border/40 pb-3 pt-0.5 min-w-0'>
        <span className='text-xs font-normal text-muted-foreground block mb-1'>Keluhan Medis</span>
        <p className='text-sm font-medium text-foreground leading-relaxed break-words'>
          {complaintText}
        </p>
      </div>

      <div className='pt-3 flex items-center justify-end min-w-0'>
        <Button
          type='button'
          variant='outline'
          shape='pill'
          size='default'
          onClick={onClose}
          className='px-6 font-semibold cursor-pointer min-w-[100px]'
        >
          Tutup
        </Button>
      </div>
    </>
  );
}
