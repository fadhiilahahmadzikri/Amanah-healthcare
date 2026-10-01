'use client';

import * as React from 'react';
import type { Patient } from '@/features/data-pasien/api/types';

export function useRegisteredPatient(isOpen: boolean) {
  const [registeredPatient, setRegisteredPatient] = React.useState<Patient | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    async function loadRegisteredPatient() {
      try {
        const response = await fetch('/api/patient-registration/current', {
          cache: 'no-store'
        });

        if (!response.ok) {
          if (!isCancelled) {
            setRegisteredPatient(null);
          }
          return;
        }

        const payload = (await response.json()) as { patient?: Patient | null };

        if (!isCancelled) {
          setRegisteredPatient(payload.patient ?? null);
        }
      } catch {
        if (!isCancelled) {
          setRegisteredPatient(null);
        }
      }
    }

    void loadRegisteredPatient();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  return registeredPatient;
}
