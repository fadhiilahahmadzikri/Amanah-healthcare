'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Spinner } from '@/components/ui/spinner';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession } from '../../api/types';
import { STATUS_CONFIG, UI_VARIANT_CONFIG } from '../../utils/shift-slot-builder';

export type GridSlotData = Partial<OccupancySlot> & {
  startTime: string;
  endTime: string;
  slotIndex?: number;
  status?: string;
  isAvailable?: boolean;
  displayLabel?: string;
};

export interface DoctorGridSlotItemProps {
  slot: GridSlotData;
  isFinished?: boolean;
  isNow?: boolean;
  isClickable?: boolean;
  isSlotUpdating?: boolean;
  isSelected?: boolean;
  matchingSession?: DoctorDailySession;
  hasHoverMenu?: boolean;
  isSessionClosed?: boolean;
  isThisSessionPending?: boolean;
  onSlotClick?: () => void;
  onOpenPatients?: (session: DoctorDailySession) => void;
  onOpenEdit?: (session: DoctorDailySession) => void;
  onOpenReschedule?: (session: DoctorDailySession, slotStartTime?: string) => void;
  onToggleSessionStatus?: (session: DoctorDailySession) => void;
  className?: string;
}

export function DoctorGridSlotItem({
  slot,
  isFinished = false,
  isNow = false,
  isClickable = true,
  isSlotUpdating = false,
  isSelected = false,
  matchingSession,
  hasHoverMenu = false,
  isSessionClosed = false,
  isThisSessionPending = false,
  onSlotClick,
  onOpenPatients,
  onOpenEdit,
  onOpenReschedule,
  onToggleSessionStatus,
  className
}: DoctorGridSlotItemProps) {
  const variantCfg = isFinished
    ? STATUS_CONFIG.EXPIRED
    : (slot.uiVariant && UI_VARIANT_CONFIG[slot.uiVariant]) ||
      (slot.status && STATUS_CONFIG[slot.status]) ||
      UI_VARIANT_CONFIG.neutral_disabled;

  const displayLabel = isFinished ? 'Selesai' : slot.displayLabel;

  const isRescheduled =
    !isFinished &&
    (slot.uiStatus === 'RESCHEDULED' || Boolean(slot.reschedule?.isRescheduled));

  const isClosed =
    !isFinished &&
    (slot.uiStatus === 'CLOSED_CLINIC' ||
      slot.uiStatus === 'CLOSED_LEAVE' ||
      slot.status === 'CLOSED' ||
      slot.status === 'CLOSED_LEAVE');

  const slotButton = (
    <button
      type='button'
      onClick={onSlotClick}
      disabled={!isClickable || isSlotUpdating}
      className={cn(
        'w-full min-h-[52px] sm:min-h-[56px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative outline-none overflow-hidden select-none',
        variantCfg.cellBg,
        variantCfg.border,
        isSelected && 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xs',
        !isClickable
          ? 'cursor-default opacity-80'
          : 'cursor-pointer hover:shadow-xs hover:border-primary/50',
        isNow && 'ring-1.5 ring-primary font-bold',
        isSlotUpdating && 'cursor-wait',
        className
      )}
    >
      {/* In-Slot Loading Overlay */}
      {isSlotUpdating && (
        <div
          role='status'
          aria-label='Menyimpan status sesi'
          className='absolute inset-0 z-20 rounded-xl bg-background/85 backdrop-blur-[1px] flex items-center justify-center gap-1 animate-in fade-in duration-150'
        >
          <Spinner className='size-3.5 text-primary' />
        </div>
      )}

      {/* Baris Atas: Jam Mulai & Indikator Titik / Reschedule / Closure */}
      <div className='flex items-center justify-between'>
        <span
          className={cn(
            'text-xs sm:text-[12.5px] font-mono font-bold leading-none',
            isNow
              ? 'text-primary font-black'
              : 'timeText' in variantCfg && typeof variantCfg.timeText === 'string'
                ? variantCfg.timeText
                : 'text-foreground'
          )}
        >
          {slot.startTime}
        </span>
        <div className='flex items-center gap-1 shrink-0'>
          {isRescheduled && (
            <Icons.history
              className='size-3 text-amber-600 dark:text-amber-400 shrink-0'
              title={slot.reschedule?.reasonText || 'Sesi dijadwalkan ulang'}
            />
          )}
          {isClosed && slot.closure && (
            <Icons.lock
              className='size-2.5 text-rose-600 dark:text-rose-400 shrink-0'
              title={slot.closure.reasonText || 'Ditutup'}
            />
          )}
          <span className={cn('size-2 rounded-full shrink-0', variantCfg.dotBg)} />
        </div>
      </div>

      {/* Baris Bawah: Status Label Kanonikal & Jam Selesai */}
      <div className='mt-1 flex items-end justify-between gap-1'>
        <span
          className={cn(
            'text-[10px] sm:text-[10.5px] font-bold leading-none select-none tracking-tight block truncate',
            variantCfg.text
          )}
          title={displayLabel}
        >
          {displayLabel}
        </span>

        <span className='text-[9px] font-mono text-muted-foreground/70 font-semibold shrink-0'>
          {slot.uiSubLabel || slot.endTime}
        </span>
      </div>
    </button>
  );

  if (hasHoverMenu && matchingSession) {
    return (
      <HoverCard openDelay={200} closeDelay={150}>
        <HoverCardTrigger asChild>{slotButton}</HoverCardTrigger>
        <HoverCardContent
          align='center'
          side='top'
          sideOffset={6}
          className='w-48 p-1.5 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg z-50 animate-in fade-in-0 zoom-in-95 font-sans'
        >
          <div className='flex flex-col gap-0.5'>
            <div className='px-2 py-1 text-[10.5px] font-semibold text-muted-foreground border-b border-border/30 mb-0.5 flex items-center justify-between'>
              <span className='truncate'>{matchingSession.nama_sesi}</span>
              <span className='font-mono text-[9.5px] shrink-0'>{slot.startTime}</span>
            </div>
            {onOpenPatients && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPatients(matchingSession);
                }}
                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
              >
                <Icons.teams className='size-3.5 text-sky-600 dark:text-sky-400 shrink-0' />
                <span>Lihat Pasien</span>
              </button>
            )}
            {onOpenEdit && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEdit(matchingSession);
                }}
                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
              >
                <Icons.edit className='size-3.5 text-primary shrink-0' />
                <span>Ubah Sesi</span>
              </button>
            )}
            {onOpenReschedule && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReschedule(matchingSession, slot.startTime);
                }}
                className='flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer text-left'
              >
                <Icons.history className='size-3.5 text-amber-600 dark:text-amber-400 shrink-0' />
                <span>Reschedule</span>
              </button>
            )}
            {onToggleSessionStatus && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSessionStatus(matchingSession);
                }}
                disabled={isThisSessionPending}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-left',
                  isThisSessionPending
                    ? 'text-muted-foreground cursor-wait'
                    : isSessionClosed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {isThisSessionPending ? (
                  <>
                    <Spinner className='size-3.5 text-primary' />
                    <span>Menyimpan...</span>
                  </>
                ) : isSessionClosed ? (
                  <>
                    <Icons.check className='size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
                    <span>Buka Jadwal</span>
                  </>
                ) : (
                  <>
                    <Icons.lock className='size-3.5 text-rose-600 dark:text-rose-400 shrink-0' />
                    <span>Tutup Jadwal</span>
                  </>
                )}
              </button>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return slotButton;
}
