'use client';

import * as React from 'react';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import type { InspectorTabProps } from './types';
import {
  RegularIdentitySection,
  RegularEncounterSection,
  RegularClinicalNotesSection
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
      {/* 1. Profil Identitas Pasien (Editable atau Read-Only) */}
      <RegularIdentitySection
        data={data}
        isEditing={isEditing}
        regularFormData={regularFormData}
        onRegularFieldChange={onRegularFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        references={references}
      />

      {/* 2. Informasi Pendaftaran & Keluhan Utama */}
      <RegularEncounterSection
        appointment={appointment}
        data={data}
        isEditing={isEditing}
        regularFormData={regularFormData}
        onRegularFieldChange={onRegularFieldChange}
      />

      {/* 3. Kalkulasi Otomatis & Jawaban Formulir Tambahan */}
      <RegularClinicalNotesSection data={data} />
    </div>
  );
}
