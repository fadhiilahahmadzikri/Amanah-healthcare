'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { MedicalFormField } from '../../../constants/medical-appointment-schemas';
import type { TableConfig } from '../../../constants/medical-appointment-types';
import type { QuestionnaireItem } from '../types';
import { QuestionnaireDesktopRow } from '../molecules/questionnaire-desktop-row';
import { validateQuestionnaireYear } from '../../../schemas/medical-appointment-validation';
import { cn } from '@/lib/utils';

export interface MedicalQuestionnaireGridProps {
  items: QuestionnaireItem[];
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  tableConfig?: TableConfig;
  birthYear?: number | null;
  className?: string;
}

export function MedicalQuestionnaireGrid({
  items,
  values,
  onFieldChange,
  tableConfig,
  birthYear,
  className
}: MedicalQuestionnaireGridProps) {
  const answeredCount = items.filter((item) => Boolean(values[item.id])).length;
  const totalCount = items.length;
  const hasAnyYear = React.useMemo(() => items.some((item) => Boolean(item.yearFieldId)), [items]);

  return (
    <div data-slot='medical-questionnaire-grid' className={cn('w-full flex flex-col', className)}>
      <div className='sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-xs px-3 py-2.5 text-xs font-medium text-muted-foreground shadow-xs'>
        {tableConfig?.columns && tableConfig.columns.length > 0 ? (
          tableConfig.columns.map((col) => {
            const headerText = col.label || col.header || '';
            if (col.type === 'label') {
              return (
                <div key={col.id} className='flex-1 pr-4 flex items-center justify-between'>
                  <span className='font-semibold text-foreground'>{headerText}</span>
                  <span className='text-[11px] font-normal text-muted-foreground/80'>
                    {answeredCount} dari {totalCount} dijawab
                  </span>
                </div>
              );
            }
            if (col.type === 'option') {
              return (
                <div
                  key={col.id}
                  className={cn(
                    'text-center shrink-0 font-medium text-foreground/80',
                    col.width || 'w-16'
                  )}
                >
                  {headerText}
                </div>
              );
            }
            return (
              <div
                key={col.id}
                className={cn(
                  'shrink-0 text-left pl-1 font-medium text-foreground/80',
                  col.width || 'w-40'
                )}
              >
                {headerText}
              </div>
            );
          })
        ) : (
          <>
            <div className='flex-1 pr-4 flex items-center justify-between'>
              <span className='font-semibold text-foreground'>
                {hasAnyYear ? 'Kondisi / Riwayat kesehatan' : 'Pertanyaan / Kebiasaan'}
              </span>
              <span className='text-[11px] font-normal text-muted-foreground/80'>
                {answeredCount} dari {totalCount} dijawab
              </span>
            </div>
            <div className='w-16 text-center shrink-0 font-medium text-foreground/80'>Tidak</div>
            <div className='w-16 text-center shrink-0 font-medium text-foreground/80'>Ya</div>
            {hasAnyYear ? (
              <div className='w-40 shrink-0 text-left pl-1 font-medium text-foreground/80'>
                Tahun (jika Ya)
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className='flex flex-col divide-y-0 pt-1'>
        {items.map((item, index) => {
          const statusValue = values[item.id] || '';
          const yearValue = item.yearFieldId ? values[item.yearFieldId] || '' : '';
          const notesValue = item.notesFieldId ? values[item.notesFieldId] || '' : '';

          const handleSelectStatus = (status: 'Tidak' | 'Ya') => {
            onFieldChange(item.id, status);
            if (status === 'Tidak') {
              if (item.yearFieldId) {
                onFieldChange(item.yearFieldId, '');
              }
              if (item.notesFieldId) {
                onFieldChange(item.notesFieldId, '');
              }
            }
          };

          const handleChangeYear = (year: string) => {
            if (item.yearFieldId) {
              onFieldChange(item.yearFieldId, year);
            }
          };

          const handleChangeNotes = (notes: string) => {
            if (item.notesFieldId) {
              onFieldChange(item.notesFieldId, notes);
            }
          };

          const yearError = item.yearFieldId
            ? validateQuestionnaireYear(yearValue, birthYear)
            : undefined;

          return (
            <QuestionnaireDesktopRow
              key={item.id}
              item={item}
              statusValue={statusValue}
              yearValue={yearValue}
              notesValue={notesValue}
              yearError={yearError}
              onSelectStatus={handleSelectStatus}
              onChangeYear={handleChangeYear}
              onChangeNotes={handleChangeNotes}
              hasAnyYear={hasAnyYear}
              isLast={index === items.length - 1}
              tableConfig={tableConfig}
            />
          );
        })}
      </div>
    </div>
  );
}
