'use client';

import * as React from 'react';
import {
  PatientRegistrationModal,
  type PatientRegistrationModalProps
} from './patient-registration-modal';

export { PatientRegistrationModal };
export type { PatientRegistrationModalProps };

export function PatientRegistrationView({
  initialName,
  isOpen = true
}: {
  initialName?: string;
  isOpen?: boolean;
}) {
  return <PatientRegistrationModal isOpen={isOpen} initialName={initialName} />;
}
