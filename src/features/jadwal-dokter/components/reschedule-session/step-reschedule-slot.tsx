'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DoctorGridSlotItem } from '../grid/doctor-grid-slot-item';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_SLOT_STATUS,
  type ScheduleShift
} from '../../constants/schedule-shift.constants';
import type { ScheduleSlotAvailabilityItem } from '@/server/contracts/schedules/doctor-schedules.dto';
import { mapScheduleSlotToGridSlot } from '../../utils/map-schedule-slot';
import { cn } from '@/lib/utils';

export interface StepRescheduleSlotProps {
  selectedShift: ScheduleShift;
  onSelectShift: (shift: ScheduleShift) => void;
  targetStartTime: string;
  targetEndTime: string;
  targetEndTimeCalculated: string;
  onSelectSlot: (slot: { time: string; endTime: string }) => void;
  availableSlots: ScheduleSlotAvailabilityItem[];
  isLoadingSlots: boolean;
  onViewOccupantDoctorSchedule: (occupantDoctorId?: string | null, slotTime?: string) => void;
}

export function StepRescheduleSlot({
  selectedShift,
  onSelectShift,
  targetStartTime,
  targetEndTime,
  targetEndTimeCalculated,
  onSelectSlot,
  availableSlots,
  isLoadingSlots,
  onViewOccupantDoctorSchedule
}: StepRescheduleSlotProps) {
  return (
    <div className='space-y-3.5'>
      <div className='grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/40 border border-border/40'>
        {ALL_SCHEDULE_SHIFTS.map((shiftKey) => {
          const isActive = selectedShift === shiftKey;
          return (
            <button
              key={shiftKey}
              type='button'
              onClick={() => onSelectShift(shiftKey)}
              className={cn(
                'py-1.5 px-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer truncate',
                isActive
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {SCHEDULE_SHIFT_LABELS[shiftKey]}
            </button>
          );
        })}
      </div>

      {isLoadingSlots && availableSlots.length === 0 ? (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-[56px] w-full rounded-xl' />
          ))}
        </div>
      ) : availableSlots.length === 0 ? (
        <EmptyState
          animated
          title='Tidak Ada Slot Pada Sesi Ini'
          description='Silakan beralih ke sesi lain untuk melihat ketersediaan slot.'
          className='border-0 bg-transparent py-2 min-h-0'
          animationClassName='w-32 h-32 sm:w-36 sm:h-36'
        />
      ) : (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
          {availableSlots.map((rawSlot) => {
            const isSelected = targetStartTime === rawSlot.time;
            const isPurpleConflict = rawSlot.status === SCHEDULE_SLOT_STATUS.OCCUPIED_BY_OTHER;
            const occupancySlot = mapScheduleSlotToGridSlot(rawSlot);

            return (
              <DoctorGridSlotItem
                key={`${rawSlot.slotIndex}-${rawSlot.time}`}
                slot={occupancySlot}
                isFinished={false}
                isNow={false}
                isClickable={occupancySlot.isClickable}
                isSelected={isSelected}
                onSlotClick={() => {
                  if (rawSlot.isAvailable) {
                    onSelectSlot({ time: rawSlot.time, endTime: rawSlot.endTime });
                  } else if (isPurpleConflict) {
                    const occupantId =
                      rawSlot.conflict?.practitionerId || rawSlot.conflict?.staffId;
                    if (occupantId) {
                      onViewOccupantDoctorSchedule(occupantId, rawSlot.time);
                    }
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {targetStartTime && (
        <div className='flex items-center justify-between p-2.5 rounded-xl border border-primary/30 bg-primary/5 text-xs'>
          <span className='font-semibold text-foreground'>Slot Terpilih:</span>
          <span className='font-mono font-bold text-primary'>
            {targetStartTime} - {targetEndTime || targetEndTimeCalculated || '--:--'}
          </span>
        </div>
      )}
    </div>
  );
}
