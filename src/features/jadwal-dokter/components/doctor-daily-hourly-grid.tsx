'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import type { HourlySlotStatus } from '../utils/shift-slot-builder';

import { useDoctorHourlyGrid } from '../model/useDoctorHourlyGrid';
import {
  DoctorGridHeader,
  DoctorGridMetrics,
  DoctorGridShiftSection,
  DoctorGridLegend
} from './grid';

import { DoctorAddSessionModal } from './doctor-add-session-modal';
import { DoctorEditSessionModal } from './doctor-edit-session-modal';
import { DoctorRescheduleSessionModal } from './doctor-reschedule-session-modal';
import { DoctorSessionDetailModal } from './doctor-session-detail-modal';
import { DoctorSessionPatientsModal } from './doctor-session-patients-modal';

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
  className
}: DoctorDailyHourlyGridProps) {
  const {
    activeDay,
    activeMonth,
    activeYear,
    totalDaysInMonth,
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
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleSlotClick,
    handleOpenPatients,
    handleOpenReschedule,
    handleOpenEditSession,
    openAddSessionModal,
    handleToggleSessionStatus,
    handleConfirmCloseSession,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedSessionDetail,
    setSelectedSessionDetail,
    isRescheduleOpen,
    setIsRescheduleOpen,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    selectedSlotStartTime,
    setSelectedSlotStartTime,
    isEditModalOpen,
    setIsEditModalOpen,
    editingSession,
    setEditingSession,
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
    isReasonOpen,
    setIsReasonOpen,
    isCloseModalOpen,
    setIsCloseModalOpen,
    closingSession,
    setClosingSession,
    pendingSessionId,
    updateSessionMutation
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

  const formattedTargetDate = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;

  return (
    <>
      <div
        className={cn(
          'w-full bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xs font-sans overflow-hidden flex flex-col select-none',
          className
        )}
      >
        {/* 1. Header Grid: Judul Tanggal & Day Navigation Controls */}
        <DoctorGridHeader
          formattedSelectedDate={formattedSelectedDate}
          isDayCuti={isDayCuti}
          isDayClosed={isDayClosed}
          activeSessions={activeSessions}
          isCurrentDayToday={isCurrentDayToday}
          activeDay={activeDay}
          activeMonth={activeMonth}
          totalDaysInMonth={totalDaysInMonth}
          readOnly={readOnly}
          onToday={handleToday}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onOpenAddSession={() => openAddSessionModal()}
        />

        {/* 2. Cuti Reason Accordion, Notice & Radial Chart Metrics */}
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

        {/* 3. Body Grid: Discrete 30-min Consultation Slots per Shift */}
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
              onOpenEdit={handleOpenEditSession}
              onOpenReschedule={handleOpenReschedule}
              onToggleSessionStatus={handleToggleSessionStatus}
            />
          ))}

          {/* Tombol Tambah Jadwal di Bawah Grid */}
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

        {/* 4. Footer Legend */}
        <DoctorGridLegend />
      </div>

      {/* Sub-Modals */}
      {doctor && selectedSessionDetail && (
        <DoctorSessionDetailModal
          doctor={doctor}
          session={selectedSessionDetail}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSessionDetail(null);
          }}
          onOpenReschedule={(sess) => handleOpenReschedule(sess)}
          onOpenEdit={(sess) => handleOpenEditSession(sess)}
          onOpenPatients={(sess) => handleOpenPatients(sess)}
          portalContainerRef={modalContainerRef}
        />
      )}

      {doctor && (
        <DoctorAddSessionModal
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
        />
      )}

      {doctor && editingSession && (
        <DoctorEditSessionModal
          doctor={doctor}
          session={editingSession}
          isOpen={isEditModalOpen}
          targetDate={formattedTargetDate}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSession(null);
          }}
          onOpenReschedule={(sess) => {
            setIsEditModalOpen(false);
            handleOpenReschedule(sess);
          }}
          portalContainerRef={modalContainerRef}
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
        />
      )}

      {doctor && selectedSessionForPatients && (
        <DoctorSessionPatientsModal
          doctor={doctor}
          session={selectedSessionForPatients}
          isOpen={isPatientsModalOpen}
          onClose={() => {
            setIsPatientsModalOpen(false);
            setSelectedSessionForPatients(null);
          }}
          portalContainerRef={modalContainerRef}
        />
      )}

      {/* Modal Konfirmasi Tutup Jadwal Sesi */}
      <ModalWrapper
        isOpen={isCloseModalOpen}
        onClose={() => {
          setIsCloseModalOpen(false);
          setClosingSession(null);
        }}
        maxWidth='w-full sm:w-fit sm:min-w-[440px] max-w-[calc(100vw-2rem)]'
        portalContainerRef={modalContainerRef}
        showCloseButton={false}
      >
        <div className='relative font-sans space-y-4 text-left p-1'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1 min-w-0 flex-1'>
              <div className='flex items-center gap-1.5 text-rose-600 dark:text-rose-400'>
                <Icons.lock className='size-4 shrink-0' />
                <span className='text-xs font-bold tracking-tight whitespace-nowrap'>
                  Konfirmasi Tutup Jadwal
                </span>
              </div>
              <h3 className='text-sm sm:text-base font-bold text-foreground leading-snug whitespace-nowrap'>
                Apakah Anda yakin ingin menutup sesi ini?
              </h3>
            </div>
            <button
              type='button'
              onClick={() => {
                setIsCloseModalOpen(false);
                setClosingSession(null);
              }}
              aria-label='Tutup dialog'
              className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
            >
              <Icons.close className='size-4' />
            </button>
          </div>

          {closingSession && (
            <div className='rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5 text-xs'>
              <div className='flex items-center justify-between font-semibold'>
                <span className='text-foreground'>{closingSession.nama_sesi}</span>
                <span className='font-mono text-muted-foreground'>
                  {closingSession.jam_mulai} - {closingSession.jam_selesai}
                </span>
              </div>
              <p className='text-[11.5px] text-muted-foreground leading-relaxed'>
                Setelah ditutup, sesi ini tidak akan dapat dipesan oleh pasien baru.
              </p>
            </div>
          )}

          <div className='flex items-center justify-end gap-2 pt-2 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => {
                setIsCloseModalOpen(false);
                setClosingSession(null);
              }}
              className='text-xs px-4 font-semibold cursor-pointer'
            >
              Tidak
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              shape='pill'
              disabled={updateSessionMutation.isPending}
              onClick={handleConfirmCloseSession}
              className='text-xs px-4 font-semibold gap-1.5 cursor-pointer'
            >
              {updateSessionMutation.isPending && <Spinner className='size-3.5' />}
              <span>Ya, Tutup Jadwal</span>
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
