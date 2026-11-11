'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { PayrollPeriodOption } from '../types';

interface ExportPayrollPickerProps {
  periods: PayrollPeriodOption[];
  activePeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export function ExportPayrollPicker({
  periods,
  activePeriodId,
  onPeriodChange
}: ExportPayrollPickerProps) {
  if (!periods || periods.length === 0) return null;

  return (
    <div className='p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5'>
      <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground/80'>
        <Icons.receipt className='size-3.5 text-primary' />
        <span>Periode Penggajian:</span>
      </div>
      <Select value={activePeriodId} onValueChange={onPeriodChange}>
        <SelectTrigger className='h-8.5 text-xs font-medium bg-card'>
          <SelectValue placeholder='Pilih Periode Penggajian' />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={period.id} value={period.id} className='text-xs'>
              <span className='font-semibold'>{period.periodName}</span>{' '}
              <span className='text-muted-foreground text-[11px]'>
                ({period.periodStart} s/d {period.periodEnd})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
