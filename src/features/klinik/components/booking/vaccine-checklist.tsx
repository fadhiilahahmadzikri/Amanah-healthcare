'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';

import { CORE_VACCINE_LIST, type VaccineItem } from '../../constants/kia-constants';

export { CORE_VACCINE_LIST, type VaccineItem };

export interface VaccineChecklistProps {
  values: Record<string, string>;
  onFieldChange: (fieldId: string, val: string) => void;
  className?: string;
}

export function VaccineChecklist({ values, onFieldChange, className }: VaccineChecklistProps) {
  const otherNote = values.otherVaccinesNote || '';

  return (
    <div className={cn('flex flex-col gap-4 w-full select-none', className)}>
      <div className='flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:p-4'>
        <div className='divide-y divide-border/40'>
          {CORE_VACCINE_LIST.map((vaccine) => {
            const statusKey = `vaccine_${vaccine.id}_status`;
            const dateKey = `vaccine_${vaccine.id}_date`;
            const currentStatus = values[statusKey] || '';
            const currentDate = values[dateKey] || '';

            return (
              <div
                key={vaccine.id}
                className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 first:pt-1 last:pb-1'
              >
                <div className='flex flex-col min-w-0 pr-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground tracking-tight'>
                      {vaccine.name}
                    </span>
                    <span className='inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                      {vaccine.ageGroup}
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
                    <div className='flex items-center gap-1.5 min-w-[150px] animate-in fade-in duration-200'>
                      <input
                        type='date'
                        aria-label={`Tanggal suntik ${vaccine.name}`}
                        value={currentDate}
                        onChange={(e) => onFieldChange(dateKey, e.target.value)}
                        className='h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='w-full'>
        <PatientLineTextarea
          id='otherVaccinesNote'
          label='Imunisasi Lain / Catatan Tambahan (Opsional)'
          value={otherNote}
          onChange={(val) => onFieldChange('otherVaccinesNote', val)}
          placeholder='Contoh: Polio tetes 4 kali di Posyandu, Influenza, Varisela, atau catatan lain...'
          containerClassName='w-full'
        />
      </div>
    </div>
  );
}
