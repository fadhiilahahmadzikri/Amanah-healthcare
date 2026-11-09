'use client';

import * as React from 'react';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import { TETANUS_STATUS_OPTIONS } from '../../constants/maternity.constants';
import type {
  MaternityIntake,
  MaternalHusbandProfile,
  MaternalPreviousPregnancy,
  MaternalContraceptiveHistory,
  MaternalConditionResponse
} from '../../types/maternity.types';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import {
  MaternityIdentitySection,
  MaternityObstetricSection,
  MaternityClinicalKbSection,
  MaternityScreeningSection
} from './maternity-inspector';
import { MATERNITY_FIELD_DOM_ID_MAP } from '@/features/klinik/validations/maternity-form.schema';

export interface MaternityAdminInspectorProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  regionValues?: PatientRegionValues;
  onRegionChange?: (updates: Partial<PatientRegionValues>) => void;
  onPreviousPregnanciesChange?: (updated: MaternalPreviousPregnancy[]) => void;
  onContraceptiveHistoriesChange?: (updated: MaternalContraceptiveHistory[]) => void;
  onConditionsChange?: (updated: MaternalConditionResponse[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function MaternityAdminInspector({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onHusbandFieldChange,
  regionValues,
  onRegionChange,
  onPreviousPregnanciesChange,
  onContraceptiveHistoriesChange,
  onConditionsChange,
  validationErrors = {},
  onClearError
}: MaternityAdminInspectorProps) {
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      let domId = MATERNITY_FIELD_DOM_ID_MAP[firstErrorKey];
      if (!domId) {
        if (firstErrorKey.startsWith('prev_preg_')) {
          const match = firstErrorKey.match(/^prev_preg_(\d+)_(.+)$/);
          if (match) {
            const idx = match[1];
            const field = match[2];
            if (field === 'birthYear') domId = `prev-preg-year-${idx}`;
            else if (field === 'birthWeightGrams') domId = `prev-preg-weight-${idx}`;
            else if (field === 'birthLengthCm') domId = `prev-preg-length-${idx}`;
          }
        } else if (firstErrorKey.startsWith('condition_')) {
          const match = firstErrorKey.match(/^condition_([A-Z_]+)_year$/);
          if (match) {
            domId = `condition-year-${match[1].toLowerCase()}`;
          }
        } else {
          domId = `maternity-${firstErrorKey}`;
        }
      }

      const timer = setTimeout(() => {
        if (domId) {
          const el = document.getElementById(domId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (
              el instanceof HTMLInputElement ||
              el instanceof HTMLTextAreaElement ||
              el instanceof HTMLSelectElement
            ) {
              el.focus({ preventScroll: true });
            }
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [validationErrors]);

  const references = usePatientFormReferences();
  const bloodTypeOptions = React.useMemo(
    () => references.bloodTypes.map((b) => b.label || b.value),
    [references.bloodTypes]
  );
  const occupationOptions = React.useMemo(
    () => references.occupations.map((o) => o.name),
    [references.occupations]
  );
  const educationOptions = React.useMemo(
    () => references.educationLevels.map((e) => e.label || e.value),
    [references.educationLevels]
  );
  const religionOptions = React.useMemo(
    () => references.religions.map((r) => r.label || r.value),
    [references.religions]
  );

  return (
    <div className='flex flex-col gap-5 font-sans'>
      <MaternityIdentitySection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        onHusbandFieldChange={onHusbandFieldChange}
        regionValues={regionValues}
        onRegionChange={onRegionChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        religionOptions={religionOptions}
        educationOptions={educationOptions}
        occupationOptions={occupationOptions}
        bloodTypeOptions={bloodTypeOptions}
      />

      <MaternityObstetricSection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        onPreviousPregnanciesChange={onPreviousPregnanciesChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
      />

      <MaternityClinicalKbSection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        onContraceptiveHistoriesChange={onContraceptiveHistoriesChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        tetanusOptions={TETANUS_STATUS_OPTIONS}
        bloodTypeOptions={bloodTypeOptions}
      />

      <MaternityScreeningSection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        onConditionsChange={onConditionsChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
      />
    </div>
  );
}
