'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface CustomCalendarProps {
  value: string;
  onChange: (dateStr: string, dateObj: Date) => void;
  label?: string;
  className?: string;
}

const MONTH_NAMES_INDO = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const DAY_NAMES_INDO = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CustomCalendar({ value, onChange, label = '', className }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 20));
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date(2026, 7, 20));
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      gsap.fromTo(
        calendarRef.current,
        { height: 0, opacity: 0, y: -6 },
        { height: 'auto', opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, []);

  const parsedSelection = useMemo(() => {
    if (!value) return null;
    const match = value.match(/(\d{1,2})\s+([A-Za-z]+)\s*(\d{4})?/i);
    if (!match) return null;

    const dayNum = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const yearNum = match[3] ? parseInt(match[3], 10) : 2026;

    return { dayNum, monthStr, yearNum };
  }, [value]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    const dayName = DAY_NAMES_INDO[newDate.getDay()];
    const monthShort = MONTH_NAMES_INDO[currentMonth].substring(0, 3);
    const formatted = `${dayName}, ${day} ${monthShort} ${currentYear}`;
    onChange(formatted, newDate);
  };

  return (
    <div ref={calendarRef} className={cn('space-y-1.5 overflow-hidden font-sans', className)}>
      {label && <label className='block text-xs font-normal text-muted-foreground'>{label}</label>}

      <div className='rounded-xl border border-border bg-background dark:bg-slate-800 p-3.5 shadow-2xs'>
        {/* Month Navigation Header */}
        <div className='flex items-center justify-between mb-2.5 text-xs'>
          <button
            type='button'
            onClick={() => changeMonth(-1)}
            className='p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer'
          >
            <Icons.chevronLeft className='size-4' />
          </button>

          <span className='font-bold text-xs text-primary dark:text-indigo-300'>
            {MONTH_NAMES_INDO[currentMonth]} {currentYear}
          </span>

          <button
            type='button'
            onClick={() => changeMonth(1)}
            className='p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer'
          >
            <Icons.chevronRight className='size-4' />
          </button>
        </div>

        {/* Days of week header */}
        <div className='grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground mb-1'>
          {DAY_NAMES_INDO.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className='grid grid-cols-7 gap-1 text-center text-xs'>
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;

            const isSelected = parsedSelection
              ? parsedSelection.dayNum === day &&
                MONTH_NAMES_INDO[currentMonth]
                  .toLowerCase()
                  .startsWith(parsedSelection.monthStr.substring(0, 3)) &&
                currentYear === parsedSelection.yearNum
              : selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

            return (
              <button
                key={day}
                type='button'
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'p-1.5 rounded-lg font-medium transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary dark:bg-indigo-600 text-primary-foreground font-bold shadow-2xs'
                    : 'text-foreground hover:bg-accent dark:hover:bg-indigo-950/60'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
