'use client';

import * as React from 'react';
import type { QuestionnaireItem } from '../types';
import { QuestionnaireMobileItem } from '../molecules/questionnaire-mobile-item';
import { cn } from '@/lib/utils';

export interface MedicalQuestionnaireAccordionProps {
  items: QuestionnaireItem[];
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  className?: string;
}

export function MedicalQuestionnaireAccordion({
  items,
  values,
  onFieldChange,
  className
}: MedicalQuestionnaireAccordionProps) {
  // Find first unanswered index or default to 0
  const firstUnansweredIndex = React.useMemo(() => {
    const idx = items.findIndex((item) => !values[item.id]);
    return idx !== -1 ? idx : 0;
  }, [items, values]);

  const [activeIndex, setActiveIndex] = React.useState<number>(firstUnansweredIndex);

  const answeredCount = items.filter((item) => Boolean(values[item.id])).length;
  const totalCount = items.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  };

  const handleAdvance = (currentIndex: number) => {
    // Find next unanswered index starting from currentIndex + 1
    const nextUnanswered = items.findIndex((item, idx) => idx > currentIndex && !values[item.id]);

    if (nextUnanswered !== -1) {
      setActiveIndex(nextUnanswered);
    } else {
      // If none after, check if any before were missed
      const anyUnanswered = items.findIndex((item) => !values[item.id]);
      if (anyUnanswered !== -1) {
        setActiveIndex(anyUnanswered);
      } else {
        // All answered! Close accordion or keep at current
        setActiveIndex(-1);
      }
    }
  };

  return (
    <div data-slot='medical-questionnaire-accordion' className={cn('flex flex-col', className)}>
      {/* Mobile Sticky Progress Bar Header */}
      <div className='sticky top-0 z-20 -mx-1 bg-background/95 backdrop-blur-xs px-2 pt-1 pb-3 mb-1 border-b border-border/70 shadow-xs'>
        <div className='flex items-center justify-between text-xs mb-1.5'>
          <span className='font-medium text-foreground'>Kelengkapan Jawaban</span>
          <span className='font-semibold text-primary'>
            {answeredCount} / {totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full bg-primary transition-all duration-300 ease-out'
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Accordion list */}
      <div className='flex flex-col divide-y-0'>
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
            <QuestionnaireMobileItem
              key={item.id}
              item={item}
              index={index}
              total={totalCount}
              isOpen={activeIndex === index}
              onToggle={() => handleToggle(index)}
              statusValue={statusValue}
              yearValue={yearValue}
              notesValue={notesValue}
              onSelectStatus={handleSelectStatus}
              onChangeYear={handleChangeYear}
              onChangeNotes={handleChangeNotes}
              onAdvance={() => handleAdvance(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
