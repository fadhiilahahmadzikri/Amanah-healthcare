'use client';

import { useState } from 'react';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import { SCHEDULE_STATUS, SCHEDULE_MUTATION_NOTES } from '../constants/schedule-shift.constants';

export interface UseDoctorSessionModalsProps {
  doctor?: DoctorSchedule;
  formattedSelectedDate: string;
  isDayCuti: boolean;
  onAddSchedule?: () => void;
}

export function useDoctorSessionModals({
  doctor,
  isDayCuti,
  onAddSchedule
}: UseDoctorSessionModalsProps) {
  const updateSessionMutation = useUpdateDoctorSessionMutation();

  // Reschedule Modal
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);

  // Add Session Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSessionInitialTime, setAddSessionInitialTime] = useState<string | undefined>(undefined);
  const [addSessionInitialEndTime, setAddSessionInitialEndTime] = useState<string | undefined>(
    undefined
  );

  // Patients Modal
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedSessionForPatients, setSelectedSessionForPatients] =
    useState<DoctorDailySession | null>(null);

  // Patient Detail Modal
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);

  // Close Session Modal
  const [closingSession, setClosingSession] = useState<DoctorDailySession | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const handleRequestCloseSession = (session: DoctorDailySession) => {
    setClosingSession(session);
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseSession = () => {
    if (!doctor?.id || !closingSession?.id) return;
    setPendingSessionId(closingSession.id);
    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: closingSession.id,
        payload: {
          status: SCHEDULE_STATUS.CLOSED,
          status_sesi: SCHEDULE_STATUS.CLOSED,
          notes: SCHEDULE_MUTATION_NOTES.CLOSE_SESSION
        }
      },
      {
        onSuccess: () => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        },
        onSettled: () => {
          setPendingSessionId(null);
        }
      }
    );
  };

  const handleToggleSessionStatus = (session: DoctorDailySession) => {
    if (!doctor?.id || !session?.id) return;
    const isSessionClosed = session.status_sesi === SCHEDULE_STATUS.CLOSED;

    if (!isSessionClosed) {
      handleRequestCloseSession(session);
      return;
    }

    setPendingSessionId(session.id);
    updateSessionMutation.mutate(
      {
        doctorId: doctor.id,
        sessionId: session.id,
        payload: {
          status: SCHEDULE_STATUS.OPEN,
          status_sesi: SCHEDULE_STATUS.OPEN,
          notes: SCHEDULE_MUTATION_NOTES.OPEN_SESSION
        }
      },
      {
        onSettled: () => {
          setPendingSessionId(null);
        }
      }
    );
  };

  const handleOpenPatients = (session: DoctorDailySession) => {
    setSelectedSessionForPatients(session);
    setIsPatientsModalOpen(true);
  };

  const handleClosePatientsModal = () => {
    setIsPatientsModalOpen(false);
    setSelectedSessionForPatients(null);
  };

  const handleOpenReschedule = (session: DoctorDailySession) => {
    setSelectedSessionForReschedule(session);
    setIsRescheduleOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedSessionForReschedule(null);
  };

  const openAddSessionModal = (initialTime?: string, initialEndTime?: string) => {
    if (isDayCuti) return;
    onAddSchedule?.();
    setAddSessionInitialTime(initialTime);
    setAddSessionInitialEndTime(initialEndTime);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddSessionInitialTime(undefined);
    setAddSessionInitialEndTime(undefined);
  };

  const handleOpenPatientDetail = (patient: BookedPatientItem) => {
    setSelectedPatientForDetail(patient);
    setIsPatientDetailOpen(true);
  };

  const handleClosePatientDetail = () => {
    setIsPatientDetailOpen(false);
    setSelectedPatientForDetail(null);
  };

  return {
    isRescheduleOpen,
    setIsRescheduleOpen,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    isAddModalOpen,
    setIsAddModalOpen,
    addSessionInitialTime,
    addSessionInitialEndTime,
    isPatientsModalOpen,
    setIsPatientsModalOpen,
    selectedSessionForPatients,
    selectedPatientForDetail,
    isPatientDetailOpen,
    closingSession,
    setClosingSession,
    isCloseModalOpen,
    setIsCloseModalOpen,
    pendingSessionId,
    handleRequestCloseSession,
    handleConfirmCloseSession,
    handleToggleSessionStatus,
    handleOpenPatients,
    handleClosePatientsModal,
    handleOpenReschedule,
    handleCloseRescheduleModal,
    openAddSessionModal,
    handleCloseAddModal,
    handleOpenPatientDetail,
    handleClosePatientDetail,
    updateSessionMutation
  };
}
