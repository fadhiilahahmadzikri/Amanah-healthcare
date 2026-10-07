'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession } from '../../api/types';
import { DoctorGridSlotItem, type GridSlotData } from './doctor-grid-slot-item';
import {
  SCHEDULE_STATUS,
  SHIFT_OPERATIONAL_STATUS,
  SHIFT_OPERATIONAL_LABELS
} from '../../constants/schedule-shift.constants';
import { isSlotOccupiedOrBooked } from '../../utils/doctor-schedule-predicates';
import { useDoctorConflictNavigation } from '../../model/useDoctorConflictNavigation';

export interface DoctorGridShiftSectionProps {
  shift: OccupancyShift;
  activeSessions: DoctorDailySession[];
  isDayCuti: boolean;
  isDayClosed: boolean;
  readOnly: boolean;
  isCurrentDayToday: boolean;
  currentTimeString: string;
  isSlotFinished: (slot: OccupancySlot) => boolean;
  pendingSessionId: string | null;
  isMutationPending: boolean;
  onSlotClick: (slot: OccupancySlot) => void;
  onOpenPatients: (
    session: DoctorDailySession,
    slotStartTime?: string,
    slotEndTime?: string,
    sessionShift?: string,
    shiftLabel?: string
  ) => void;
  onOpenPatientDetail?: (session: DoctorDailySession, slot: OccupancySlot | GridSlotData) => void;
  onOpenChangeDoctor?: (session: DoctorDailySession, slot: OccupancySlot | GridSlotData) => void;
  onOpenChangeRoom?: (session: DoctorDailySession, slot: OccupancySlot | GridSlotData) => void;
  onOpenReschedule: (session: DoctorDailySession, slotStartTime?: string) => void;
  onToggleSessionStatus: (session: DoctorDailySession) => void;
  highlightSlotTime?: string;
  onReturnToSourceModal?: () => void;
  returnDoctorName?: string;
}

export function DoctorGridShiftSection({
  shift,
  activeSessions,
  isDayCuti,
  isDayClosed,
  readOnly,
  isCurrentDayToday,
  currentTimeString,
  isSlotFinished,
  pendingSessionId,
  isMutationPending,
  onSlotClick,
  onOpenPatients,
  onOpenPatientDetail,
  onOpenChangeDoctor,
  onOpenChangeRoom,
  onOpenReschedule,
  onToggleSessionStatus,
  highlightSlotTime,
  onReturnToSourceModal,
  returnDoctorName
}: DoctorGridShiftSectionProps) {
  const conflictNav = useDoctorConflictNavigation();
  const effectiveHighlightTime =
    highlightSlotTime ||
    conflictNav.highlightSlotTime ||
    conflictNav.returnContext?.sourceSlotStartTime ||
    undefined;

  const isHighlightedShift = Boolean(
    effectiveHighlightTime &&
    shift.slots.some(
      (slot) =>
        slot.startTime === effectiveHighlightTime ||
        (slot.startTime <= effectiveHighlightTime && slot.endTime > effectiveHighlightTime)
    )
  );

  const showReturnButton = Boolean(
    (onReturnToSourceModal || conflictNav.isInspecting || conflictNav.returnContext) &&
    isHighlightedShift
  );
  const effectiveReturnDoctorName =
    returnDoctorName ||
    conflictNav.returnContext?.sourceDoctorName ||
    conflictNav.pendingReopen?.sourceDoctorName;

  const matchingShiftSessions = activeSessions.filter((s) =>
    Boolean(
      shift.boundaryStartTime &&
      shift.boundaryEndTime &&
      s.jam_mulai >= shift.boundaryStartTime &&
      s.jam_mulai < shift.boundaryEndTime
    )
  );
  const primaryShiftSession = matchingShiftSessions[0];

  const sessionBookedCount = matchingShiftSessions.reduce((acc, s) => {
    const rawStatus = s.status_sesi ? s.status_sesi.toUpperCase() : '';
    if (rawStatus === SCHEDULE_STATUS.CLOSED || rawStatus === SCHEDULE_STATUS.CUTI) {
      return acc;
    }
    if (s.pasien_terdaftar !== undefined) {
      return acc + s.pasien_terdaftar;
    }
    const capacity = s.kuota_pasien;
    const available = s.slot_tersedia !== undefined ? s.slot_tersedia : capacity;
    return acc + Math.max(0, capacity - available);
  }, 0);

  const shiftBookedCount = isDayClosed || isDayCuti ? 0 : sessionBookedCount;

  return (
    <div className='space-y-2'>
      {/* Y-Axis Shift Header: Shift Name, Time Range & Slot Metrics SSOT */}
      <div className='flex items-center justify-between text-xs pb-1.5 border-b border-border/30'>
        <div className='flex items-center gap-2'>
          <span className='text-foreground font-bold text-xs sm:text-[13px]'>
            {shift.contextLabel}
          </span>
          <span className='font-mono font-medium text-[11px] text-muted-foreground/70'>
            {shift.timeRange}
          </span>
        </div>

        {/* Indikator Kuota / Slot Khusus Sesi Shift Ini (Backend SSOT) */}
        <div className='flex items-center gap-2 flex-wrap'>
          {showReturnButton && (
            <button
              type='button'
              onClick={() => {
                if (onReturnToSourceModal) {
                  onReturnToSourceModal();
                } else {
                  conflictNav.returnToSourceWizard();
                }
              }}
              className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-all cursor-pointer shadow-2xs'
              title={
                effectiveReturnDoctorName
                  ? `Kembali ke pemilihan ruang ${effectiveReturnDoctorName}`
                  : 'Kembali ke pemilihan ruang'
              }
            >
              <Icons.chevronLeft className='size-3 stroke-[2.5]' />
              <span>Kembali ke Pemilihan Ruang</span>
            </button>
          )}
          {isDayCuti ? (
            <span className='text-[11px] font-semibold text-sky-600 dark:text-sky-400'>
              Praktik Cuti
            </span>
          ) : isDayClosed ? (
            <span className='text-[11px] font-semibold text-muted-foreground'>Praktik Ditutup</span>
          ) : shift.operationalStatus === SHIFT_OPERATIONAL_STATUS.NO_PRACTICE ? (
            <span className='font-mono text-xs text-muted-foreground'>
              {shift.operationalLabel ||
                SHIFT_OPERATIONAL_LABELS[SHIFT_OPERATIONAL_STATUS.NO_PRACTICE]}
            </span>
          ) : (
            <>
              {primaryShiftSession && (shift.registeredPatientsCount ?? shiftBookedCount) > 0 && (
                <button
                  type='button'
                  onClick={() =>
                    onOpenPatients(
                      primaryShiftSession,
                      shift.boundaryStartTime,
                      shift.boundaryEndTime,
                      shift.shift,
                      shift.contextLabel
                    )
                  }
                  className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer shadow-2xs'
                  title='Lihat daftar pasien terdaftar pada sesi shift ini'
                >
                  <Icons.teams className='size-3 text-primary' />
                  <span>
                    {shift.registeredPatientsCount !== undefined
                      ? `${shift.registeredPatientsCount} Pasien`
                      : `${shiftBookedCount} Pasien`}
                  </span>
                </button>
              )}
              <span className='font-mono text-xs text-muted-foreground'>
                {shift.operationalLabel ||
                  (shift.metrics?.availableSlots !== undefined
                    ? `${shift.metrics.availableSlots} slot tersedia`
                    : primaryShiftSession?.slot_tersedia !== undefined
                      ? `${primaryShiftSession.slot_tersedia} slot tersedia`
                      : `${shift.availableSlotsCount ?? 0} slot tersedia`)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5'>
        {shift.slots.map((slot) => {
          const isFinished = isSlotFinished(slot);
          const hasBookedPatients = isSlotOccupiedOrBooked(slot);
          const isNow =
            !isFinished &&
            isCurrentDayToday &&
            currentTimeString >= slot.startTime &&
            currentTimeString < slot.endTime;

          const matchingSession = activeSessions.find(
            (s) =>
              (slot.sessionId && s.id === slot.sessionId) ||
              (slot.startTime >= s.jam_mulai && slot.startTime < s.jam_selesai) ||
              slot.startTime === s.jam_mulai ||
              (slot.conflictInfo?.sessionId && s.id === slot.conflictInfo.sessionId)
          );

          const isUnscheduled = !matchingSession;

          const isClickable =
            !isDayCuti &&
            !readOnly &&
            slot.isClickable !== false &&
            (!isFinished || hasBookedPatients) &&
            (isUnscheduled ? !isDayClosed : true);

          const hasHoverMenu = Boolean(matchingSession && !isFinished && !isDayCuti && !readOnly);

          const isSlotUpdating = Boolean(
            matchingSession && isMutationPending && pendingSessionId === matchingSession.id
          );

          const isSessionClosed = matchingSession?.status_sesi === SCHEDULE_STATUS.CLOSED;

          const isThisSessionPending =
            isMutationPending && pendingSessionId === matchingSession?.id;

          const isHighlighted = Boolean(
            !isFinished &&
            highlightSlotTime &&
            (slot.startTime === highlightSlotTime ||
              (slot.startTime <= highlightSlotTime && slot.endTime > highlightSlotTime))
          );

          return (
            <DoctorGridSlotItem
              key={`${shift.contextId}-${slot.slotIndex}-${slot.startTime}`}
              slot={slot}
              isFinished={isFinished}
              isNow={isNow}
              isClickable={isClickable}
              isSlotUpdating={isSlotUpdating}
              isHighlighted={isHighlighted}
              matchingSession={matchingSession}
              hasHoverMenu={hasHoverMenu}
              isSessionClosed={isSessionClosed}
              isThisSessionPending={isThisSessionPending}
              onSlotClick={() => onSlotClick(slot)}
              onOpenPatients={onOpenPatients}
              onOpenPatientDetail={onOpenPatientDetail}
              onOpenChangeDoctor={onOpenChangeDoctor}
              onOpenChangeRoom={onOpenChangeRoom}
              onOpenReschedule={onOpenReschedule}
              onToggleSessionStatus={onToggleSessionStatus}
            />
          );
        })}
      </div>
    </div>
  );
}
