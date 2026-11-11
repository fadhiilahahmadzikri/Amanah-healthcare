'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StaffAttendanceMilestone } from '../api/types';
import { formatPresenceTimestamp } from '../utils/duration-format';
import { MILESTONE_STATUS } from '../constants/attendance-status.constants';

export interface AttendanceMilestoneTimelineProps {
  milestones?: StaffAttendanceMilestone[];
  className?: string;
}

function formatShiftTime(timeStr?: string | null): string {
  if (!timeStr) return '--:--';
  const parts = timeStr.trim().split(':');
  return `${parts[0] || '00'}:${parts[1] || '00'}`;
}

export function AttendanceMilestoneTimeline({
  milestones = [],
  className,
}: AttendanceMilestoneTimelineProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className='p-4 rounded-xl border border-dashed border-border/60 text-center text-xs text-muted-foreground'>
        Tidak ada jadwal sesi dinas terdaftar pada tanggal ini.
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className='flex items-center justify-between pb-1.5'>
        <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
          Trajektori Sesi Dinas ({milestones.length} Sesi)
        </span>
      </div>

      <div className='relative pl-5 before:absolute before:left-2.25 before:top-2.5 before:bottom-3 before:w-0.5 before:bg-border/60 space-y-3.5'>
        {milestones.map((m) => {
          const isPresent = m.status === MILESTONE_STATUS.PRESENT;
          const isLate = m.status === MILESTONE_STATUS.LATE;
          const isAbsent = m.status === MILESTONE_STATUS.ABSENT;
          const isLeave = m.status === MILESTONE_STATUS.LEAVE;
          const isOngoing = m.status === MILESTONE_STATUS.ONGOING;
          const isUpcoming = m.status === MILESTONE_STATUS.UPCOMING;

          const timeRange = `${formatShiftTime(m.startsAt)} - ${formatShiftTime(m.endsAt)}`;

          let checkInFormatted: string | null = null;
          if (m.checkInAt) {
            checkInFormatted = formatPresenceTimestamp(m.checkInAt, true);
          }

          let checkOutFormatted: string | null = null;
          if (m.checkOutAt) {
            checkOutFormatted = formatPresenceTimestamp(m.checkOutAt, true);
          }

          return (
            <div key={m.sessionId || m.shiftCode} className='relative group'>
              {/* Timeline Indicator Dot */}
              <div
                className={cn(
                  'absolute -left-5 top-1 size-4.5 rounded-full ring-4 ring-card flex items-center justify-center text-[10px] font-bold transition-all',
                  isPresent && 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20',
                  isLate && 'bg-amber-500 text-white shadow-xs shadow-amber-500/20',
                  isAbsent && 'bg-rose-500 text-white shadow-xs shadow-rose-500/20',
                  isLeave && 'bg-purple-500 text-white shadow-xs shadow-purple-500/20',
                  isOngoing && 'bg-blue-500 text-white animate-pulse shadow-xs shadow-blue-500/30',
                  isUpcoming && 'bg-muted border border-border/80 text-muted-foreground'
                )}
              >
                {isPresent && <Icons.check className='size-2.5 stroke-[3]' />}
                {isLate && <Icons.warning className='size-2.5 stroke-[2.5]' />}
                {isAbsent && <Icons.close className='size-2.5 stroke-[3]' />}
                {isLeave && <Icons.calendar className='size-2.5' />}
                {isOngoing && <span className='size-1.5 rounded-full bg-white' />}
                {isUpcoming && <span className='size-1 rounded-full bg-muted-foreground' />}
              </div>

              {/* Card Node */}
              <div
                className={cn(
                  'p-3 rounded-xl border transition-all',
                  m.isCurrentShift
                    ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20'
                    : isAbsent
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : isLate
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : isPresent
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-muted/20 border-border/40'
                )}
              >
                <div className='flex items-center justify-between gap-2'>
                  <div className='min-w-0 flex items-center gap-1.5'>
                    <span className='font-semibold text-xs text-foreground truncate'>
                      {m.shiftLabel}
                    </span>
                    <span className='text-[10px] font-mono text-muted-foreground shrink-0'>
                      ({timeRange})
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className='shrink-0 flex items-center gap-1'>
                    <span
                      className={cn(
                        'text-[10.5px] font-bold px-2 py-0.5 rounded-full',
                        isPresent && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                        isLate && 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                        isAbsent && 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
                        isLeave && 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
                        isOngoing && 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
                        isUpcoming && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {m.statusLabel}
                    </span>

                    {isLate && m.lateMinutes ? (
                      <span className='text-[10px] font-medium text-amber-600 dark:text-amber-400'>
                        +{m.lateMinutes}m
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Sub details: Check-in, Check-out, Notes */}
                {(checkInFormatted || checkOutFormatted || m.notes) && (
                  <div className='mt-2 pt-2 border-t border-border/30 grid grid-cols-2 gap-2 text-[11px]'>
                    {checkInFormatted && (
                      <div>
                        <span className='text-[10px] text-muted-foreground block'>Masuk:</span>
                        <span className='font-mono font-medium text-foreground'>
                          {checkInFormatted}
                        </span>
                      </div>
                    )}

                    {checkOutFormatted && (
                      <div>
                        <span className='text-[10px] text-muted-foreground block'>Pulang:</span>
                        <span className='font-mono font-medium text-foreground'>
                          {checkOutFormatted}
                        </span>
                      </div>
                    )}

                    {m.notes && (
                      <div className='col-span-2 text-muted-foreground text-[10.5px] italic'>
                        {m.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
