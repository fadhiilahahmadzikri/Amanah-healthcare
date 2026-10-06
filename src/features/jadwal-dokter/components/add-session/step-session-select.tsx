'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_LABELS,
  type ScheduleShift
} from '../../constants/schedule-shift.constants';
import type { DoctorDailySession } from '../../api/types';
import { useScheduleShiftAvailability } from '../../model/useScheduleShiftAvailability';
import { useScheduleReferenceOptions } from '../../hooks/useScheduleReferenceOptions';

export interface StepSessionSelectProps {
  selectedShift: ScheduleShift | null;
  onSelectShift: (shift: ScheduleShift) => void;
  selectedDate: string;
  formattedDisplayDate: string;
  existingSessions?: DoctorDailySession[];
  doctorName?: string;
  isLoading?: boolean;
  showHeader?: boolean;
}

export function StepSessionSelect({
  selectedShift,
  onSelectShift,
  selectedDate,
  formattedDisplayDate,
  existingSessions = [],
  doctorName,
  isLoading = false,
  showHeader = true
}: StepSessionSelectProps) {
  const { shifts: refShifts, getShiftBounds } = useScheduleReferenceOptions();

  const shiftAvailability = useScheduleShiftAvailability({
    selectedDate,
    existingSessions,
    shifts: refShifts
  });

  return (
    <div className='space-y-4 font-sans select-none'>
      {showHeader && (
        <div>
          <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Pilih Sesi Shift Praktik
          </h4>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan shift praktik {doctorName ? `dokter ${doctorName}` : 'dokter'} untuk tanggal{' '}
            {formattedDisplayDate}.
          </p>
        </div>
      )}

      {/* Canonical 4 Shifts Cards */}
      {isLoading ? (
        <div className='space-y-2.5'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[68px] w-full rounded-xl' />
          ))}
        </div>
      ) : (
        <div className='space-y-2.5'>
          {ALL_SCHEDULE_SHIFTS.map((shift) => {
            const shiftBounds = getShiftBounds(shift);
            const timeRange =
              shiftBounds?.timeRange ||
              (shiftBounds ? `${shiftBounds.startTime} - ${shiftBounds.endTime}` : '');
            const isSelected = selectedShift === shift;
            const status = shiftAvailability[shift];
            const isUnavailable = status?.isUnavailable ?? false;
            const badgeLabel = status?.badgeLabel;

            return (
              <button
                type='button'
                key={shift}
                aria-label={`Pilih Sesi ${SCHEDULE_SHIFT_LABELS[shift]}`}
                disabled={isUnavailable}
                onClick={() => {
                  if (!isUnavailable) {
                    onSelectShift(shift);
                  }
                }}
                className={cn(
                  'w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border transition-all',
                  isUnavailable
                    ? 'border-border/40 bg-muted/25 opacity-55 cursor-not-allowed pointer-events-none'
                    : isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs cursor-pointer'
                      : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20 cursor-pointer'
                )}
              >
                <div className='flex items-center gap-3 min-w-0 flex-1'>
                  <div
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isUnavailable
                        ? 'bg-muted/60 text-muted-foreground/60'
                        : isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icons.clock className='size-4' />
                  </div>

                  <div className='min-w-0 flex-1 space-y-0.5'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-xs sm:text-sm font-bold text-foreground'>
                        Sesi {SCHEDULE_SHIFT_LABELS[shift]}
                      </span>
                      {badgeLabel && (
                        <span className='inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold border bg-muted text-muted-foreground border-border/40'>
                          {badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground font-medium font-mono'>
                      {timeRange}
                    </p>
                  </div>
                </div>

                <div className='shrink-0 pl-2'>
                  <div
                    className={cn(
                      'size-5 rounded-full border flex items-center justify-center transition-all',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 bg-transparent'
                    )}
                  >
                    {isSelected && <div className='size-2 rounded-full bg-white' />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
