'use client';

import { useEffect, useState } from 'react';
import {
  patientReferenceService,
  type PatientFormReferenceData
} from '../api/patient-reference-service';

export function usePatientFormReferences() {
  const [data, setData] = useState<PatientFormReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    patientReferenceService
      .getFormReferenceOptions()
      .then((refData) => {
        if (isMounted) {
          setData(refData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching patient form references:', err);
          setError(err instanceof Error ? err : new Error('Gagal memuat referensi formulir'));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    bloodTypes: data?.bloodTypes ?? [],
    genders: data?.genders ?? [],
    relationships: data?.relationships ?? [],
    provinces: data?.provinces ?? [],
    regions: data?.regions ?? [],
    occupations: data?.occupations ?? [],
    isLoading,
    error
  };
}
