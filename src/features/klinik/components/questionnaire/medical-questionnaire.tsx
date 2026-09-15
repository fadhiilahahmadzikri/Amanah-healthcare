'use client';

import * as React from 'react';
import type { MedicalFormSection } from '../../constants/medical-appointment-schemas';
import { extractQuestionnaireItems } from './types';
import { MedicalQuestionnaireGrid } from './organisms/medical-questionnaire-grid';
import { MedicalQuestionnaireAccordion } from './organisms/medical-questionnaire-accordion';
import { cn } from '@/lib/utils';

export interface MedicalQuestionnaireProps {
  section: MedicalFormSection;
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  className?: string;
}

export function MedicalQuestionnaire({
  section,
  values,
  onFieldChange,
  className
}: MedicalQuestionnaireProps) {
  const items = React.useMemo(() => extractQuestionnaireItems(section.fields), [section.fields]);

  return (
    <div data-slot='medical-questionnaire' className={cn('w-full flex flex-col', className)}>
      {/* Desktop / Tablet View: Minimal Comparison Grid (Modern SaaS Comparison Table) */}
      <div className='hidden sm:block'>
        <MedicalQuestionnaireGrid items={items} values={values} onFieldChange={onFieldChange} />
      </div>

      {/* Mobile View: Vertical Sequential Flow with Lightweight Morphing Accordion */}
      <div className='block sm:hidden'>
        <MedicalQuestionnaireAccordion
          items={items}
          values={values}
          onFieldChange={onFieldChange}
        />
      </div>
    </div>
  );
}
