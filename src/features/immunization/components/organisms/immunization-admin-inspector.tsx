'use client';

import * as React from 'react';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord
} from '../../types/immunization.types';
import {
  ImmunizationParentInfoSection,
  ImmunizationHistorySection,
  ImmunizationMilestoneTrajectorySection
} from './immunization-inspector';
import { getImmunizationDomIdForErrorKey } from '@/features/klinik/validations/immunization-form.schema';

export interface ImmunizationAdminInspectorProps {
  intake?: ImmunizationIntakeRecord | null;
  entries: ImmunizationClinicalEntry[];
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof ImmunizationIntakeRecord, value: any) => void;
  onEntriesChange?: (updated: ImmunizationClinicalEntry[]) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function ImmunizationAdminInspector({
  intake,
  entries,
  isEditing = false,
  onIntakeFieldChange,
  onEntriesChange,
  validationErrors = {},
  onClearError
}: ImmunizationAdminInspectorProps) {
  React.useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const domId = getImmunizationDomIdForErrorKey(firstErrorKey);

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

  return (
    <div className='flex flex-col gap-5 font-sans'>
      <ImmunizationParentInfoSection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
      />

      <ImmunizationHistorySection
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
      />

      <ImmunizationMilestoneTrajectorySection
        entries={entries}
        isEditing={isEditing}
        onEntriesChange={onEntriesChange}
        childBirthDate={intake?.childBirthDate}
        validationErrors={validationErrors}
        onClearError={onClearError}
      />
    </div>
  );
}
