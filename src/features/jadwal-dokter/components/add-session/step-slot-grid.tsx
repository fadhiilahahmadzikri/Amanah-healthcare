'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DoctorGridSlotItem, type GridSlotData } from '../grid/doctor-grid-slot-item';
import {
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_SHIFT_BOUNDARIES,
  type ScheduleShift
} from '../../constants/schedule-shift.constants';
import type { ScheduleSlotAvailabilityResponse } from '@/server/contracts/schedules/doctor-schedules.dto';

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
  const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[selectedShift];

  // Filter only forward / active / available slots (exclude PAST and already completed slots)
  const availableSlots = useMemo(() => {
    if (!slotAvailability?.slots) return [];
    return slotAvailability.slots.filter((s) => {
      // Exclude past/expired slots
      if (s.status === 'PAST' || s.status === 'EXPIRED') return false;
      if (s.conflict?.type === 'TEMPORAL_PAST') return false;
      return true;
    });
  }, [slotAvailability?.slots]);

  return (
    <div className='space-y-4 font-sans select-none'>
      {/* Title & Shift Context */}
      {showHeader && (
        <div className='flex items-start justify-between gap-2 pb-2 border-b border-border/30'>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
              Pilih Jam Praktik {SCHEDULE_SHIFT_LABELS[selectedShift]}
            </h4>
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              Pilih jam mulai dan selesai {doctorName ? `dokter ${doctorName}` : 'dokter'} pada rentang {shiftBounds.timeRange}.
            </p>
          </div>
          <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50 bg-muted/20 text-xs font-mono font-medium text-foreground shrink-0'>
            <Icons.clock className='size-3 text-muted-foreground' />
            <span>{shiftBounds.timeRange}</span>
          </div>
        </div>
      )}

      {/* Grid of Slots */}
      {isLoadingSlots && availableSlots.length === 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[46vh] overflow-y-auto pr-1'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-[76px] w-full rounded-xl' />
          ))}
        </div>
      ) : availableSlots.length === 0 ? (
        <EmptyState
          animated
          title='Tidak Ada Slot Jam Aktif'
          description={`Seluruh slot pada sesi ${SCHEDULE_SHIFT_LABELS[selectedShift]} sudah terisi atau telah berlalu.`}
          className='border-0 bg-transparent py-2 min-h-0'
          animationClassName='w-32 h-32 sm:w-36 sm:h-36'
        />
      ) : (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[46vh] overflow-y-auto pr-1'>
          {availableSlots.map((rawSlot) => {
            const isSelected = selectedSlot?.time === rawSlot.time;
            const isPurpleConflict = rawSlot.status === 'OCCUPIED_BY_OTHER';
            const isSlotClickable = rawSlot.isAvailable || isPurpleConflict;

            // Map ScheduleSlotAvailabilityItem into GridSlotData shape for DoctorGridSlotItem
            const occupancySlot: GridSlotData = {
              slotIndex: rawSlot.slotIndex,
              startTime: rawSlot.time,
              endTime: rawSlot.endTime,
              status: rawSlot.isAvailable
                ? 'AVAILABLE'
                : isPurpleConflict
                  ? 'OCCUPIED_BY_OTHER'
                  : rawSlot.status || 'CLOSED',
              isAvailable: rawSlot.isAvailable,
              displayLabel:
                rawSlot.displayLabel || (rawSlot.isAvailable ? 'Tersedia' : 'Terisi'),
              isClickable: isSlotClickable,
              uiVariant: rawSlot.isAvailable
                ? 'available'
                : isPurpleConflict
                  ? 'purple_other'
                  : 'neutral_disabled',
              uiStatus: rawSlot.isAvailable
                ? 'AVAILABLE'
                : isPurpleConflict
                  ? 'OCCUPIED_BY_OTHER'
                  : 'CLOSED',
              conflictInfo: rawSlot.conflict
                ? {
                    type: rawSlot.conflict.type,
                    occupantName: rawSlot.conflict.occupantName ?? undefined
                  }
                : null
            };

            return (
              <DoctorGridSlotItem
                key={`${rawSlot.slotIndex}-${rawSlot.time}`}
                slot={occupancySlot}
                isFinished={false}
                isNow={false}
                isClickable={isSlotClickable}
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
            {selectedSlot.time} - {selectedSlot.endTime} WIB
          </span>
        </div>
      )}
    </div>
  );
}
