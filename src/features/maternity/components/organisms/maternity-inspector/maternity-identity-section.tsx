'use client';

import * as React from 'react';
import type {
  MaternityIntake,
  MaternalHusbandProfile
} from '../../../types/maternity.types';
import { MaternityMotherIdentityFields } from './maternity-mother-identity-fields';
import { MaternityPartnerIdentityFields } from './maternity-partner-identity-fields';

export interface MaternityIdentitySectionProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  religionOptions: string[];
  educationOptions: string[];
  occupationOptions: string[];
  bloodTypeOptions: string[];
}

export function MaternityIdentitySection({
  intake,
  isEditing = false,
  onIntakeFieldChange,
  onHusbandFieldChange,
  validationErrors,
  onClearError,
  religionOptions,
  educationOptions,
  occupationOptions,
  bloodTypeOptions
}: MaternityIdentitySectionProps) {
  const containerClass = isEditing
    ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 font-sans'
    : 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 pointer-events-none select-text font-sans';

  return (
    <div className={containerClass}>
      {/* Kolom Kiri: Identitas Ibu */}
      <MaternityMotherIdentityFields
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        religionOptions={religionOptions}
        educationOptions={educationOptions}
        occupationOptions={occupationOptions}
      />

      {/* Kolom Kanan: Identitas Suami & Wilayah Bina */}
      <MaternityPartnerIdentityFields
        intake={intake}
        isEditing={isEditing}
        onIntakeFieldChange={onIntakeFieldChange}
        onHusbandFieldChange={onHusbandFieldChange}
        validationErrors={validationErrors}
        onClearError={onClearError}
        educationOptions={educationOptions}
        occupationOptions={occupationOptions}
        bloodTypeOptions={bloodTypeOptions}
      />
    </div>
  );
}
