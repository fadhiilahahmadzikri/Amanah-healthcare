'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SimpleScheduleStatus } from '../../utils/leave-calculator';

export const STATUS_CONFIG: Record<
  SimpleScheduleStatus,
  {
    label: string;
    cellBg: string;
    border: string;
    text: string;
    dotBg: string;
  }
> = {
  buka: {
    label: 'Buka',
    cellBg: 'bg-success-subtle hover:bg-success-subtle/80',
    border: 'border-success-border',
    text: 'text-success',
    dotBg: 'bg-success'
  },
  cuti: {
    label: 'Cuti',
    cellBg: 'bg-info-subtle hover:bg-info-subtle/80',
    border: 'border-info-border',
    text: 'text-info',
    dotBg: 'bg-info'
  },
  tutup: {
    label: 'Tutup',
    cellBg: 'bg-muted/30 hover:bg-muted/40',
    border: 'border-border/50',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground/40'
  }
};

export interface DoctorCalendarDayCellProps {
  day: number;
  status: SimpleScheduleStatus;
  isPast: boolean;
  isSelected: boolean;
  isCellUpdating: boolean;
  isCellDisabled: boolean;
  readOnly: boolean;
  monthName: string;
  onSelectDay: (day: number) => void;
  onStatusChange?: (day: number, status: 'OPEN' | 'CLOSED') => void;
  onNavigateToDailyGrid?: (day: number) => void;
}

export function DoctorCalendarDayCell({
  day,
  status,
  isPast,
  isSelected,
  isCellUpdating,
  isCellDisabled,
  readOnly,
  monthName,
  onSelectDay,
  onStatusChange,
  onNavigateToDailyGrid
}: DoctorCalendarDayCellProps) {
  const cfg = STATUS_CONFIG[status];

  if (isPast) {
    return (
      <div
        className='w-full h-full min-h-[52px] sm:min-h-[58px] rounded-xl border border-border/20 bg-muted/10 p-2 flex flex-col justify-between text-left opacity-35 cursor-not-allowed select-none'
        title='Tanggal telah berlalu'
      >
        <div className='flex items-center justify-between'>
          <span className='text-xs sm:text-sm tabular-nums font-medium text-muted-foreground'>
            {day}
          </span>
          <span className='size-1.5 rounded-full bg-muted-foreground/40' />
        </div>
        <span className='text-[10px] sm:text-[11px] font-medium text-muted-foreground/60'>
          Selesai
        </span>
      </div>
    );
  }

  const cellContent = (
    <div
      className={cn(
        'w-full h-full min-h-[52px] sm:min-h-[58px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative cursor-pointer group/cell overflow-hidden',
        cfg.cellBg,
        cfg.border,
        isSelected && 'ring-2 ring-primary/40 shadow-xs',
        isCellDisabled && 'cursor-wait'
      )}
    >
      {isCellUpdating && (
        <div
          role='status'
          aria-label='Menyimpan perubahan jadwal'
          className='absolute inset-0 z-20 rounded-xl bg-background/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 animate-in fade-in duration-150'
        >
          <Spinner className='size-4 text-primary' />
          <span className='text-[9.5px] font-bold text-foreground/80 tracking-tight leading-none'>
            Menyimpan...
          </span>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <span className='text-xs sm:text-sm tabular-nums font-bold leading-none text-foreground'>
          {day}
        </span>
        <span className={cn('size-2 rounded-full shrink-0', cfg.dotBg)} />
      </div>

      <div className='mt-1 flex items-center justify-between gap-1'>
        <span
          className={cn(
            'text-[10px] sm:text-[11.5px] font-bold leading-none select-none tracking-tight block',
            cfg.text
          )}
        >
          {cfg.label}
        </span>

        {onNavigateToDailyGrid && (
          <span
            role='button'
            tabIndex={0}
            onClick={(e) => {
              if (isCellDisabled) return;
              e.stopPropagation();
              onSelectDay(day);
              onNavigateToDailyGrid(day);
            }}
            onKeyDown={(e) => {
              if (isCellDisabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onSelectDay(day);
                onNavigateToDailyGrid(day);
              }
            }}
            title={`Buka Jadwal & Kuota tanggal ${day}`}
            className={cn(
              'size-4 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-background/90 transition-all opacity-60 group-hover/cell:opacity-100 cursor-pointer shrink-0',
              isCellDisabled && 'pointer-events-none opacity-20'
            )}
          >
            <Icons.arrowUpRight className='size-3 stroke-[2.5]' />
          </span>
        )}
      </div>
    </div>
  );

  if (readOnly) {
    return (
      <button
        type='button'
        onClick={() => onSelectDay(day)}
        className='w-full h-full text-left outline-none'
      >
        {cellContent}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={isCellDisabled}
        onClick={() => onSelectDay(day)}
      >
        <button
          type='button'
          disabled={isCellDisabled}
          className={cn(
            'w-full h-full text-left outline-none',
            isCellDisabled && 'cursor-wait pointer-events-none'
          )}
        >
          {cellContent}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-44'>
        {onNavigateToDailyGrid && (
          <>
            <DropdownMenuItem
              onClick={() => {
                onSelectDay(day);
                onNavigateToDailyGrid(day);
              }}
              className='text-xs font-bold text-primary flex items-center justify-between cursor-pointer'
            >
              <span>Lihat Jadwal Harian</span>
              <Icons.arrowUpRight className='size-3.5 stroke-[2.2]' />
            </DropdownMenuItem>
            <div className='h-px bg-border/40 my-1' />
          </>
        )}
        <div className='px-2 py-1 text-[10px] font-semibold text-muted-foreground'>
          Ubah status tanggal {day} {monthName}:
        </div>
        {(['OPEN', 'CLOSED'] as const).map((st) => {
          const itemCfg = st === 'OPEN' ? STATUS_CONFIG.buka : STATUS_CONFIG.tutup;
          const isCurrent = st === (status === 'buka' ? 'OPEN' : 'CLOSED');
          return (
            <DropdownMenuItem
              key={st}
              onClick={() => onStatusChange?.(day, st)}
              className='text-xs font-bold flex items-center justify-between cursor-pointer'
            >
              <div className='flex items-center gap-2'>
                <span className={cn('size-2 rounded-full', itemCfg.dotBg)} />
                <span className={itemCfg.text}>{itemCfg.label}</span>
              </div>
              {isCurrent && <span className='text-primary'>✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
