'use client';

import { useState } from 'react';
import type { AdminAppointment } from '../api/types';

export type AppointmentDialogType =
  | 'recordDetail'
  | 'timeline'
  | 'patientDetail'
  | 'status'
  | 'changeDoctor'
  | 'changeRoom'
  | 'qr'
  | 'reschedule'
  | null;

export interface UseAppointmentDialogsResult {
  selectedAppointment: AdminAppointment | null;
  activeDialog: AppointmentDialogType;
  isRecordDetailOpen: boolean;
  isTimelineOpen: boolean;
  isDetailOpen: boolean;
  isStatusOpen: boolean;
  isChangeDoctorOpen: boolean;
  isChangeRoomOpen: boolean;
  isQrOpen: boolean;
  isRescheduleOpen: boolean;
  actions: {
    openRecordDetail: (appointment: AdminAppointment) => void;
    closeRecordDetail: () => void;
    openTimeline: (appointment: AdminAppointment) => void;
    closeTimeline: () => void;
    openPatientDetail: (appointment: AdminAppointment) => void;
    closePatientDetail: () => void;
    openStatus: (appointment: AdminAppointment) => void;
    closeStatus: () => void;
    openChangeDoctor: (appointment: AdminAppointment) => void;
    closeChangeDoctor: () => void;
    openChangeRoom: (appointment: AdminAppointment) => void;
    closeChangeRoom: () => void;
    openQr: (appointment: AdminAppointment) => void;
    closeQr: () => void;
    openReschedule: (appointment: AdminAppointment) => void;
    closeReschedule: () => void;
    // Cross-dialog transitions
    openPatientDetailFromRecord: () => void;
    openTimelineFromRecord: () => void;
    openPatientDetailFromQr: () => void;
    openStatusFromRecord: () => void;
    openChangeDoctorFromRecord: () => void;
    openChangeRoomFromRecord: () => void;
    openQrFromRecord: () => void;
    openRescheduleFromRecord: () => void;
  };
}

export function useAppointmentDialogs(): UseAppointmentDialogsResult {
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const [activeDialog, setActiveDialog] = useState<AppointmentDialogType>(null);
  const [returnToRecord, setReturnToRecord] = useState(false);

  const openRecordDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('recordDetail');
  };

  const closeRecordDetail = () => {
    setReturnToRecord(false);
    setActiveDialog(null);
  };

  const openTimeline = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('timeline');
  };

  const closeTimeline = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openPatientDetail = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('patientDetail');
  };

  const closePatientDetail = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openStatus = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('status');
  };

  const closeStatus = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openChangeDoctor = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('changeDoctor');
  };

  const closeChangeDoctor = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openChangeRoom = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('changeRoom');
  };

  const closeChangeRoom = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openQr = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('qr');
  };

  const closeQr = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  const openReschedule = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setReturnToRecord(false);
    setActiveDialog('reschedule');
  };

  const closeReschedule = () => {
    if (returnToRecord) {
      setReturnToRecord(false);
      setActiveDialog('recordDetail');
    } else {
      setActiveDialog(null);
    }
  };

  // Cross-dialog transitions from record detail modal
  const openPatientDetailFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('patientDetail');
  };

  const openTimelineFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('timeline');
  };

  const openPatientDetailFromQr = () => {
    setActiveDialog('patientDetail');
  };

  const openStatusFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('status');
  };

  const openChangeDoctorFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('changeDoctor');
  };

  const openChangeRoomFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('changeRoom');
  };

  const openQrFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('qr');
  };

  const openRescheduleFromRecord = () => {
    setReturnToRecord(true);
    setActiveDialog('reschedule');
  };

  return {
    selectedAppointment,
    activeDialog,
    isRecordDetailOpen: activeDialog === 'recordDetail',
    isTimelineOpen: activeDialog === 'timeline',
    isDetailOpen: activeDialog === 'patientDetail',
    isStatusOpen: activeDialog === 'status',
    isChangeDoctorOpen: activeDialog === 'changeDoctor',
    isChangeRoomOpen: activeDialog === 'changeRoom',
    isQrOpen: activeDialog === 'qr',
    isRescheduleOpen: activeDialog === 'reschedule',
    actions: {
      openRecordDetail,
      closeRecordDetail,
      openTimeline,
      closeTimeline,
      openPatientDetail,
      closePatientDetail,
      openStatus,
      closeStatus,
      openChangeDoctor,
      closeChangeDoctor,
      openChangeRoom,
      closeChangeRoom,
      openQr,
      closeQr,
      openReschedule,
      closeReschedule,
      openPatientDetailFromRecord,
      openTimelineFromRecord,
      openPatientDetailFromQr,
      openStatusFromRecord,
      openChangeDoctorFromRecord,
      openChangeRoomFromRecord,
      openQrFromRecord,
      openRescheduleFromRecord
    }
  };
}
