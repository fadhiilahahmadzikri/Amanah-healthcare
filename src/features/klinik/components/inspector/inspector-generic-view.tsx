'use client';

import * as React from 'react';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import type { InspectorTabProps } from './types';
import {
  RegularIdentitySection,
  RegularEncounterSection
} from './sections';

export function InspectorGenericView({
  appointment,
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange,
  validationErrors,
  onClearError
}: InspectorTabProps) {
  const references = usePatientFormReferences();

  return (
    <div className='flex flex-col gap-5 font-sans'>
      <RegularIdentitySection
        data={data}
        isEditing={isEditing}
        regularFormData={regularFormData}
        onRegularFieldChange={onRegularFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        references={references}
      />

      <RegularEncounterSection
        appointment={appointment}
        data={data}
        isEditing={isEditing}
        regularFormData={regularFormData}
        onRegularFieldChange={onRegularFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
      />
    </div>
  );
}
