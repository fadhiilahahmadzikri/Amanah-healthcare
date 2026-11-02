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
  builderMode?: boolean;
  onUpdateField?: (fieldId: string, updated: Partial<MedicalFormField>) => void;
  onDeleteField?: (fieldId: string) => void;
  onAddField?: () => void;
  className?: string;
}

export function MedicalQuestionnaire({
  section,
  values,
  onFieldChange,
  builderMode = false,
  onUpdateField,
  onDeleteField,
  onAddField,
  className
}: MedicalQuestionnaireProps) {
  const items = React.useMemo(() => extractQuestionnaireItems(section.fields), [section.fields]);

  return (
    <div data-slot='medical-questionnaire' className={cn('w-full flex flex-col', className)}>
      <div className='hidden sm:block'>
        <MedicalQuestionnaireGrid
          items={items}
          values={values}
          onFieldChange={onFieldChange}
          tableConfig={section.tableConfig}
          builderMode={builderMode}
          onUpdateField={onUpdateField}
          onDeleteField={onDeleteField}
          onAddField={onAddField}
        />
      </div>

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
