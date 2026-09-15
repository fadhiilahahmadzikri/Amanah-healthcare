'use client';

import React from 'react';
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
}

export function DetailsModal({ isOpen, appointment, onClose, onReschedule }: DetailsModalProps) {
  if (!appointment) return null;

  const doctor: Doctor = getDoctorByName(appointment.doctor_name) || {
    name: appointment.doctor_name || 'dr. Pratama Agung, Sp.OT',
    spec: appointment.service || 'Ortopedi & Traumatologi',
    avatar: 'https://i.pravatar.cc/150?img=60',
    location: 'Poli Bedah, Room 408',
    rating: '4.9',
    tags: ['Spesialis Ortopedi & Traumatologi', 'Bedah Tulang & Sendi', 'Rehabilitasi Medis'],
    schedule: 'Senin - Jumat (13:00 - 20:00)'
  };

  const displayLocation = doctor.location || 'Poli Umum, Room 101';

  const timeStr = appointment.time || '16:15 - 16:45 WIB';
  const timeRangeMatch = timeStr.match(/(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})/);
  const sessionMatch = timeStr.match(/Sesi\s+[A-Za-z]+/i);

  const startTime = timeRangeMatch ? timeRangeMatch[1].replace(':', '.') : '08.00';
  const endTime = timeRangeMatch ? timeRangeMatch[2].replace(':', '.') : '12.00';

  let durationText = sessionMatch ? sessionMatch[0] : '30 minutes';
  if (!sessionMatch && timeRangeMatch) {
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

  const visitType = appointment.visit_type || 'Pemeriksaan Baru';
  const statusConfig = getStatusConfig(appointment.status);

  const qualifications =
    doctor.tags && doctor.tags.length > 0
      ? doctor.tags
      : ['Spesialis Ortopedi & Traumatologi', 'Bedah Tulang & Sendi', 'Rehabilitasi Medis'];

  const patientName = appointment.patient_name || 'Rian Hidayat';
  const patientEmail = appointment.patient_email || 'rian.hidayat@outlook.com';
  const serviceName = appointment.service || doctor.spec || 'Ortopedi & Traumatologi';
  const complaintText =
    appointment.complaint || 'Pemeriksaan pemulihan pasca tindakan pembedahan pergelangan kaki.';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[560px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Doctor Identity Header & Status in Top-Right Position */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='flex items-center gap-4 min-w-0 flex-1'>
            <div className='size-16 min-w-[64px] min-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
              <DoctorAvatar name={doctor.name} avatarUrl={doctor.avatar} size={64} />
            </div>
            <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground truncate w-full tracking-tight'>
                {doctor.name}
              </h3>
              <p className='text-sm font-medium text-muted-foreground truncate w-full'>
                {serviceName}
              </p>
              <div className='pt-0.5'>
                <span className='inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-md text-xs font-bold leading-none'>
                  <Icons.star className='size-3 fill-amber-500 text-amber-500' />
                  <span>{doctor.rating}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge in place of the old close button */}
          <div className='shrink-0 pt-0.5'>
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
        </div>

        {/* 2. Doctor Qualifications (Amanah Minimalist Underline Style) */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground block mb-1.5'>
            Kualifikasi Dokter
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {qualifications.map((qual, idx) => (
              <span
                key={idx}
                className='px-2.5 py-0.5 bg-muted text-foreground text-xs font-medium rounded-md'
              >
                {qual}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Date & Location Row (Amanah Minimalist Underline Style) */}
        <div className='py-2.5 border-b border-border/40 flex items-center justify-between gap-3 text-sm'>
          <div className='flex items-center gap-2 text-foreground font-semibold min-w-0'>
            <Icons.calendar className='size-4 text-primary shrink-0' strokeWidth={1.8} />
            <span className='truncate'>{appointment.date}</span>
          </div>
          <div className='flex items-center gap-1.5 text-muted-foreground font-medium min-w-0'>
            <Icons.mapPin className='size-4 text-primary shrink-0' strokeWidth={1.8} />
            <span className='truncate'>{displayLocation}</span>
          </div>
        </div>

        {/* 4. Timeline Container (Amanah Minimalist Underline Style) */}
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

        {/* 5. Patient Details Grid (Amanah Minimalist Underline Style) */}
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
              Kontak / Email
            </span>
            <span
              className='text-sm font-semibold text-foreground block truncate'
              title={patientEmail}
            >
              {patientEmail}
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
        </div>

        {/* 6. Medical Complaint (Amanah Minimalist Underline Style) */}
        <div className='border-b border-border/40 pb-3 pt-0.5'>
          <span className='text-xs font-normal text-muted-foreground block mb-1'>
            Keluhan Medis
          </span>
          <p className='text-sm font-medium text-foreground leading-relaxed'>{complaintText}</p>
        </div>

        {appointment.medical_intake ? (
          <MedicalIntakeSummary intake={appointment.medical_intake} />
        ) : null}

        {/* 7. Modal Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-3'>
          {onReschedule && (
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

          <Button
            type='button'
            variant='default'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-7 font-semibold'
          >
            Tutup
          </Button>
        </div>
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
