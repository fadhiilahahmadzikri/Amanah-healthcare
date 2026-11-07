'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import type { TableConfig } from '../../../constants/medical-appointment-types';
import type { QuestionnaireItem } from '../types';
import { SquareOptionControl } from '../atoms/square-option-control';
import { YearInputControl } from '../atoms/year-input-control';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface QuestionnaireDesktopRowProps {
  item: QuestionnaireItem;
  statusValue: string;
  yearValue: string;
  notesValue?: string;
  onSelectStatus: (status: 'Tidak' | 'Ya') => void;
  onChangeYear: (year: string) => void;
  onChangeNotes?: (notes: string) => void;
  hasAnyYear?: boolean;
  isLast?: boolean;
  tableConfig?: TableConfig;
  yearError?: string;
}

export function QuestionnaireDesktopRow({
  item,
  statusValue,
  yearValue,
  notesValue = '',
  yearError,
  onSelectStatus,
  onChangeYear,
  onChangeNotes,
  hasAnyYear = true,
  isLast = false,
  tableConfig
}: QuestionnaireDesktopRowProps) {
  const [localStatus, setLocalStatus] = React.useState(statusValue);
  const [localYear, setLocalYear] = React.useState(yearValue);
  const [localNotes, setLocalNotes] = React.useState(notesValue);

  React.useEffect(() => {
    setLocalStatus(statusValue);
  }, [statusValue]);

  React.useEffect(() => {
    setLocalYear(yearValue);
  }, [yearValue]);

  React.useEffect(() => {
    setLocalNotes(notesValue);
  }, [notesValue]);

  const currentStatus = localStatus || statusValue;
  const currentYear = localYear !== undefined ? localYear : yearValue;
  const currentNotes = localNotes !== undefined ? localNotes : notesValue;

  const isYes = currentStatus === 'Ya';
  const isNo = currentStatus === 'Tidak';
  const yearInputContainerRef = React.useRef<HTMLDivElement>(null);
  const hasNotes = Boolean(item.notesFieldId);
  const desktopNotesInputId = `${item.id}-desktop-notes`;
  const desktopYearInputId = `${item.id}-desktop-year`;

  const handleSelectStatus = (status: 'Tidak' | 'Ya') => {
    setLocalStatus(status);
    if (status === 'Tidak') {
      setLocalYear('');
      setLocalNotes('');
    }
    onSelectStatus(status);
  };

  const handleChangeYear = (val: string) => {
    setLocalYear(val);
    onChangeYear(val);
  };

  const handleChangeNotes = (val: string) => {
    setLocalNotes(val);
    onChangeNotes?.(val);
  };

  return (
    <div
      data-slot='questionnaire-desktop-row'
      className={cn(
        'group relative flex flex-col py-3.5 px-3 transition-colors duration-150 rounded-lg',
        !isLast && 'border-b border-border/40',
        isYes ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/30'
      )}
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1 min-w-0 pr-4 space-y-1'>
          <p className='text-sm font-medium text-foreground leading-snug tracking-tight'>
            {item.title}
          </p>
          {item.helpText ? (
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              {item.helpText}
            </p>
          ) : null}
        </div>

        {tableConfig?.columns && tableConfig.columns.length > 0 ? (
          tableConfig.columns
            .filter((c) => c.type !== 'label')
            .map((col) => {
              if (col.type === 'option') {
                const optVal = col.options?.[0] || col.label || col.header || '';
                const isSelected = currentStatus === optVal;
                return (
                  <div
                    key={col.id}
                    className={cn('flex justify-center shrink-0', col.width || 'w-16')}
                  >
                    <SquareOptionControl
                      checked={isSelected}
                      onClick={() => handleSelectStatus(optVal as 'Tidak' | 'Ya')}
                      ariaLabel={`${optVal} untuk ${item.title}`}
                      variant={optVal === 'Tidak' ? 'negative' : 'positive'}
                      size='md'
                    />
                  </div>
                );
              }

              if (col.type === 'year') {
                const isVisible =
                  !col.conditional ||
                  (col.conditional.dependsOnColumnId === 'ya' && isYes) ||
                  (col.conditional.dependsOnColumnId === 'tidak' && isNo);

                return (
                  <div
                    key={col.id}
                    className={cn('shrink-0 flex items-center', col.width || 'w-40')}
                  >
                    {isVisible && item.yearFieldId ? (
                      <div
                        ref={yearInputContainerRef}
                        className='w-full animate-in fade-in slide-in-from-right-2 duration-200'
                      >
                        <YearInputControl
                          id={desktopYearInputId}
                          size='sm'
                          value={currentYear}
                          onChange={handleChangeYear}
                          placeholder={col.placeholder || 'Tahun (cth: 2021)'}
                          ariaLabel={`Tahun terdiagnosis ${item.label}`}
                        />
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground/30 pl-3 select-none'>—</span>
                    )}
                  </div>
                );
              }

              if (col.type === 'text') {
                const isVisible =
                  !col.conditional ||
                  (col.conditional.dependsOnColumnId === 'ya' && isYes) ||
                  (col.conditional.dependsOnColumnId === 'tidak' && isNo);

                return (
                  <div
                    key={col.id}
                    className={cn('shrink-0 flex items-center', col.width || 'w-40')}
                  >
                    {isVisible ? (
                      <Input
                        value={currentNotes}
                        onChange={(e) => handleChangeNotes(e.target.value)}
                        placeholder={col.placeholder || 'Keterangan...'}
                        className='h-8 text-xs bg-background'
                      />
                    ) : (
                      <span className='text-xs text-muted-foreground/30 pl-3 select-none'>—</span>
                    )}
                  </div>
                );
              }

              return null;
            })
        ) : (
          <>
            <div className='w-16 flex justify-center shrink-0'>
              <SquareOptionControl
                checked={isNo}
                onClick={() => handleSelectStatus('Tidak')}
                ariaLabel={`Tidak untuk ${item.title}`}
                variant='negative'
                size='md'
              />
            </div>

            <div className='w-16 flex justify-center shrink-0'>
              <SquareOptionControl
                checked={isYes}
                onClick={() => handleSelectStatus('Ya')}
                ariaLabel={`Ya untuk ${item.title}`}
                variant='positive'
                size='md'
              />
            </div>

            {hasAnyYear ? (
              <div
                className={cn(
                  'w-40 shrink-0 flex flex-col justify-center',
                  !yearError && 'items-center'
                )}
              >
                {!hasNotes && item.yearFieldId ? (
                  isYes ? (
                    <div
                      ref={yearInputContainerRef}
                      className='w-full animate-in fade-in slide-in-from-right-2 duration-200'
                    >
                      <YearInputControl
                        id={desktopYearInputId}
                        size='sm'
                        value={currentYear}
                        onChange={handleChangeYear}
                        placeholder='Tahun (cth: 2021)'
                        ariaLabel={`Tahun terdiagnosis ${item.label}`}
                        error={yearError}
                      />
                    </div>
                  ) : (
                    <span className='text-xs text-muted-foreground/30 pl-3 select-none'>—</span>
                  )
                ) : (
                  <span className='text-xs text-muted-foreground/30 pl-3 select-none'>—</span>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      {isYes && hasNotes ? (
        <div className='mt-3 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1 duration-200'>
          <div className='sm:col-span-2'>
            <label
              htmlFor={desktopNotesInputId}
              className='text-xs font-medium text-foreground block mb-1'
            >
              Nama penyakit atau keluhan yang pernah dialami <span className='text-red-500'>*</span>
            </label>
            <Input
              id={desktopNotesInputId}
              value={currentNotes}
              onChange={(e) => handleChangeNotes(e.target.value)}
              placeholder='Contoh: Maag kronis, Asam urat'
              className='h-8.5 text-xs bg-background'
            />
          </div>
          <div>
            <label
              htmlFor={desktopYearInputId}
              className='text-xs font-medium text-foreground block mb-1'
            >
              Tahun <span className='text-red-500'>*</span>
            </label>
            <YearInputControl
              id={desktopYearInputId}
              size='sm'
              value={currentYear}
              onChange={handleChangeYear}
              placeholder='Contoh: 2020'
              ariaLabel={`Tahun terdiagnosis ${item.label}`}
              error={yearError}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
