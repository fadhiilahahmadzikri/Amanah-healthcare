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
    <div className={`flex flex-col ${isRight ? 'items-end text-right' : 'items-start text-left'}`}>
      <span className='text-[9.5px] font-bold text-muted-foreground/80 tracking-wider uppercase leading-none mb-1.5'>
        {label}
      </span>
      <div className={`flex items-baseline gap-1.5 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className='text-[24px] sm:text-[26px] font-bold text-foreground leading-none tracking-tight font-sans'>
          {dayNumber}
        </span>
        <span className='text-[12px] sm:text-[13px] font-extrabold text-primary tracking-wide uppercase leading-none'>
          {monthCode}
        </span>
      </div>
      <span className='text-[10.5px] text-muted-foreground font-medium mt-1 leading-tight'>
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
    <div className={`flex flex-col w-full select-none my-2.5 sm:my-3 py-1 ${className || ''}`}>
      {/* Route Section: Left Endpoint -> Path Connector -> Right Endpoint */}
      <div className='flex items-center justify-between gap-2'>
        {/* Origin / Start Date */}
        <EndpointBlock
          label='MULAI'
          monthCode={startMonth}
          dayNumber={startDay}
          subtext={startSub}
          align='left'
        />

        {/* Center Path Connector with Duration Badge */}
        <div className='flex-1 flex items-center justify-center px-1'>
          <div className='flex items-center w-full max-w-[130px] justify-center gap-1 text-muted-foreground/60'>
            <div className='flex-1 h-[1.5px] border-t border-dashed border-border' />
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-muted/60 border border-border/80 text-[10px] font-bold text-foreground/80 tracking-wider whitespace-nowrap shadow-2xs'>
              {durationLabel}
            </span>
            <div className='flex-1 h-[1.5px] border-t border-dashed border-border' />
            <Icons.chevronRight className='size-3 text-muted-foreground/70 shrink-0 -ml-1' />
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
