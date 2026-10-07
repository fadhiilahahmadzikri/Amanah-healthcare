'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { ScheduleSlotModalData } from './useDoctorScheduleSlotModal';
import type {
  OccupancySlot,
  BookedPatientItem
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { GridSlotData } from '../components/grid/doctor-grid-slot-item';
import { doctorScheduleKeys } from '../api/queries';
import { getSessionPatients } from '../api/service';
import { useUpdateDoctorSessionMutation } from '../api/mutations';
import { SCHEDULE_STATUS, SCHEDULE_MUTATION_NOTES } from '../constants/schedule-shift.constants';

export interface UseDoctorHourlyGridModalsProps {
  doctor?: DoctorSchedule;
  formattedSelectedDate: string;
  isDayCuti: boolean;
  onAddSchedule?: () => void;
}

export function useDoctorHourlyGridModals({
  doctor,
  formattedSelectedDate,
  isDayCuti,
  onAddSchedule
}: UseDoctorHourlyGridModalsProps) {
  const queryClient = useQueryClient();
  const updateSessionMutation = useUpdateDoctorSessionMutation();

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] =
    useState<DoctorDailySession | null>(null);
  const [selectedSlotStartTime, setSelectedSlotStartTime] = useState<string | undefined>(undefined);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSessionInitialTime, setAddSessionInitialTime] = useState<string | undefined>(undefined);
  const [addSessionInitialEndTime, setAddSessionInitialEndTime] = useState<string | undefined>(
    undefined
  );

  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedSessionForPatients, setSelectedSessionForPatients] =
    useState<DoctorDailySession | null>(null);
  const [selectedSlotForPatients, setSelectedSlotForPatients] = useState<
    { startTime: string; endTime: string } | undefined
  >(undefined);
  const [selectedShiftForPatients, setSelectedShiftForPatients] = useState<string | undefined>(
    undefined
  );
  const [selectedShiftLabelForPatients, setSelectedShiftLabelForPatients] = useState<
    string | undefined
  >(undefined);
  const [selectedShiftTimeRangeForPatients, setSelectedShiftTimeRangeForPatients] = useState<
    string | undefined
  >(undefined);

  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  const [patientDetailSession, setPatientDetailSession] = useState<DoctorDailySession | null>(null);

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedSlotModalData, setSelectedSlotModalData] = useState<ScheduleSlotModalData | null>(
    null
  );
  const [isReasonOpen, setIsReasonOpen] = useState(false);

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

  const handleOpenPatients = (
    session: DoctorDailySession,
    slotStartTime?: string,
    slotEndTime?: string,
    sessionShift?: string,
    shiftLabel?: string,
    shiftTimeRange?: string
  ) => {
    setSelectedSessionForPatients(session);
    setSelectedSlotForPatients(
      slotStartTime ? { startTime: slotStartTime, endTime: slotEndTime || '' } : undefined
    );
    setSelectedShiftForPatients(sessionShift);
    setSelectedShiftLabelForPatients(shiftLabel);
    setSelectedShiftTimeRangeForPatients(shiftTimeRange);
    setIsPatientsModalOpen(true);
  };

  const handleClosePatientsModal = () => {
    setIsPatientsModalOpen(false);
    setSelectedSessionForPatients(null);
    setSelectedSlotForPatients(undefined);
    setSelectedShiftForPatients(undefined);
    setSelectedShiftLabelForPatients(undefined);
    setSelectedShiftTimeRangeForPatients(undefined);
  };

  const handleOpenReschedule = (session: DoctorDailySession, slotStartTime?: string) => {
    setSelectedSessionForReschedule(session);
    setSelectedSlotStartTime(slotStartTime);
    setIsRescheduleOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedSessionForReschedule(null);
    setSelectedSlotStartTime(undefined);
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

  const handleOpenPatientDetail = async (
    session: DoctorDailySession,
    slot: OccupancySlot | GridSlotData
  ) => {
    if (!doctor) return;

    setPatientDetailSession(session);

    const doctorId = doctor.id || doctor.practitioner_id || '';
    const cachedData = queryClient.getQueryData<{ patients?: BookedPatientItem[] }>(
      doctorScheduleKeys.sessionPatients(doctorId, session.id, {})
    );

    let foundPatient: BookedPatientItem | undefined;
    if (cachedData?.patients) {
      foundPatient = cachedData.patients.find(
        (p) =>
          (slot.appointmentRef?.appointmentId &&
            p.appointmentId === slot.appointmentRef.appointmentId) ||
          p.timeSlot?.startsWith(slot.startTime) ||
          p.timeSlot?.includes(slot.startTime)
      );
    }

    if (foundPatient) {
      setSelectedPatientForDetail(foundPatient);
      setIsPatientDetailOpen(true);
      return;
    }

    try {
      const fetched = await queryClient.fetchQuery({
        queryKey: doctorScheduleKeys.sessionPatients(doctorId, session.id, {}),
        queryFn: () => getSessionPatients(doctorId, session.id, {}),
        staleTime: 5 * 1000
      });
      if (fetched?.patients) {
        const matched = fetched.patients.find(
          (p) =>
            (slot.appointmentRef?.appointmentId &&
              p.appointmentId === slot.appointmentRef.appointmentId) ||
            p.timeSlot?.startsWith(slot.startTime) ||
            p.timeSlot?.includes(slot.startTime)
        );
        if (matched) {
          setSelectedPatientForDetail(matched);
          setIsPatientDetailOpen(true);
        }
      }
    } catch {}
  };

  const handleClosePatientDetail = () => {
    setIsPatientDetailOpen(false);
    setSelectedPatientForDetail(null);
    setPatientDetailSession(null);
  };

  const handleOpenSlotModal = (slot: OccupancySlot, session: DoctorDailySession) => {
    if (!doctor) return;
    setSelectedSlotModalData({
      doctor,
      session,
      slot,
      date: formattedSelectedDate,
      onOpenPatients: handleOpenPatients,
      onOpenPatientDetail: handleOpenPatientDetail,
      onOpenReschedule: handleOpenReschedule,
      onToggleSessionStatus: handleToggleSessionStatus
    });
    setIsSlotModalOpen(true);
  };

  const handleCloseSlotModal = () => {
    setIsSlotModalOpen(false);
    setSelectedSlotModalData(null);
  };

  return {
    isRescheduleOpen,
    setIsRescheduleOpen,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    selectedSlotStartTime,
    setSelectedSlotStartTime,
    isAddModalOpen,
    setIsAddModalOpen,
    addSessionInitialTime,
    setAddSessionInitialTime,
    addSessionInitialEndTime,
    setAddSessionInitialEndTime,
    isPatientsModalOpen,
    setIsPatientsModalOpen,
    selectedSessionForPatients,
    setSelectedSessionForPatients,
    selectedSlotForPatients,
    setSelectedSlotForPatients,
    selectedShiftForPatients,
    setSelectedShiftForPatients,
    selectedShiftLabelForPatients,
    setSelectedShiftLabelForPatients,
    selectedShiftTimeRangeForPatients,
    setSelectedShiftTimeRangeForPatients,
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    isPatientDetailOpen,
    setIsPatientDetailOpen,
    patientDetailSession,
    handleOpenPatientDetail,
    handleClosePatientDetail,
    isSlotModalOpen,
    setIsSlotModalOpen,
    selectedSlotModalData,
    handleOpenSlotModal,
    handleCloseSlotModal,
    isReasonOpen,
    setIsReasonOpen,
    isCloseModalOpen,
    setIsCloseModalOpen,
    closingSession,
    setClosingSession,
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
    updateSessionMutation
  };
}
