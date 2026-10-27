'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';
import type { Appointment, Doctor } from '../../../api/types';
import { PixelTexture } from '../../pixel-texture';
import { AppointmentMetaRow } from '../atoms/appointment-meta-row';
import { AppointmentTimeTrajectory } from '../atoms/appointment-time-trajectory';
import { AppointmentCardFooter } from '../molecules/appointment-card-footer';
import { AppointmentCardHeader } from '../molecules/appointment-card-header';
import { normalizeAppointmentTimes } from '../utils/appointment-adapter';
import {
  isAppointmentBeforeCall,
  isAppointmentWaiting
} from '@/features/appointment-pasien/constants/options';
import {
  formatFriendlyVisitType,
  type CanonicalVisitType
} from '@/constants/visit-type.constants';

export interface AppointmentCardOrganismProps {
  appointment: Appointment;
  doctor?: Doctor;
  subjectRole?: 'doctor' | 'patient';
  viewerRole?: 'patient' | 'internal';
  onViewDetails?: (appointment: Appointment) => void;
  actionsSlot?: React.ReactNode;
  detailButtonLabel?: string;
  className?: string;
}

export function AppointmentCardOrganism({
  appointment,
  doctor,
  subjectRole = 'doctor',
  viewerRole,
  onViewDetails,
  actionsSlot,
  detailButtonLabel,
  className
}: AppointmentCardOrganismProps) {
  const isPatientSubject = subjectRole === 'patient';
  const assignedDoctorName = appointment.doctor_name?.trim();
  const hasAssignedDoctor = Boolean(assignedDoctorName);

  const displayName = isPatientSubject
    ? appointment.patient_name || 'Pasien'
    : assignedDoctorName
      ? assignedDoctorName
      : appointment.service || '-';

  const displaySubtitle = isPatientSubject
    ? appointment.service || '-'
    : hasAssignedDoctor
      ? appointment.doctor_specialty || '-'
      : appointment.poliklinik_name;

  const displayAvatar = isPatientSubject
    ? appointment.patient_avatar || ''
    : hasAssignedDoctor
      ? doctor?.avatar || ''
      : undefined;

  const showAvatar = isPatientSubject || hasAssignedDoctor;

  const isBeforeCall = isAppointmentBeforeCall(appointment.status);
  const isEstimated = isBeforeCall || isAppointmentWaiting(appointment.status);
  const startLabel = isEstimated ? 'Est. Mulai' : 'Mulai';
  const endLabel = isEstimated ? 'Est. Selesai' : 'Selesai';

  const isInternalView =
    viewerRole === 'internal' || (viewerRole !== 'patient' && isPatientSubject);
  const displayLocation =
    !isInternalView && isBeforeCall ? 'Menunggu panggilan klinik' : appointment.room_name || '-';

  const { startTime, endTime, durationText } = normalizeAppointmentTimes(appointment);

  return (
    <div
      className={cn(
        'group relative w-full bg-gradient-to-t from-primary/6 via-primary/[0.015] to-card dark:from-primary/12 dark:via-card dark:to-card text-card-foreground border border-border rounded-[20px] shadow-none hover:border-primary/60 hover:shadow-md overflow-hidden font-sans flex flex-col justify-between h-full p-3.5 sm:p-4 gap-1.5 select-none transition-all duration-200',
        className
      )}
    >
      <div className='absolute bottom-0 left-0 right-0 h-[145px] pointer-events-none z-0 overflow-hidden'>
        <PixelTexture
          colorMode='theme'
          maskVariant='curved-convex'
          invertMask={true}
          opacity={0.24}
          density='medium'
          pixelSize={4.5}
          gap={1.5}
          height='100%'
        />
      </div>

      <div className='relative z-2 w-full'>
        <AppointmentCardHeader
          subjectRole={subjectRole}
          name={displayName}
          subtitle={displaySubtitle}
          avatarUrl={displayAvatar}
          status={appointment.status}
          showAvatar={showAvatar}
        />
      </div>

      <div className='relative z-2 w-full'>
        <AppointmentMetaRow date={appointment.date || '-'} location={displayLocation} />
      </div>

      <div className='relative z-2 w-full'>
        <AppointmentTimeTrajectory
          startTime={startTime}
          endTime={endTime}
          durationText={durationText}
          visitType={formatFriendlyVisitType(appointment.visit_type as CanonicalVisitType)}
          variant='card'
          startLabel={startLabel}
          endLabel={endLabel}
        />
      </div>

      <div className='relative z-2 w-full mt-auto'>
        <AppointmentCardFooter
          queueNumber={appointment.queue_number || '-'}
          onViewDetails={onViewDetails ? () => onViewDetails(appointment) : undefined}
          actionsSlot={actionsSlot}
          detailButtonLabel={detailButtonLabel}
        />
      </div>
    </div>
  );
}
