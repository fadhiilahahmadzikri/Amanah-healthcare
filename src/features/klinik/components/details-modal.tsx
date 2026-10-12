'use client';

import * as React from 'react';
import {
  AppointmentDetailOrganism,
  type AppointmentDetailOrganismProps
} from './appointment-card/organisms/appointment-detail-organism';
import type { Appointment } from '../api/types';

export interface DetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  viewerRole?: 'patient' | 'internal';
  onClose: () => void;
  onCancel?: (appointment: Appointment, reason?: string) => Promise<void> | void;
  onRescheduled?: (appointment: Appointment) => Promise<void> | void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function DetailsModal(props: DetailsModalProps) {
  return <AppointmentDetailOrganism {...props} />;
}

export { AppointmentDetailOrganism, type AppointmentDetailOrganismProps };
