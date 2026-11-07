'use client';

import * as React from 'react';
import type {
  MedicalFormField,
  MedicalFormSection
} from '../../constants/medical-appointment-schemas';
import { extractQuestionnaireItems } from './types';
import { MedicalQuestionnaireGrid } from './organisms/medical-questionnaire-grid';
import { MedicalQuestionnaireAccordion } from './organisms/medical-questionnaire-accordion';
import { cn } from '@/lib/utils';

export interface MedicalQuestionnaireProps {
  section: MedicalFormSection;
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  birthYear?: number | null;
  className?: string;
}

export function MedicalQuestionnaire({
  section,
  values,
  onFieldChange,
  birthYear,
  className
}: MedicalQuestionnaireProps) {
  const items = React.useMemo(() => extractQuestionnaireItems(section.fields), [section.fields]);

  const effectiveBirthYear = React.useMemo(() => {
    if (birthYear !== undefined && birthYear !== null) return birthYear;
    const bDate = values['motherBirthDate'] || values['birthDate'];
    if (bDate) {
      const parsed = new Date(bDate).getFullYear();
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  }, [birthYear, values]);

  return (
    <div data-slot='medical-questionnaire' className={cn('w-full flex flex-col', className)}>
      <div className='hidden sm:block'>
        <MedicalQuestionnaireGrid
          items={items}
          values={values}
          onFieldChange={onFieldChange}
          tableConfig={section.tableConfig}
          birthYear={effectiveBirthYear}
        />
      </div>

      <div className='block sm:hidden'>
        <MedicalQuestionnaireAccordion
          items={items}
          values={values}
          onFieldChange={onFieldChange}
          birthYear={effectiveBirthYear}
        />
      </div>
    </div>
  );
}
