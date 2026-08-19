'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface Visual7DayStripProps {
  selectedDateStr: string;
  onSelectDate: (dateStr: string, dateObj: Date) => void;
  onToggleCalendar?: () => void;
  showFullCalendar?: boolean;
  className?: string;
}

const DAY_NAMES_INDO = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const FULL_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Ags',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

export function Visual7DayStrip({
  selectedDateStr,
  onSelectDate,
  onToggleCalendar,
  showFullCalendar = false,
  className
}: Visual7DayStripProps) {
  const daysList = useMemo(() => {
    const baseDate = new Date(2026, 7, 19); // 19 Aug 2026
    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const dayNameShort = DAY_NAMES_INDO[d.getDay()];
      const fullDayName = FULL_DAY_NAMES[d.getDay()];
      const dateNum = d.getDate();
      const monthShort = MONTH_NAMES_SHORT[d.getMonth()];
      const formatted = `${fullDayName}, ${dateNum} ${monthShort} ${d.getFullYear()}`;

      list.push({
        dateObj: d,
        dayNameShort,
        dateNum,
        monthShort,
        formatted,
        isToday: i === 0
      });
    }
    return list;
  }, []);

  const parsedDayNum = useMemo(() => {
    if (!selectedDateStr) return null;
    const match = selectedDateStr.match(/(\d{1,2})\s+([A-Za-z]+)/i);
    if (!match) return null;
    return {
      day: parseInt(match[1], 10),
      month: match[2].toLowerCase()
    };
  }, [selectedDateStr]);

  return (
    <div className={cn('space-y-2 font-sans', className)}>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-normal text-muted-foreground'>
          pilih tanggal (7 hari kedepan)*
        </span>

        {onToggleCalendar && (
          <button
            type='button'
            onClick={onToggleCalendar}
            className='text-[11px] text-primary dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer select-none'
          >
            <Icons.calendar className='size-3.5' />
            <span>{showFullCalendar ? 'tutup kalender' : 'pilih dari kalender'}</span>
          </button>
        )}
      </div>

      <div className='grid grid-cols-7 gap-1.5 sm:gap-2'>
        {daysList.map((item) => {
          const isSelected = parsedDayNum
            ? parsedDayNum.day === item.dateNum &&
              parsedDayNum.month.startsWith(item.monthShort.toLowerCase().substring(0, 2))
            : item.isToday;

          return (
            <button
              key={item.formatted}
              type='button'
              onClick={() => onSelectDate(item.formatted, item.dateObj)}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-primary dark:bg-indigo-600 text-primary-foreground shadow-md py-3 px-1 ring-2 ring-primary/20 scale-105 z-10'
                  : 'bg-background dark:bg-slate-800/80 text-foreground border border-border py-2 px-1 hover:border-primary/50'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isSelected ? 'text-indigo-200' : 'text-muted-foreground'
                )}
              >
                {item.dayNameShort}
              </span>

              <span
                className={cn(
                  'font-bold my-0.5 leading-none',
                  isSelected ? 'text-lg text-white' : 'text-sm text-foreground'
                )}
              >
                {item.dateNum}
              </span>

              <span
                className={cn(
                  'text-[9.5px] font-normal',
                  isSelected ? 'text-indigo-200' : 'text-muted-foreground'
                )}
              >
                {item.isToday ? 'hari ini' : item.monthShort}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
