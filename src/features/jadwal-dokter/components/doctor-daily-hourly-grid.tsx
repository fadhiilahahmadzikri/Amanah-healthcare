'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import type { HourlySlotStatus } from '../utils/shift-slot-builder';

import { useDoctorHourlyGrid } from '../model/useDoctorHourlyGrid';
import {
  DoctorGridHeader, DoctorGridMetrics, DoctorGridShiftSection,
  DoctorGridLegend, DoctorGridCalendarAccordion
} from './grid';
import { DOCTOR_DIALOG_TYPE, WIZARD_STEP } from '../constants/doctor-dialog.constants';

import { useQueryClient } from '@tanstack/react-query';
import { useDoctorConflictNavigation } from '../model/useDoctorConflictNavigation';
import { DoctorAddSessionModal, type ReturnDoctorContext } from './doctor-add-session-modal';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorSessionPatientsModal } from './doctor-session-patients-modal';
import { DoctorScheduleSlotModal } from './doctor-schedule-slot-modal';
import { BookedPatientDetailModal } from './booked-patient-detail-modal';
import { DoctorCloseSessionModal } from './doctor-close-session-modal';
import { ChangeDoctorModal } from '@/features/appointment-pasien/components/change-doctor-modal';
import { ChangeRoomModal } from '@/features/appointment-pasien/components/change-room-modal';
import { resolveSlotPatient, buildSlotAppointment } from '../utils/slot-patient-resolver';
import type { Appointment } from '@/features/klinik/api/types';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { GridSlotData } from './grid/doctor-grid-slot-item';
import type { DoctorDailySession } from '../api/types';

export type { HourlySlotStatus };

export interface DoctorDailyHourlyGridProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onSelectHourStatus?: (hour: number, status: HourlySlotStatus) => void;
  onAddSchedule?: () => void;
  modalContainerRef?: React.RefObject<HTMLElement | null>;
  readOnly?: boolean;
  highlightSlotTime?: string;
  onClearHighlightSlotTime?: () => void;
  onReturnToSourceModal?: () => void;
  returnDoctorName?: string;
  returnContext?: ReturnDoctorContext | null;
  onClearReturnContext?: () => void;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
  openPatientsModal?: boolean;
  onClearOpenPatients?: () => void;
  className?: string;
}

export function DoctorDailyHourlyGrid({
  doctor,
  selectedDay,
  onSelectDay,
  currentMonth,
  onMonthChange,
  currentYear,
  onYearChange,
  onAddSchedule,
  modalContainerRef,
  readOnly = false,
  highlightSlotTime, onClearHighlightSlotTime: _onClearHighlightSlotTime,
  openPatientsModal, onClearOpenPatients,
  onReturnToSourceModal, returnDoctorName,
  returnContext: _returnContext, onClearReturnContext: _onClearReturnContext,
  onViewDoctorSchedule, className
}: DoctorDailyHourlyGridProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const {
    activeDay,
    activeMonth,
    activeYear,
    formattedSelectedDate,
    isCurrentDayToday,
    currentTimeString,
    isSlotFinished,
    isDayCuti,
    isDayClosed,
    dayLeaveReason,
    activeSessions,
    displayedShifts,
    overallMetrics,
    initials,
    handleToday,
    handleSelectDate,
    handleSlotClick,
    handleOpenPatients,
    handleOpenReschedule,
    openAddSessionModal,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
    isRescheduleOpen,
    setIsRescheduleOpen,
    selectedSessionForReschedule, setSelectedSessionForReschedule,
    selectedSlotStartTime, setSelectedSlotStartTime,
    isAddModalOpen, setIsAddModalOpen,
    addSessionInitialTime, setAddSessionInitialTime,
    addSessionInitialEndTime, setAddSessionInitialEndTime,
    isPatientsModalOpen, setIsPatientsModalOpen,
    selectedSessionForPatients, setSelectedSessionForPatients,
    selectedSlotForPatients, setSelectedSlotForPatients,
    selectedPatientForDetail, isPatientDetailOpen,
    patientDetailSession, handleOpenPatientDetail, handleClosePatientDetail,
    isSlotModalOpen, selectedSlotModalData, handleCloseSlotModal,
    isReasonOpen, setIsReasonOpen,
    isCloseModalOpen, setIsCloseModalOpen,
    closingSession, setClosingSession,
    pendingSessionId, updateSessionMutation
  } = useDoctorHourlyGrid({
    doctor,
    selectedDay,
    onSelectDay,
    currentMonth,
    onMonthChange,
    currentYear,
    onYearChange,
    onAddSchedule,
    readOnly
  });

  useEffect(() => {
    if (openPatientsModal && activeSessions?.length && !isPatientsModalOpen) {
      const targetSession = highlightSlotTime
        ? activeSessions.find(
            (s) =>
              (s.jam_mulai <= highlightSlotTime && s.jam_selesai >= highlightSlotTime) ||
              s.jam_mulai.startsWith(highlightSlotTime)
          ) || activeSessions[0]
        : activeSessions[0];

      if (targetSession) {
        handleOpenPatients(targetSession, highlightSlotTime || undefined, undefined);
        onClearOpenPatients?.();
      }
    }
  }, [openPatientsModal, activeSessions, highlightSlotTime, isPatientsModalOpen, handleOpenPatients, onClearOpenPatients]);

  const queryClient = useQueryClient();
  const formattedTargetDate = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;

  const conflictNav = useDoctorConflictNavigation();

  const [activeHighlightTime, setActiveHighlightTime] = useState<string | undefined>(
    highlightSlotTime || conflictNav.highlightSlotTime || undefined
  );

  useEffect(() => {
    const effectiveHighlight = highlightSlotTime || conflictNav.highlightSlotTime;
    if (effectiveHighlight) {
      setActiveHighlightTime(effectiveHighlight);
      const timer = setTimeout(() => {
        setActiveHighlightTime(undefined);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setActiveHighlightTime(undefined);
    }
  }, [highlightSlotTime, conflictNav.highlightSlotTime, doctor?.id]);

  const [reassignAppointment, setReassignAppointment] = useState<Appointment | null>(null);
  const [reassignSession, setReassignSession] = useState<DoctorDailySession | null>(null);
  const [reassignSlot, setReassignSlot] = useState<OccupancySlot | GridSlotData | null>(null);
  const [isChangeDoctorModalOpen, setIsChangeDoctorModalOpen] = useState(false);
  const [isChangeRoomModalOpen, setIsChangeRoomModalOpen] = useState(false);

  const handleOpenChangeDoctor = async (
    session: DoctorDailySession,
    slot: OccupancySlot | GridSlotData
  ) => {
    if (!doctor) return;
    const doctorId = doctor.id || doctor.practitioner_id || '';
    const patient = await resolveSlotPatient(queryClient, doctorId, session, slot);
    if (patient) {
      const apt = buildSlotAppointment(
        patient,
        doctor,
        session,
        formattedSelectedDate || formattedTargetDate
      );
      setReassignAppointment(apt);
      setReassignSession(session);
      setReassignSlot(slot);
      setIsChangeDoctorModalOpen(true);
    }
  };

  const handleOpenChangeRoom = async (
    session: DoctorDailySession,
    slot: OccupancySlot | GridSlotData
  ) => {
    if (!doctor) return;
    const doctorId = doctor.id || doctor.practitioner_id || '';
    const patient = await resolveSlotPatient(queryClient, doctorId, session, slot);
    if (patient) {
      const apt = buildSlotAppointment(
        patient,
        doctor,
        session,
        formattedSelectedDate || formattedTargetDate
      );
      setReassignAppointment(apt);
      setReassignSession(session);
      setReassignSlot(slot);
      setIsChangeRoomModalOpen(true);
    }
  };

  const handleViewReassignPatient = () => {
    if (reassignSession && reassignSlot) {
      void handleOpenPatientDetail(reassignSession, reassignSlot);
    }
  };

  const handleCloseReassign = () => {
    setIsChangeDoctorModalOpen(false);
    setIsChangeRoomModalOpen(false);
    setReassignAppointment(null);
    setReassignSession(null);
    setReassignSlot(null);
  };

  const handleSuccessReassign = () => {
    handleCloseReassign();
    queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
  };

  const enrichedSlotModalData = selectedSlotModalData
    ? {
        ...selectedSlotModalData,
        onOpenChangeDoctor: handleOpenChangeDoctor,
        onOpenChangeRoom: handleOpenChangeRoom
      }
    : null;

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        <DoctorGridHeader
          formattedSelectedDate={formattedSelectedDate}
          isDayCuti={isDayCuti}
          isDayClosed={isDayClosed}
          activeSessions={activeSessions}
          isCurrentDayToday={isCurrentDayToday}
          readOnly={readOnly}
          onToday={handleToday}
          isCalendarOpen={isCalendarOpen}
          onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
          onOpenAddSession={() => openAddSessionModal()}
        />

        <DoctorGridCalendarAccordion
          isOpen={isCalendarOpen}
          formattedTargetDate={formattedTargetDate}
          activeYear={activeYear}
          onSelectDate={handleSelectDate}
          onClose={() => setIsCalendarOpen(false)}
        />

        <DoctorGridMetrics
          doctor={doctor}
          isDayCuti={isDayCuti}
          isDayClosed={isDayClosed}
          activeSessions={activeSessions}
          dayLeaveReason={dayLeaveReason}
          initials={initials}
          isReasonOpen={isReasonOpen}
          onOpenReasonChange={setIsReasonOpen}
          readOnly={readOnly}
          onOpenAddSession={() => openAddSessionModal()}
          overallMetrics={overallMetrics}
        />

        <div className='p-3.5 sm:p-4 space-y-4.5 overflow-x-auto'>
          {displayedShifts.map((shift) => (
            <DoctorGridShiftSection
              key={shift.contextId}
              shift={shift}
              activeSessions={activeSessions}
              isDayCuti={isDayCuti}
              isDayClosed={isDayClosed}
              readOnly={readOnly}
              isCurrentDayToday={isCurrentDayToday}
              currentTimeString={currentTimeString}
              isSlotFinished={isSlotFinished}
              pendingSessionId={pendingSessionId}
              isMutationPending={updateSessionMutation.isPending}
              onSlotClick={handleSlotClick}
              onOpenPatients={handleOpenPatients}
              onOpenPatientDetail={handleOpenPatientDetail}
              onOpenChangeDoctor={handleOpenChangeDoctor}
              onOpenChangeRoom={handleOpenChangeRoom}
              onOpenReschedule={handleOpenReschedule}
              onToggleSessionStatus={handleToggleSessionStatus}
              highlightSlotTime={activeHighlightTime}
              onReturnToSourceModal={onReturnToSourceModal}
              returnDoctorName={returnDoctorName}
            />
          ))}

          {!readOnly && !isDayCuti && !isDayClosed && (
            <div className='pt-1'>
              <button
                type='button'
                onClick={() => openAddSessionModal()}
                className='w-full py-2.5 px-3 rounded-xl border border-dashed border-border/70 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs group select-none'
              >
                <Icons.add className='size-3.5 group-hover:scale-110 transition-transform' />
                <span>Tambah jadwal praktik baru</span>
              </button>
            </div>
          )}
        </div>

        <DoctorGridLegend />
      </div>

      {doctor && isAddModalOpen && (
        <DoctorAddSessionModal
          key={`add-session-${formattedTargetDate}-${addSessionInitialTime || 'wizard'}`}
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddSessionInitialTime(undefined);
            setAddSessionInitialEndTime(undefined);
          }}
          onSessionAdded={(_newSession) => {
            setIsAddModalOpen(false);
            setAddSessionInitialTime(undefined);
            setAddSessionInitialEndTime(undefined);
          }}
          portalContainerRef={modalContainerRef}
          targetDate={formattedTargetDate}
          initialStartTime={addSessionInitialTime}
          initialEndTime={addSessionInitialEndTime}
          initialStep={addSessionInitialTime ? 'room' : undefined}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}

      {doctor && selectedSessionForReschedule && (
        <DoctorRescheduleSessionModal
          doctor={doctor}
          session={selectedSessionForReschedule}
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            setSelectedSessionForReschedule(null);
            setSelectedSlotStartTime(undefined);
          }}
          portalContainerRef={modalContainerRef}
          initialDate={formattedTargetDate}
          initialStartTime={selectedSlotStartTime}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}

      {doctor && selectedSessionForPatients && (
        <DoctorSessionPatientsModal
          doctor={doctor}
          session={selectedSessionForPatients}
          selectedDate={formattedSelectedDate || formattedTargetDate}
          slotStartTime={selectedSlotForPatients?.startTime}
          slotEndTime={selectedSlotForPatients?.endTime}
          isOpen={isPatientsModalOpen}
          onClose={() => {
            setIsPatientsModalOpen(false);
            setSelectedSessionForPatients(null);
            setSelectedSlotForPatients(undefined);
          }}
          portalContainerRef={modalContainerRef}
          onOpenReschedule={handleOpenReschedule}
        />
      )}

      <DoctorScheduleSlotModal
        isOpen={isSlotModalOpen}
        data={enrichedSlotModalData}
        onClose={handleCloseSlotModal}
        portalContainerRef={modalContainerRef}
      />

      {doctor && selectedPatientForDetail && patientDetailSession && (
        <BookedPatientDetailModal
          patient={selectedPatientForDetail}
          isOpen={isPatientDetailOpen}
          sessionContext={{
            doctorName: doctor.nama_dokter,
            doctorSpecialty: doctor.spesialisasi,
            sessionTime: `${patientDetailSession.jam_mulai} - ${patientDetailSession.jam_selesai} WIB`,
            date: formattedSelectedDate || formattedTargetDate
          }}
          onClose={handleClosePatientDetail}
          doctorId={doctor.id || doctor.practitioner_id || ''}
          sessionId={patientDetailSession.id}
          portalContainerRef={modalContainerRef}
          onReschedule={() => {
            handleClosePatientDetail();
            if (patientDetailSession) {
              handleOpenReschedule(patientDetailSession);
            }
          }}
          onAppointmentCancelled={() => {
            queryClient.invalidateQueries({
              queryKey: ['doctor-schedules']
            });
          }}
          onAppointmentUpdated={() => {
            queryClient.invalidateQueries({
              queryKey: ['doctor-schedules']
            });
          }}
        />
      )}

      <DoctorCloseSessionModal
        isOpen={isCloseModalOpen}
        closingSession={closingSession}
        isPending={updateSessionMutation.isPending}
        onClose={() => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        }}
        onConfirm={handleConfirmCloseSession}
        portalContainerRef={modalContainerRef}
      />

      <ChangeDoctorModal
        isOpen={isChangeDoctorModalOpen}
        appointmentId={reassignAppointment ? String(reassignAppointment.id) : ''}
        patientName={reassignAppointment?.patient_name || '-'}
        patientId={reassignAppointment?.patient_id || ''}
        queueNumber={reassignAppointment?.queue_number || '-'}
        currentDoctorName={doctor?.nama_dokter || reassignAppointment?.doctor_name || ''}
        appointmentDate={reassignAppointment?.date || '-'}
        appointmentTime={reassignAppointment?.time || ''}
        onViewAppointment={handleViewReassignPatient}
        onClose={handleCloseReassign}
        onSuccess={handleSuccessReassign}
      />

      <ChangeRoomModal
        isOpen={isChangeRoomModalOpen}
        appointmentId={reassignAppointment ? String(reassignAppointment.id) : ''}
        patientName={reassignAppointment?.patient_name || '-'}
        patientId={reassignAppointment?.patient_id || ''}
        queueNumber={reassignAppointment?.queue_number || '-'}
        currentRoomName={reassignAppointment?.room_name || ''}
        appointmentDate={reassignAppointment?.date || '-'}
        appointmentTime={reassignAppointment?.time || ''}
        onViewAppointment={handleViewReassignPatient}
        onViewDoctorSchedule={
          onViewDoctorSchedule
            ? (docId, targetSlotTime) => {
                const context: ReturnDoctorContext = {
                  sourceDoctorId: doctor?.id || doctor?.practitioner_id || '',
                  sourceDoctorName: doctor?.nama_dokter || '',
                  sourceDate: formattedSelectedDate || formattedTargetDate,
                  sourceSlotStartTime: targetSlotTime || reassignAppointment?.time,
                  sourceSession: reassignSession,
                  wizardType: DOCTOR_DIALOG_TYPE.DETAIL_SHEET,
                  initialStep: WIZARD_STEP.ROOM
                };
                conflictNav.inspectConflictDoctor({
                  occupantDoctorId: docId,
                  targetSlotTime: targetSlotTime || reassignAppointment?.time,
                  context,
                  onNavigate: (id, time) => {
                    handleCloseReassign();
                    onViewDoctorSchedule(id, time, context);
                  }
                });
              }
            : undefined
        }
        onClose={handleCloseReassign}
        onSuccess={handleSuccessReassign}
      />
    </>
  );
}
