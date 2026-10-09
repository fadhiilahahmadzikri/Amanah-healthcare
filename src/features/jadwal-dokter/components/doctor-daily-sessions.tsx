'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Accordion } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import { useDoctorDailySessions } from '../model/useDoctorDailySessions';
import {
  DoctorSessionsHeader,
  DoctorCalendarAccordion,
  DoctorSessionAccordionItem
} from './sessions';
import { DoctorAddSessionModal, type ReturnDoctorContext } from './doctor-add-session-modal';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorSessionPatientsModal } from './doctor-session-patients-modal';
import { DoctorCloseSessionModal } from './doctor-close-session-modal';
import { BookedPatientDetailModal } from './booked-patient-detail-modal';
import { DoctorCutiNotice } from './doctor-card-atoms';

export interface DoctorDailySessionsProps {
  doctor?: DoctorSchedule;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  currentMonth?: number;
  onMonthChange?: (month: number) => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
  onAddSchedule?: () => void;
  modalContainerRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  returnDoctorName?: string;
  onReturnToSourceModal?: () => void;
  returnContext?: ReturnDoctorContext | null;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
  className?: string;
}

export function DoctorDailySessions({
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
  returnContext: _returnContext,
  onViewDoctorSchedule,
  className
}: DoctorDailySessionsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    activeDay,
    activeMonth,
    activeYear,
    formattedSelectedDate,
    isCurrentDayToday,
    isDayCuti,
    isDayClosed,
    dayLeaveReason,
    activeSessions,
    handleToday,
    handleSelectDate,
    handleOpenPatients,
    handleOpenReschedule,
    openAddSessionModal,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
    isRescheduleOpen,
    selectedSessionForReschedule,
    handleCloseRescheduleModal,
    isAddModalOpen,
    addSessionInitialTime,
    addSessionInitialEndTime,
    handleCloseAddModal,
    isPatientsModalOpen,
    selectedSessionForPatients,
    handleClosePatientsModal,
    selectedPatientForDetail,
    isPatientDetailOpen,
    handleOpenPatientDetail,
    handleClosePatientDetail,
    isCloseModalOpen,
    setIsCloseModalOpen,
    closingSession,
    setClosingSession,
    pendingSessionId,
    updateSessionMutation
  } = useDoctorDailySessions({
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

  const [selectedDetailSessionId, setSelectedDetailSessionId] = useState<string | null>(null);

  const formattedTargetDate = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        {/* Date Navigation & Calendar Toggle */}
        <DoctorSessionsHeader
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

        <DoctorCalendarAccordion
          isOpen={isCalendarOpen}
          formattedTargetDate={formattedTargetDate}
          activeYear={activeYear}
          onSelectDate={handleSelectDate}
          onClose={() => setIsCalendarOpen(false)}
        />

        <div className='p-4 space-y-4'>
          {isDayCuti ? (
            <DoctorCutiNotice title='Dokter sedang cuti' subtitle={dayLeaveReason} />
          ) : isDayClosed ? (
            <DoctorCutiNotice
              title='Praktik Ditutup'
              subtitle='Seluruh sesi praktik pada tanggal ini ditutup.'
            />
          ) : activeSessions.length === 0 ? (
            <EmptyState
              icon={Icons.calendar}
              title='Belum ada jadwal sesi'
              description='Dokter belum memiliki sesi praktik yang diatur untuk tanggal ini.'
              action={
                !readOnly ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => openAddSessionModal()}
                    className='text-xs'
                  >
                    <Icons.add className='size-3.5 mr-1.5' />
                    Tambah Sesi Praktik
                  </Button>
                ) : undefined
              }
              className='py-12'
            />
          ) : (
            <div className='space-y-3.5'>
              {doctor && (
                <Accordion
                  type='multiple'
                  defaultValue={activeSessions.map((s) => s.id)}
                  className='space-y-3'
                >
                  {activeSessions.map((session) => (
                    <DoctorSessionAccordionItem
                      key={session.id}
                      session={session}
                      doctor={doctor}
                      isPending={
                        updateSessionMutation.isPending && pendingSessionId === session.id
                      }
                      onToggleStatus={handleToggleSessionStatus}
                      onReschedule={handleOpenReschedule}
                      onSelectPatient={(patient, sess) => {
                        setSelectedDetailSessionId(sess.id);
                        handleOpenPatientDetail(patient);
                      }}
                    />
                  ))}
                </Accordion>
              )}

              {!readOnly && (
                <div className='pt-3.5 pb-1'>
                  <button
                    type='button'
                    onClick={() => openAddSessionModal()}
                    className='w-full py-2.5 px-3 rounded-xl border border-dashed border-border/70 hover:border-primary/60 bg-muted/5 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer select-none'
                  >
                    <Icons.add className='size-3.5' />
                    <span>Tambah sesi praktik baru</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Session Modal */}
      {doctor && isAddModalOpen && (
        <DoctorAddSessionModal
          key={`add-session-${formattedTargetDate}-${addSessionInitialTime || 'wizard'}`}
          doctor={doctor}
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSessionAdded={handleCloseAddModal}
          portalContainerRef={modalContainerRef}
          targetDate={formattedTargetDate}
          initialStartTime={addSessionInitialTime}
          initialEndTime={addSessionInitialEndTime}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}

      {/* Reschedule Session Modal */}
      {doctor && selectedSessionForReschedule && (
        <DoctorRescheduleSessionModal
          doctor={doctor}
          session={selectedSessionForReschedule}
          isOpen={isRescheduleOpen}
          onClose={handleCloseRescheduleModal}
          portalContainerRef={modalContainerRef}
          initialDate={formattedTargetDate}
          onViewDoctorSchedule={onViewDoctorSchedule}
        />
      )}

      {/* Session Patients Modal */}
      {doctor && selectedSessionForPatients && (
        <DoctorSessionPatientsModal
          doctor={doctor}
          session={selectedSessionForPatients}
          selectedDate={formattedTargetDate}
          isOpen={isPatientsModalOpen}
          onClose={handleClosePatientsModal}
          portalContainerRef={modalContainerRef}
          onOpenReschedule={handleOpenReschedule}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <BookedPatientDetailModal
          patient={selectedPatientForDetail}
          doctorId={doctor?.id || doctor?.practitioner_id || ''}
          sessionId={selectedDetailSessionId || ''}
          isOpen={isPatientDetailOpen}
          onClose={handleClosePatientDetail}
          sessionContext={{
            doctorName: doctor?.nama_dokter,
            doctorSpecialty: doctor?.spesialisasi,
            date: formattedSelectedDate
          }}
        />
      )}

      {/* Close Session Confirmation Modal */}
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
    </>
  );
}
