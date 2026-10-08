'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type {
  OccupancyShift,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession } from '../../api/types';
import {
  SCHEDULE_STATUS,
  SHIFT_OPERATIONAL_STATUS,
  SHIFT_OPERATIONAL_LABELS
} from '../../constants/schedule-shift.constants';
import { useDoctorConflictNavigation } from '../../model/useDoctorConflictNavigation';
import {
  DEFAULT_FALLBACK_CAPACITY,
  QUEUE_LOAD_BADGE_STYLES,
  resolveQueueLoadStatus
} from '@/features/klinik/constants/queue-load.constants';

export interface DoctorGridShiftSectionProps {
  shift: OccupancyShift;
  activeSessions: DoctorDailySession[];
  isDayCuti: boolean;
  isDayClosed: boolean;
  readOnly: boolean;
  isCurrentDayToday: boolean;
  currentTimeString: string;
  isSlotFinished?: (slot: OccupancySlot) => boolean;
  pendingSessionId: string | null;
  isMutationPending: boolean;
  onSlotClick?: (slot: OccupancySlot) => void;
  onOpenPatients: (
    session: DoctorDailySession,
    slotStartTime?: string,
    slotEndTime?: string,
    sessionShift?: string,
    shiftLabel?: string,
    shiftTimeRange?: string
  ) => void;
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
  pendingSessionId,
  isMutationPending,
  onOpenPatients,
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
    shift.slots?.some(
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
    <div className='space-y-2.5'>
      {/* Shift Header: Name, Time Range & Summary */}
      <div className='flex items-center justify-between text-xs pb-1.5 border-b border-border/30'>
        <div className='flex items-center gap-2'>
          <span className='text-foreground font-bold text-xs sm:text-[13px]'>
            {shift.contextLabel}
          </span>
          <span className='font-mono font-medium text-[11px] text-muted-foreground/70'>
            {shift.timeRange}
          </span>
        </div>

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
            <span className='font-mono text-xs text-muted-foreground'>
              {shiftBookedCount} Pasien Terdaftar
            </span>
          )}
        </div>
      </div>

      {/* Session Cards for Shift */}
      {matchingShiftSessions.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
          {matchingShiftSessions.map((session) => {
            const isClosed = session.status_sesi?.toUpperCase() === SCHEDULE_STATUS.CLOSED;
            const isUpdating = isMutationPending && pendingSessionId === session.id;
            const effCap =
              session.kuota_pasien > 0 ? session.kuota_pasien : DEFAULT_FALLBACK_CAPACITY;
            const booked =
              session.pasien_terdaftar !== undefined
                ? session.pasien_terdaftar
                : Math.max(0, effCap - session.slot_tersedia);
            const loadStatus = session.loadStatus || resolveQueueLoadStatus(booked / effCap);

            return (
              <div
                key={session.id}
                className={cn(
                  'rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 text-card-foreground',
                  isClosed
                    ? 'bg-muted/30 border-border/40 opacity-75'
                    : 'bg-card border-border/60 hover:border-primary/50 shadow-2xs'
                )}
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='space-y-0.5 min-w-0 flex-1'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='font-bold text-xs sm:text-sm text-foreground truncate'>
                        {session.nama_sesi || shift.contextLabel}
                      </span>
                      <span className='font-mono text-[11px] text-muted-foreground'>
                        {session.jam_mulai} - {session.jam_selesai} WIB
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5 text-[11.5px] text-muted-foreground pt-0.5'>
                      <Icons.location className='size-3 text-primary/70 shrink-0' />
                      <span className='truncate'>{session.ruang || 'Ditentukan saat dipanggil'}</span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10.5px] font-bold border select-none shrink-0',
                      isClosed
                        ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        : QUEUE_LOAD_BADGE_STYLES[loadStatus]
                    )}
                  >
                    {isClosed ? 'Ditutup' : loadStatus}
                  </span>
                </div>

                <div className='pt-1 border-t border-border/30 flex items-center justify-between gap-2 flex-wrap'>
                  <button
                    type='button'
                    onClick={() =>
                      onOpenPatients(
                        session,
                        undefined,
                        undefined,
                        shift.sessionShift || shift.contextId,
                        shift.contextLabel,
                        shift.timeRange
                      )
                    }
                    className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer'
                  >
                    <Icons.teams className='size-3 text-primary' />
                    <span>{booked} Pasien Terdaftar</span>
                  </button>

                  {!readOnly && (
                    <div className='flex items-center gap-1.5'>
                      <button
                        type='button'
                        onClick={() => onOpenReschedule(session)}
                        className='px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer border border-border/40'
                        title='Reschedule Sesi Praktik'
                      >
                        Reschedule
                      </button>

                      <button
                        type='button'
                        onClick={() => onToggleSessionStatus(session)}
                        disabled={isUpdating}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border',
                          isClosed
                            ? 'text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10'
                            : 'text-amber-600 border-amber-500/30 hover:bg-amber-500/10'
                        )}
                      >
                        {isUpdating ? '...' : isClosed ? 'Buka Sesi' : 'Tutup Sesi'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='p-3.5 rounded-xl border border-dashed border-border/50 text-center text-xs text-muted-foreground'>
          {isDayCuti
            ? 'Dokter sedang cuti operasional pada shift ini.'
            : isDayClosed
              ? 'Praktik ditutup untuk shift ini.'
              : 'Tidak ada sesi praktik terjadwal pada shift ini.'}
        </div>
      )}
    </div>
  );
}
