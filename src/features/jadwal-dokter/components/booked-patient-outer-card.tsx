'use client';

import * as React from 'react';
import {
  AppointmentCardOrganism,
  bookedPatientToAppointment,
  type SessionContext
} from '@/features/klinik/components/appointment-card';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface BookedPatientOuterCardProps {
  patient: BookedPatientItem;
  onSelect: (patient: BookedPatientItem) => void;
  sessionContext?: SessionContext;
  className?: string;
}

export function BookedPatientOuterCard({
  patient,
  onSelect,
  sessionContext,
  className
}: BookedPatientOuterCardProps) {
  const appointment = React.useMemo(
    () => bookedPatientToAppointment(patient, sessionContext),
    [patient, sessionContext]
  );

  return (
    <AppointmentCardOrganism
      appointment={appointment}
      viewerAudience={AUDIENCE.INTERNAL}
      onViewDetails={() => onSelect(patient)}
      className={className}
    />
  );
}
