'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SCHEDULE_STATUS, SCHEDULE_STATUS_LABELS } from '../../constants/schedule-shift.constants';
import { cn } from '@/lib/utils';
import type { DoctorDailySession, TimelineInterval } from '../../api/types';

export interface DoctorGanttSessionLaneProps {
  session: DoctorDailySession;
  intervals: TimelineInterval[];
  readOnly?: boolean;
  onOpenReschedule: (session: DoctorDailySession) => void;
}

export function DoctorGanttSessionLane({
  session,
  intervals,
  readOnly = false,
  onOpenReschedule
}: DoctorGanttSessionLaneProps) {
  return (
    <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xs'>
      <div className='p-3 bg-muted/20 border-b border-border/40 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5 flex-wrap min-w-0'>
          <div className='flex items-center gap-1.5'>
            <span className='size-2 rounded-full bg-primary' />
            <h4 className='text-xs sm:text-[13px] font-bold text-foreground tracking-tight'>
              {session.nama_sesi}
            </h4>
          </div>
          <span className='font-mono text-xs px-2 py-0.5 rounded-md bg-background border border-border/50 text-foreground font-semibold'>
            {session.waktu || `${session.jam_mulai} - ${session.jam_selesai}`}
          </span>
          <span className='text-xs text-muted-foreground truncate'>• {session.ruang}</span>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {!readOnly && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              onClick={() => onOpenReschedule(session)}
              className='h-7 px-3 text-xs font-semibold text-foreground/85 hover:text-foreground'
              leadingIcon={<Icons.history className='size-3.5 text-muted-foreground' />}
            >
              Reschedule
            </Button>
          )}
        </div>
      </div>

      <div className='overflow-x-auto p-3'>
        <div className='min-w-max flex items-stretch gap-2'>
          {intervals.map((interval) => {
            const isOccupied = interval.status === 'OCCUPIED';
            const isOpen = interval.status === 'OPEN';
            const isClosed = interval.status === 'CLOSED';

            const block = (
              <div
                className={cn(
                  'w-32 shrink-0 rounded-xl border p-2.5 flex flex-col justify-between gap-2.5 transition-all text-left relative select-none',
                  isOpen &&
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500/50',
                  isOccupied &&
                    'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200 hover:border-sky-500/50 cursor-pointer shadow-2xs',
                  isClosed && 'bg-muted/40 border-border/60 text-muted-foreground opacity-80'
                )}
              >
                <div className='flex items-center justify-between gap-1'>
                  <span className='text-[11px] font-mono font-bold leading-none tracking-tight text-foreground'>
                    {interval.startTime} - {interval.endTime}
                  </span>
                  <span
                    className={cn(
                      'size-2 rounded-full shrink-0',
                      isOpen && 'bg-emerald-500',
                      isOccupied && 'bg-sky-500 ring-2 ring-sky-500/20',
                      isClosed && 'bg-slate-400'
                    )}
                  />
                </div>

                <div className='mt-auto pt-1.5 border-t border-current/15 flex items-center justify-between'>
                  <span className='text-[11px] font-bold leading-none'>
                    {isOpen && SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OPEN]}
                    {isOccupied && SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OCCUPIED]}
                    {isClosed &&
                      (interval.closedReason ?? SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.CLOSED])}
                  </span>

                  {isOccupied && interval.appointmentRef?.queueNumber && (
                    <span className='px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500 text-white shadow-2xs'>
                      #{interval.appointmentRef.queueNumber}
                    </span>
                  )}
                </div>
              </div>
            );

            if (isOccupied && interval.appointmentRef) {
              return (
                <Popover key={interval.intervalIndex}>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      className='outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl'
                    >
                      {block}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align='center'
                    className='w-64 p-3.5 font-sans space-y-2 text-left z-[70] shadow-xl'
                    sideOffset={8}
                  >
                    <div className='flex items-center justify-between border-b border-border/40 pb-2'>
                      <div className='flex items-center gap-1.5'>
                        <span className='size-2 rounded-full bg-sky-500' />
                        <span className='text-xs font-bold text-foreground'>
                          Antrian Terisi #{interval.appointmentRef.queueNumber}
                        </span>
                      </div>
                      <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold'>
                        {interval.appointmentRef.status}
                      </span>
                    </div>

                    <div className='space-y-1.5 text-xs text-muted-foreground'>
                      <div className='flex items-center justify-between'>
                        <span>ID Janji:</span>
                        <span className='font-mono font-semibold text-foreground'>
                          {interval.appointmentRef.appointmentId}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>Waktu Konsultasi:</span>
                        <span className='font-mono font-semibold text-foreground'>
                          {interval.startTime} - {interval.endTime}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>Sumber Booking:</span>
                        <span className='font-semibold text-primary'>Pasien Mobile App</span>
                      </div>
                    </div>

                    <div className='pt-1 text-[10px] text-muted-foreground/80 italic border-t border-border/30'>
                      Data antrian sinkron otomatis dari upstream mobile dokter.
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return <div key={interval.intervalIndex}>{block}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
