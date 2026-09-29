'use client';

import React from 'react';
import { CustomCalendar } from './custom-calendar';

export interface AppointmentCalendarDayPickerProps {
  doctorName?: string;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  className?: string;
}

export function AppointmentCalendarDayPicker({
  selectedDateStr,
  onSelectDate,
  className
}: AppointmentCalendarDayPickerProps) {
  return (
    <CustomCalendar
      value={selectedDateStr}
      onChange={(dateStr) => onSelectDate(dateStr)}
      disablePastDates={true}
      className={className}
    />
  );
}

