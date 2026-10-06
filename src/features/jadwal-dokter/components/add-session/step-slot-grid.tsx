'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DoctorGridSlotItem } from '../grid/doctor-grid-slot-item';
import {
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_SLOT_STATUS,
  type ScheduleShift
} from '../../constants/schedule-shift.constants';
import type { ScheduleSlotAvailabilityResponse } from '@/server/contracts/schedules/doctor-schedules.dto';
import { useScheduleReferenceOptions } from '../../hooks/useScheduleReferenceOptions';
import { mapScheduleSlotToGridSlot } from '../../utils/map-schedule-slot';

export interface StepSlotGridProps {
  selectedShift: ScheduleShift;
  selectedSlot: { time: string; endTime: string } | null;
  onSelectSlot: (slot: { time: string; endTime: string }) => void;
  slotAvailability?: ScheduleSlotAvailabilityResponse;
  isLoadingSlots: boolean;
  doctorName?: string;
  showHeader?: boolean;
  onViewDoctorSchedule?: (doctorId: string, targetSlotTime?: string) => void;
}

export function StepSlotGrid({
  selectedShift,
  selectedSlot,
  onSelectSlot,
  slotAvailability,
  isLoadingSlots,
  doctorName,
  showHeader = true,
  onViewDoctorSchedule
}: StepSlotGridProps) {
  const { getShiftBounds } = useScheduleReferenceOptions();
  const shiftBounds = getShiftBounds(selectedShift);
  const timeRange =
    shiftBounds?.timeRange ||
    (shiftBounds ? `${shiftBounds.startTime} - ${shiftBounds.endTime}` : '');

  const slots = useMemo(() => {
    return slotAvailability?.slots || [];
  }, [slotAvailability?.slots]);

  return (
    <div className='space-y-4 font-sans select-none'>
      {showHeader && (
        <div className='flex items-start justify-between gap-2 pb-2 border-b border-border/30'>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
              Pilih Jam Praktik {SCHEDULE_SHIFT_LABELS[selectedShift]}
            </h4>
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              Pilih jam mulai dan selesai {doctorName ? `dokter ${doctorName}` : 'dokter'} pada
              rentang {timeRange}.
            </p>
          </div>
          <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50 bg-muted/20 text-xs font-mono font-medium text-foreground shrink-0'>
            <Icons.clock className='size-3 text-muted-foreground' />
            <span>{timeRange}</span>
          </div>
        </div>
      )}

      {isLoadingSlots && slots.length === 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-[76px] w-full rounded-xl' />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <EmptyState
          animated
          title='Tidak Ada Slot Jam Aktif'
          description={`Seluruh slot pada sesi ${SCHEDULE_SHIFT_LABELS[selectedShift]} sudah terisi atau telah berlalu.`}
          className='border-0 bg-transparent py-2 min-h-0'
          animationClassName='w-32 h-32 sm:w-36 sm:h-36'
        />
      ) : (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[46vh] overflow-y-auto pr-1'>
          {slots.map((rawSlot) => {
            const isSelected = selectedSlot?.time === rawSlot.time;
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
                    if (occupantId && onViewDoctorSchedule) {
                      onViewDoctorSchedule(occupantId, rawSlot.time);
                    }
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className='flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs'>
          <span className='font-semibold text-foreground'>Slot Terpilih:</span>
          <span className='font-mono font-bold text-primary'>
            {selectedSlot.time} - {selectedSlot.endTime}
          </span>
        </div>
      )}
    </div>
  );
}
