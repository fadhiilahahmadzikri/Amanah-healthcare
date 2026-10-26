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
  onAddSchedule?: (targetDow?: number) => void;
  modalContainerRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  onViewDoctorSchedule?: (doctorId: string, targetSessionTime?: string) => void;
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
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleSelectDate,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
    isPatientsModalOpen,
    selectedSessionForPatients,
    handleOpenPatients,
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

  const handleOpenAddSchedule = () => {
    const targetDow = new Date(activeYear, activeMonth, activeDay).getDay();
    onAddSchedule?.(targetDow);
  };

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
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          isCalendarOpen={isCalendarOpen}
          onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
          onAddSchedule={onAddSchedule && !readOnly ? handleOpenAddSchedule : undefined}
        />

        <DoctorCalendarAccordion
          isOpen={isCalendarOpen}
          formattedTargetDate={formattedTargetDate}
          activeYear={activeYear}
          onSelectDate={handleSelectDate}
          onClose={() => setIsCalendarOpen(false)}
        />

        {isDayCuti ? (
          <div className='p-4 space-y-4'>
            <DoctorCutiNotice
              title='Dokter Sedang Cuti'
              subtitle={dayLeaveReason}
              leaveType={doctor?.leaveType}
              substituteDoctorName={doctor?.substituteDoctorName}
            />
          </div>
        ) : isDayClosed ? (
          <div className='p-4 space-y-4'>
            <DoctorCutiNotice
              title='Praktik Ditutup'
              subtitle='Seluruh sesi praktik pada tanggal ini ditutup.'
            />
          </div>
        ) : activeSessions.length === 0 ? (
          <div className='p-4 space-y-4'>
            <EmptyState
              icon={Icons.calendar}
              title='Belum ada jadwal sesi'
              description='Dokter belum memiliki sesi praktik yang diatur untuk tanggal ini.'
              action={
                onAddSchedule && !readOnly ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleOpenAddSchedule}
                    className='mt-2 text-xs font-semibold cursor-pointer'
                  >
                    <Icons.settings className='size-3.5 mr-1.5' />
                    Atur Sesi Hari Ini
                  </Button>
                ) : undefined
              }
              className='py-12'
            />
          </div>
        ) : (
          doctor && (
            <Accordion
              type='multiple'
              defaultValue={activeSessions.map((s) => s.id)}
              className='w-full'
            >
              {activeSessions.map((session) => (
                <DoctorSessionAccordionItem
                  key={session.id}
                  session={session}
                  doctor={doctor}
                  selectedDate={formattedTargetDate}
                  isPending={updateSessionMutation.isPending && pendingSessionId === session.id}
                  onToggleStatus={handleToggleSessionStatus}
                  onOpenPatientsModal={handleOpenPatients}
                  onSelectPatient={(patient, sess) => {
                    setSelectedDetailSessionId(sess.id);
                    handleOpenPatientDetail(patient);
                  }}
                />
              ))}
            </Accordion>
          )
        )}
      </div>

      {/* Session Patients Modal */}
      {doctor && selectedSessionForPatients && (
        <DoctorSessionPatientsModal
          doctor={doctor}
          session={selectedSessionForPatients}
          selectedDate={formattedTargetDate}
          isOpen={isPatientsModalOpen}
          onClose={handleClosePatientsModal}
          portalContainerRef={modalContainerRef}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <BookedPatientDetailModal
          patient={selectedPatientForDetail}
          doctorId={doctor?.id || ''}
          sessionId={selectedDetailSessionId || ''}
          isOpen={isPatientDetailOpen}
          onClose={handleClosePatientDetail}
          sessionContext={{
            doctorName: doctor?.fullName,
            doctorSpecialty: doctor?.specialty,
            date: formattedSelectedDate,
            sessionTime:
              activeSessions.find((s) => s.id === selectedDetailSessionId)?.timeRange || undefined
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
