'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';

export interface VaccineItem {
  id: string;
  name: string;
  ageGroup: string;
  description: string;
}

export const CORE_VACCINE_LIST: VaccineItem[] = [
  { id: 'HB_0', name: 'HB 0', ageGroup: 'Saat Lahir', description: 'Hepatitis B (< 24 jam)' },
  { id: 'BCG', name: 'BCG', ageGroup: '1 Bulan', description: 'Tuberkulosis (TBC)' },
  {
    id: 'PENTA_1',
    name: 'PENTA 1 / Heksavalen 1',
    ageGroup: '2 Bulan',
    description: 'DPT-HB-Hib 1 atau Kombo 6-in-1'
  },
  { id: 'IPV_1', name: 'IPV 1', ageGroup: '2 Bulan', description: 'Polio suntik 1' },
  { id: 'PCV_1', name: 'PCV 1', ageGroup: '2 Bulan', description: 'Pneumokokus 1' },
  { id: 'RV_1', name: 'RV 1', ageGroup: '2 Bulan', description: 'Rotavirus tetes 1' },
  {
    id: 'PENTA_2',
    name: 'PENTA 2 / Heksavalen 2',
    ageGroup: '3 Bulan',
    description: 'DPT-HB-Hib 2 atau Kombo 6-in-1'
  },
  { id: 'IPV_2', name: 'IPV 2', ageGroup: '3 Bulan', description: 'Polio suntik 2' },
  { id: 'PCV_2', name: 'PCV 2', ageGroup: '3 Bulan', description: 'Pneumokokus 2' },
  { id: 'RV_2', name: 'RV 2', ageGroup: '3 Bulan', description: 'Rotavirus tetes 2' },
  {
    id: 'PENTA_3',
    name: 'PENTA 3 / Heksavalen 3',
    ageGroup: '4 Bulan',
    description: 'DPT-HB-Hib 3 atau Kombo 6-in-1'
  },
  { id: 'IPV_3', name: 'IPV 3', ageGroup: '4 Bulan', description: 'Polio suntik 3' },
  { id: 'RV_3', name: 'RV 3', ageGroup: '4 Bulan', description: 'Rotavirus tetes 3' },
  { id: 'MR', name: 'MR', ageGroup: '9 Bulan', description: 'Campak Rubela' },
  { id: 'JE', name: 'JE', ageGroup: '10 Bulan', description: 'Japanese Encephalitis' },
  { id: 'PCV_B', name: 'PCV-B', ageGroup: '12 Bulan', description: 'Booster Pneumokokus' },
  { id: 'PENTA_B', name: 'PENTA-B', ageGroup: '18 Bulan', description: 'Booster DPT-HB-Hib' },
  { id: 'MR_B', name: 'MR-B', ageGroup: '18 Bulan', description: 'Booster Campak Rubela' }
];

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
