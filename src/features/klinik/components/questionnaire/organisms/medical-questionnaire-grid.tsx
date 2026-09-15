'use client';

import * as React from 'react';
import type { QuestionnaireItem } from '../types';
import { QuestionnaireDesktopRow } from '../molecules/questionnaire-desktop-row';
import { cn } from '@/lib/utils';

export interface MedicalQuestionnaireGridProps {
  items: QuestionnaireItem[];
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  className?: string;
}

export function MedicalQuestionnaireGrid({
  items,
  values,
  onFieldChange,
  className
}: MedicalQuestionnaireGridProps) {
  const answeredCount = items.filter((item) => Boolean(values[item.id])).length;
  const totalCount = items.length;

  return (
    <div data-slot='medical-questionnaire-grid' className={cn('w-full flex flex-col', className)}>
      {/* Header bar: Sticky Minimal Comparison Grid Header */}
      <div className='sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-xs px-3 py-2.5 text-xs font-medium text-muted-foreground shadow-xs'>
        <div className='flex-1 pr-4 flex items-center justify-between'>
          <span className='font-semibold text-foreground'>Kondisi / Riwayat kesehatan</span>
          <span className='text-[11px] font-normal text-muted-foreground/80'>
            {answeredCount} dari {totalCount} dijawab
          </span>
        </div>
        <div className='w-20 text-center shrink-0 font-medium text-foreground/80'>Tidak</div>
        <div className='w-20 text-center shrink-0 font-medium text-foreground/80'>Ya</div>
        <div className='w-40 shrink-0 text-left pl-1 font-medium text-foreground/80'>
          Tahun (jika Ya)
        </div>
      </div>

      {/* Row list */}
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

          return (
            <QuestionnaireDesktopRow
              key={item.id}
              item={item}
              statusValue={statusValue}
              yearValue={yearValue}
              notesValue={notesValue}
              onSelectStatus={handleSelectStatus}
              onChangeYear={handleChangeYear}
              onChangeNotes={handleChangeNotes}
              isLast={index === items.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}
