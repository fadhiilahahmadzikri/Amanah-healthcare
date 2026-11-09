'use client';

import * as React from 'react';
import type { MaternityIntake, MaternalHusbandProfile } from '../../../types/maternity.types';
import { MaternityPartnerIdentityFields } from './maternity-partner-identity-fields';

export interface MaternalHusbandSectionProps {
  intake?: MaternityIntake | null;
  isEditing?: boolean;
  onIntakeFieldChange?: (field: keyof MaternityIntake, value: any) => void;
  onHusbandFieldChange?: (field: keyof MaternalHusbandProfile, value: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
  educationOptions: string[];
  occupationOptions: string[];
  bloodTypeOptions: string[];
}

export function MaternalHusbandSection(props: MaternalHusbandSectionProps) {
  return (
    <div className='rounded-xl border border-border/60 p-4 bg-card shadow-2xs font-sans'>
      <MaternityPartnerIdentityFields {...props} />
    </div>
  );
}
