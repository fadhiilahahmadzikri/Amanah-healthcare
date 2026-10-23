'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { getClinicDateTokens } from '@/lib/date-format';
import type { LeaveRequestItem } from '../api/types';

export interface LeaveBookingDateRouteProps {
  leave: LeaveRequestItem;
  className?: string;
}

interface EndpointBlockProps {
  label: string;
  monthCode: string;
  dayNumber: string;
  subtext: string;
  align?: 'left' | 'right';
}

function EndpointBlock({
  label,
  monthCode,
  dayNumber,
  subtext,
  align = 'left'
}: EndpointBlockProps) {
  const isRight = align === 'right';

  return (
    <div
      className={`flex flex-col min-w-0 flex-1 max-w-[42%] ${
        isRight ? 'items-end text-right' : 'items-start text-left'
      }`}
    >
      <span className='text-[9px] sm:text-[9.5px] font-bold text-muted-foreground/80 tracking-wider uppercase leading-none mb-1 truncate max-w-full block'>
        {label}
      </span>
      <div
        className={`flex items-baseline gap-1 sm:gap-1.5 min-w-0 ${
          isRight ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <span className='text-[19px] sm:text-[21px] xl:text-[23px] font-bold text-foreground leading-none tracking-tight font-sans shrink-0'>
          {dayNumber}
        </span>
        <span className='text-[11px] sm:text-[12px] font-extrabold text-primary tracking-wide uppercase leading-none truncate max-w-[50px] sm:max-w-[65px]'>
          {monthCode}
        </span>
      </div>
      <span
        title={subtext}
        className='text-[10px] sm:text-[10.5px] text-muted-foreground font-medium mt-1 leading-tight truncate max-w-full block'
      >
        {subtext}
      </span>
    </div>
  );
}

export function LeaveBookingDateRoute({ leave, className }: LeaveBookingDateRouteProps) {
  const isRange = leave.startDate !== leave.endDate;

  const startTokens = getClinicDateTokens(leave.startDate);
  const endTokens = getClinicDateTokens(leave.endDate);

  const startMonth = startTokens?.monthUpper || 'OKT';
  const startDay = startTokens?.day || '01';
  const startSub = startTokens ? `${startTokens.weekday}, ${startTokens.year}` : '-';

  const endMonth = endTokens?.monthUpper || startMonth;
  const endDay = endTokens?.day || startDay;
  const endSub = endTokens ? `${endTokens.weekday}, ${endTokens.year}` : '-';

  const durationLabel = `${leave.durationDays} HARI`;

  const scopeLabel =
    leave.scope === 'session' && leave.sessions && leave.sessions.length > 0
      ? `${leave.sessions.length} Sesi Terjadwal`
      : '1 Hari Penuh';

  return (
    <div
      className={`flex flex-col w-full min-w-0 select-none my-2 sm:my-2.5 py-0.5 ${className || ''}`}
    >
      {/* Route Section: Left Endpoint -> Path Connector -> Right Endpoint */}
      <div className='flex items-center justify-between gap-1 sm:gap-1.5 w-full min-w-0'>
        {/* Origin / Start Date */}
        <EndpointBlock
          label='MULAI'
          monthCode={startMonth}
          dayNumber={startDay}
          subtext={startSub}
          align='left'
        />

        {/* Center Path Connector with Duration Badge */}
        <div className='flex-shrink min-w-[32px] max-w-[90px] sm:max-w-[100px] flex items-center justify-center px-0.5 sm:px-1'>
          <div className='flex items-center w-full justify-center gap-0.5 sm:gap-1 text-muted-foreground/60 min-w-0'>
            <div className='flex-1 min-w-[3px] h-[1.5px] border-t border-dashed border-border' />
            <span className='inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-muted/60 border border-border/80 text-[9px] sm:text-[9.5px] font-bold text-foreground/80 tracking-wider whitespace-nowrap shadow-2xs shrink-0'>
              {durationLabel}
            </span>
            <div className='flex-1 min-w-[3px] h-[1.5px] border-t border-dashed border-border' />
            <Icons.chevronRight className='size-2.5 sm:size-3 text-muted-foreground/70 shrink-0 -ml-0.5' />
          </div>
        </div>

        {/* Destination / End Date or Scope */}
        {isRange ? (
          <EndpointBlock
            label='SELESAI'
            monthCode={endMonth}
            dayNumber={endDay}
            subtext={endSub}
            align='right'
          />
        ) : (
          <EndpointBlock
            label='LINGKUP'
            monthCode={leave.scope === 'session' ? 'SESI' : 'PENUH'}
            dayNumber='1D'
            subtext={scopeLabel}
            align='right'
          />
        )}
      </div>
    </div>
  );
}
