'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';
import { useVaccineCatalog } from '../../model/useVaccineCatalog';
import type { VaccineCatalogItem } from '../../constants/kia-constants';

export type { VaccineCatalogItem };

function VaccineDatePicker({
  value,
  onChange,
  ariaLabel
}: {
  value: string;
  onChange: (val: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={cn(
            'h-8 min-w-[130px] justify-start px-2.5 text-xs font-mono font-normal shadow-2xs hover:bg-muted/50 cursor-pointer',
            !value && 'text-muted-foreground'
          )}
          aria-label={ariaLabel}
        >
          <Icons.calendar className='mr-1.5 size-3.5 text-muted-foreground shrink-0' />
          <span className='truncate'>{value || 'Pilih tanggal'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0 z-[70] shadow-xl' align='end' sideOffset={4}>
        <Calendar
          mode='single'
          selected={selectedDate}
          disabled={(date) => date > new Date()}
          onSelect={(d) => {
            if (d) {
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${day}`);
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export interface VaccineChecklistProps {
  values: Record<string, string>;
  onFieldChange: (fieldId: string, val: string) => void;
  vaccines?: VaccineCatalogItem[];
  className?: string;
}

export function VaccineChecklist({
  values,
  onFieldChange,
  vaccines: propVaccines,
  className
}: VaccineChecklistProps) {
  const { vaccines: fetchedVaccines, isLoading } = useVaccineCatalog(
    !propVaccines || propVaccines.length === 0
  );
  const activeVaccines = propVaccines && propVaccines.length > 0 ? propVaccines : fetchedVaccines;

  if (isLoading && activeVaccines.length === 0) {
    return (
      <div className={cn('flex flex-col gap-4 w-full select-none', className)}>
        <div className='flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-6 items-center justify-center text-xs text-muted-foreground'>
          Memuat daftar vaksin dari server...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 w-full select-none', className)}>
      <div className='flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:p-4'>
        <div className='divide-y divide-border/40'>
          {activeVaccines.map((vaccine) => {
            const code = vaccine.code || (vaccine as any).id;
            const ageGroup = vaccine.ageMilestone || (vaccine as any).ageGroup;
            const statusKey = `vaccine_${code}_status`;
            const dateKey = `vaccine_${code}_date`;
            const currentStatus = values[statusKey] || '';
            const currentDate = values[dateKey] || '';

            return (
              <div
                key={vaccine.id || code}
                className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 first:pt-1 last:pb-1'
              >
                <div className='flex flex-col min-w-0 pr-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground tracking-tight'>
                      {vaccine.name}
                    </span>
                    <span className='inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                      {ageGroup}
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground mt-0.5 truncate'>
                    {vaccine.description}
                  </span>
                </div>

                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0'>
                  <div className='grid grid-cols-3 gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50'>
                    {(['Sudah', 'Belum', 'Tidak tahu'] as const).map((choice) => {
                      const isSelected = currentStatus === choice;
                      return (
                        <button
                          key={choice}
                          type='button'
                          onClick={() => {
                            onFieldChange(statusKey, choice);
                            if (choice !== 'Sudah') {
                              onFieldChange(dateKey, '');
                            }
                          }}
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer text-center whitespace-nowrap',
                            isSelected
                              ? choice === 'Sudah'
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : choice === 'Belum'
                                  ? 'bg-muted-foreground/20 text-foreground font-semibold shadow-xs'
                                  : 'bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                          )}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  {currentStatus === 'Sudah' ? (
                    <div className='flex items-center gap-1.5 min-w-[130px] animate-in fade-in duration-200'>
                      <VaccineDatePicker
                        value={currentDate}
                        onChange={(val) => onFieldChange(dateKey, val)}
                        ariaLabel={`Tanggal suntik ${vaccine.name}`}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
