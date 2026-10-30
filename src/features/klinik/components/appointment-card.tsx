'use client';

import * as React from 'react';
import {
  AppointmentCardOrganism,
  type AppointmentCardOrganismProps
} from './appointment-card/organisms/appointment-card-organism';
import type { Appointment, Doctor } from '../api/types';
import type { AudienceType } from '@/core/auth/permissions.constants';

export type { AppointmentCardOrganismProps };

export interface AppointmentCardProps {
  appointment: Appointment;
  doctor?: Doctor;
  viewerAudience?: AudienceType;
  onViewDetails: (appointment: Appointment) => void;
  className?: string;
}

export function AppointmentCard({
  appointment,
  doctor,
  viewerAudience,
  onViewDetails,
  className
}: AppointmentCardProps) {
  return (
    <AppointmentCardOrganism
      appointment={appointment}
      doctor={doctor}
      viewerAudience={viewerAudience}
      onViewDetails={onViewDetails}
      className={className}
    />
  );
}

export * from './appointment-card/index';
