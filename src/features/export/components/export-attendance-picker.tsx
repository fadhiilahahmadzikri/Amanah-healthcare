'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getDynamicMonthOptions, getRecentYears } from '../model/useExportDialog';

interface ExportAttendancePickerProps {
  selectedMonthIndex: number;
  selectedYear: number;
  onMonthChange: (monthIndex: number) => void;
  onYearChange: (year: number) => void;
}

export function ExportAttendancePicker({
  selectedMonthIndex,
  selectedYear,
  onMonthChange,
  onYearChange
}: ExportAttendancePickerProps) {
  const monthOptions = useMemo(() => getDynamicMonthOptions('id-ID'), []);
  const yearOptions = useMemo(() => getRecentYears(3), []);

  return (
    <div className='flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60'>
      <Icons.calendar className='size-4 text-primary shrink-0 ml-1' />
      <span className='text-xs font-semibold text-foreground/80 shrink-0'>Periode:</span>

      <Select
        value={String(selectedMonthIndex)}
        onValueChange={(val) => onMonthChange(Number(val))}
      >
        <SelectTrigger className='h-8 text-xs font-medium bg-card'>
          <SelectValue placeholder='Pilih Bulan' />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((m) => (
            <SelectItem key={m.index} value={String(m.index)} className='text-xs'>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(selectedYear)}
        onValueChange={(val) => onYearChange(Number(val))}
      >
        <SelectTrigger className='h-8 text-xs font-medium w-24 bg-card'>
          <SelectValue placeholder='Tahun' />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((y) => (
            <SelectItem key={y} value={String(y)} className='text-xs'>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
