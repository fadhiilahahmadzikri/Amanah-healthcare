'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { cn } from '@/lib/utils';
import { formatClinicDate, formatClinicTime } from '@/lib/date-format';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import type { AdminAppointment } from '../api/types';

interface TimelineEvent {
  id: string;
  title: string;
  timeStr: string | null;
  dateStr?: string | null;
  description: string;
  state: 'completed' | 'active' | 'pending' | 'cancelled' | 'late';
  badgeLabel?: string;
}

export interface AppointmentHistoryTimelineProps {
  appointment: AdminAppointment;
  className?: string;
}

export function AppointmentHistoryTimeline({
  appointment,
  className
}: AppointmentHistoryTimelineProps) {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return null;
    return formatClinicTime(isoString, { withSuffix: true, includeSeconds: true });
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return null;
    return formatClinicDate(isoString, { style: 'human_short' });
  };

  const events: TimelineEvent[] = [];

  const sessionLabel = formatFriendlySessionName(
    appointment.sessionName || appointment.session
  );
  const etaDetail = appointment.etaRange ? `(Est. ${appointment.etaRange})` : '';
  const timeInfo = [sessionLabel, etaDetail].filter(Boolean).join(' ') ||
    formatClinicTime(appointment.scheduledStartTime) ||
    '';

  events.push({
    id: 'booked',
    title: 'Reservasi Janji Temu Dibuat',
    timeStr: formatTime(appointment.createdAt),
    dateStr: formatDate(appointment.createdAt),
    description: `Pendaftaran berhasil untuk ${formatClinicDate(appointment.scheduledDate, { style: 'human_medium' })}${timeInfo ? ` • ${timeInfo}` : ''} di ${appointment.poliklinikName}.`,
    state: 'completed'
  });

  if (appointment.checkedInAt) {
    events.push({
      id: 'checked_in',
      title: 'Pasien Tiba & Check-In',
      timeStr: formatTime(appointment.checkedInAt),
      dateStr: formatDate(appointment.checkedInAt),
      description: 'Konfirmasi kehadiran diverifikasi di klinik.',
      state: 'completed'
    });
  } else if (
    appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
    appointment.status !== APPOINTMENT_STATUS.LATE
  ) {
    events.push({
      id: 'awaiting_check_in',
      title: 'Menunggu Kehadiran Pasien',
      timeStr: null,
      description: 'Pasien belum melakukan konfirmasi check-in di kiosk atau resepsionis.',
      state: appointment.status === APPOINTMENT_STATUS.BOOKED ? 'active' : 'pending'
    });
  }

  if (appointment.lastCalledAt) {
    events.push({
      id: 'called',
      title: 'Panggilan Masuk Antrean',
      timeStr: formatTime(appointment.lastCalledAt),
      dateStr: formatDate(appointment.lastCalledAt),
      description: `Nomor antrean ${appointment.queueNumber} dipanggil ke ruang praktik.`,
      state: 'completed'
    });
  } else if (
    appointment.checkedInAt &&
    appointment.status !== APPOINTMENT_STATUS.CANCELLED &&
    appointment.status !== APPOINTMENT_STATUS.LATE
  ) {
    events.push({
      id: 'awaiting_call',
      title: 'Menunggu Panggilan Ruang Praktik',
      timeStr: null,
      description: 'Pasien berada di ruang tunggu klinik.',
      state: appointment.status === APPOINTMENT_STATUS.WAITING ? 'active' : 'pending'
    });
  }

  if (appointment.actualStartedAt) {
    events.push({
      id: 'in_service',
      title: 'Konsultasi Dimulai',
      timeStr: formatTime(appointment.actualStartedAt),
      dateStr: formatDate(appointment.actualStartedAt),
      description: appointment.doctorName
        ? `Pemeriksaan klinis bersama ${appointment.doctorName}.`
        : 'Pemeriksaan klinis bersama dokter pemeriksa.',
      state: appointment.actualCompletedAt ? 'completed' : 'active'
    });
  }

  if (appointment.actualCompletedAt) {
    events.push({
      id: 'completed',
      title: 'Pemeriksaan Selesai',
      timeStr: formatTime(appointment.actualCompletedAt),
      dateStr: formatDate(appointment.actualCompletedAt),
      description: `Pemeriksaan selesai.${appointment.consultationDurationFormatted ? ` Durasi: ${appointment.consultationDurationFormatted}` : ''}`,
      state: 'completed'
    });
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    events.push({
      id: 'cancelled',
      title: 'Janji Temu Dibatalkan',
      timeStr: formatTime(appointment.updatedAt),
      dateStr: formatDate(appointment.updatedAt),
      description: 'Janji temu dibatalkan sebelum pelayanan tuntas.',
      state: 'cancelled'
    });
  } else if (appointment.status === APPOINTMENT_STATUS.LATE) {
    events.push({
      id: 'late',
      title: 'Kedatangan Terlambat / Kadaluarsa',
      timeStr: formatTime(appointment.updatedAt),
      dateStr: formatDate(appointment.updatedAt),
      description: 'Melewati batas toleransi check-in kebijakan operasional klinik.',
      state: 'late'
    });
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title='Belum Ada Riwayat Kronologis'
        description='Informasi garis waktu janji temu belum tercatat.'
        className='py-8'
      />
    );
  }

  return (
    <div className={cn('space-y-3 font-sans', className)}>
      <div className='flex items-center justify-between pb-1'>
        <span className='text-xs font-semibold text-foreground tracking-tight'>
          Garis Waktu Operasional Pasien
        </span>
        <span className='text-[11px] font-mono text-muted-foreground'>{events.length} Tahap</span>
      </div>

      <div className='relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60'>
        {events.map((evt) => {
          const isDone = evt.state === 'completed';
          const isActive = evt.state === 'active';
          const isCancelled = evt.state === 'cancelled';
          const isLate = evt.state === 'late';

          return (
            <div key={evt.id} className='relative text-xs'>
              <div
                className={cn(
                  'absolute -left-6 top-0.5 size-4 rounded-full ring-2 ring-background border flex items-center justify-center transition-colors',
                  isDone && 'bg-emerald-500 border-emerald-600 text-white',
                  isActive && 'bg-primary border-primary text-white animate-pulse',
                  isCancelled && 'bg-rose-500 border-rose-600 text-white',
                  isLate && 'bg-amber-500 border-amber-600 text-white',
                  evt.state === 'pending' && 'bg-muted border-border/80 text-muted-foreground'
                )}
              >
                {isDone ? (
                  <Icons.check className='size-2.5 stroke-[3]' />
                ) : isCancelled ? (
                  <Icons.close className='size-2.5 stroke-[3]' />
                ) : (
                  <span className='size-1.5 rounded-full bg-current' />
                )}
              </div>

              <div className='flex flex-col space-y-0.5'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <span
                    className={cn(
                      'font-semibold text-sm leading-tight',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {evt.title}
                  </span>
                  {evt.timeStr && (
                    <span className='font-mono text-[11px] text-muted-foreground tabular-nums'>
                      {evt.dateStr ? `${evt.dateStr} • ` : ''}
                      {evt.timeStr}
                    </span>
                  )}
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed'>{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
