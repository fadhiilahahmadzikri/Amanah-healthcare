'use client';

import * as React from 'react';
import {
  AppointmentCardOrganism,
  type AppointmentCardOrganismProps
} from './appointment-card/organisms/appointment-card-organism';
import type { Appointment, Doctor } from '../api/types';

export type { AppointmentCardOrganismProps };

export interface AppointmentCardProps {
  appointment: Appointment;
  doctor?: Doctor;
  onReschedule: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
  className?: string;
}

export function AppointmentCard({
  appointment,
  doctor,
  onReschedule,
  onViewDetails,
  className
}: AppointmentCardProps) {
  return (
    <AppointmentCardOrganism
      appointment={appointment}
      doctor={doctor}
      subjectRole='doctor'
      onReschedule={onReschedule}
      onViewDetails={onViewDetails}
      className={className}
    />
  );
}

export * from './appointment-card/index';
