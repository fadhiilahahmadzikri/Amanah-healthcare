'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
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
  onAddSchedule?: () => void;
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
    handleToday,
    handleSelectDate,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
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
            <DoctorCutiNotice title='Dokter sedang isOnLeave' subtitle={dayLeaveReason} />
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
                      isPending={updateSessionMutation.isPending && pendingSessionId === session.id}
                      onToggleStatus={handleToggleSessionStatus}
                      onSelectPatient={(patient, sess) => {
                        setSelectedDetailSessionId(sess.id);
                        handleOpenPatientDetail(patient);
                      }}
                    />
                  ))}
                </Accordion>
              )}
            </div>
          )}
        </div>
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
