'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Appointment, Doctor } from '../api/types';
import { DoctorAvatar } from './doctor-avatar';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';

export interface AppointmentCardProps {
  appointment: Appointment;
  doctor?: Doctor;
  onReschedule: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
  className?: string;
}

const RescheduleIcon = ({
  className = 'w-3.5 h-3.5',
  stroke = 'currentColor'
}: {
  className?: string;
  stroke?: string;
}) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke={stroke}
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
    <line x1='16' y1='2' x2='16' y2='6' />
    <line x1='8' y1='2' x2='8' y2='6' />
    <path d='M12 10a3 3 0 1 0 3 3' />
    <polyline points='15 10 15 13 12 13' />
  </svg>
);

export function AppointmentCard({
  appointment,
  doctor,
  onReschedule,
  onViewDetails,
  className
}: AppointmentCardProps) {
  const docInfo = doctor || {
    name: appointment.doctor_name || 'dr. Pratama Agung, Sp.OT',
    spec: appointment.service || 'Ortopedi & Traumatologi',
    avatar: 'https://i.pravatar.cc/150?img=60',
    location: 'Poli Bedah, Room 408',
    rating: '4.9',
    tags: ['Spesialis Ortopedi & Traumatologi', 'Bedah Tulang & Sendi', 'Rehabilitasi Medis'],
    schedule: 'Senin - Jumat (13:00 - 20:00)'
  };

  const displayLocation = docInfo.location || 'Poli Umum, Room 101';

  // Time & duration parsing
  const timeClean = (appointment.time || '16:15 - 16:45 WIB').replace(/WIB/i, '').trim();
  const timeSplits = timeClean.split('-');
  const startTime = timeSplits[0] ? timeSplits[0].trim().replace(':', '.') : '16.15';
  const endTime = timeSplits[1] ? timeSplits[1].trim().replace(':', '.') : '16.45';

  let durationText = '30 minutes';
  if (timeSplits[0] && timeSplits[1]) {
    const startParts = timeSplits[0].trim().replace('.', ':').split(':').map(Number);
    const endParts = timeSplits[1].trim().replace('.', ':').split(':').map(Number);
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

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground border border-border/50 rounded-[20px] shadow-none overflow-hidden font-sans flex flex-col justify-between h-full p-4 sm:p-5 gap-3.5 select-none transition-all',
        className
      )}
    >
      {/* 1. Doctor & Wrapped Status Section */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3.5 min-w-0 flex-1'>
          <div className='w-[64px] h-[64px] min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square'>
            <DoctorAvatar name={appointment.doctor_name} avatarUrl={docInfo.avatar} size={64} />
          </div>

          <div className='min-w-0 flex-1 space-y-0.5'>
            <h3
              className='text-[15px] font-bold tracking-tight text-foreground truncate'
              title={appointment.doctor_name}
            >
              {appointment.doctor_name}
            </h3>
            <p className='text-[12.5px] font-medium text-muted-foreground truncate'>
              {appointment.service || docInfo.spec}
            </p>

            <div className='pt-0.5'>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-[6px] text-[11px] font-bold leading-none'>
                <Icons.star className='size-2.5 fill-amber-500 text-amber-500' />
                <span>{docInfo.rating}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Gradient Status Badge */}
        <div className='shrink-0 self-start pt-0.5'>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-[11.5px] font-bold border backdrop-blur-sm select-none shadow-none',
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
          </span>
        </div>
      </div>

      {/* 2. Metadata Section (Date & Location: format 'Poli X, Room Y') */}
      <div className='flex items-center justify-between text-[12px] px-0.5 py-0.5 border-t border-border/40'>
        <div className='flex items-center gap-1.5 min-w-0 py-1.5 text-foreground font-semibold'>
          <Icons.calendar className='size-3.5 text-primary shrink-0' strokeWidth={1.8} />
          <span className='truncate'>{appointment.date}</span>
        </div>

        <div className='w-[1px] h-3.5 bg-border/40 shrink-0 mx-1.5' />

        <div className='flex items-center gap-1.5 min-w-0 py-1.5 text-muted-foreground font-medium'>
          <Icons.mapPin className='size-3.5 text-primary shrink-0' strokeWidth={1.8} />
          <span className='truncate'>{displayLocation}</span>
        </div>
      </div>

      {/* 3. Timeline Container (Trajectory Dash Line Clear & Visible) */}
      <div className='py-1 px-1 flex items-center justify-between'>
        <div className='flex flex-col items-start min-w-[55px]'>
          <span className='text-[17px] sm:text-[18px] font-bold text-foreground leading-tight tracking-tight'>
            {startTime}
          </span>
          <span className='text-[10.5px] font-normal text-muted-foreground mt-0.5'>Mulai</span>
        </div>

        <div className='flex-1 flex flex-col items-center px-2 sm:px-3'>
          <span className='text-[11px] font-semibold text-muted-foreground mb-1'>
            {durationText}
          </span>
          <div className='w-full flex items-center justify-center relative'>
            <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
            <div className='flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 mx-2' />
            <span className='size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0' />
          </div>
          <span className='text-[10.5px] font-normal text-muted-foreground mt-1 truncate max-w-[120px]'>
            {visitType}
          </span>
        </div>

        <div className='flex flex-col items-end min-w-[55px]'>
          <span className='text-[17px] sm:text-[18px] font-bold text-foreground leading-tight tracking-tight'>
            {endTime}
          </span>
          <span className='text-[10.5px] font-normal text-muted-foreground mt-0.5'>Selesai</span>
        </div>
      </div>

      {/* 4. Actions (Reschedule + Detail Pill) */}
      <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
        <Button
          type='button'
          variant='outline'
          shape='pill'
          size='sm'
          onClick={() => onReschedule(appointment)}
          className='font-medium'
        >
          <RescheduleIcon className='size-3.5' stroke='currentColor' />
          <span>Reschedule</span>
        </Button>

        <Button
          type='button'
          variant='default'
          shape='pill'
          size='sm'
          withTrailingCircleIcon
          onClick={() => onViewDetails(appointment)}
          className='font-semibold'
        >
          Detail
        </Button>
      </div>
    </div>
  );
}
