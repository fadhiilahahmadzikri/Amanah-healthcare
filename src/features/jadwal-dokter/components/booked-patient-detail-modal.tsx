'use client';

import * as React from 'react';
import {
  AppointmentDetailOrganism,
  bookedPatientToAppointment,
  type SessionContext
} from '@/features/klinik/components/appointment-card';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import {
  useCallPatientAppointmentMutation,
  useCancelAppointmentMutation,
  useCompletePatientAppointmentMutation
} from '../api/mutations';

export interface BookedPatientDetailModalProps {
  patient: BookedPatientItem | null;
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  sessionId: string;
  sessionContext?: SessionContext;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  onAppointmentCancelled?: (appointmentId: string) => void;
  onAppointmentUpdated?: (appointmentId: string, newStatus: string) => void;
}

export function BookedPatientDetailModal({
  patient,
  isOpen,
  onClose,
  doctorId,
  sessionId,
  sessionContext,
  portalContainerRef,
  onAppointmentCancelled,
  onAppointmentUpdated
}: BookedPatientDetailModalProps) {
  const cancelMutation = useCancelAppointmentMutation(doctorId, sessionId);
  const callMutation = useCallPatientAppointmentMutation(doctorId, sessionId);
  const completeMutation = useCompletePatientAppointmentMutation(doctorId, sessionId);

  const appointment = React.useMemo(() => {
    if (!patient) return null;
    return bookedPatientToAppointment(patient, sessionContext);
  }, [patient, sessionContext]);

  if (!patient || !appointment) return null;

  return (
    <AppointmentDetailOrganism
      isOpen={isOpen}
      appointment={appointment}
      viewerRole='internal'
      onClose={onClose}
      onCallPatient={async (apt) => {
        await callMutation.mutateAsync(apt.id);
        onAppointmentUpdated?.(apt.id, 'in_service');
        onClose();
      }}
      onCompletePatient={async (apt) => {
        await completeMutation.mutateAsync(apt.id);
        onAppointmentUpdated?.(apt.id, 'completed');
        onClose();
      }}
      onCancel={async (apt, reason) => {
        await cancelMutation.mutateAsync({
          appointmentId: apt.id,
          payload: {
            reason: reason,
            notifyPatient: true
          }
        });
        onAppointmentCancelled?.(apt.id);
        onClose();
      }}
      isCallPending={callMutation.isPending}
      isCompletePending={completeMutation.isPending}
      portalContainerRef={portalContainerRef}
    />
  );
}
