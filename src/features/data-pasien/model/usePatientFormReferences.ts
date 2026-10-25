'use client';

import { useEffect, useState } from 'react';
import {
  patientReferenceService,
  type PatientFormReferenceData
} from '../api/patient-reference-service';
import { GENDER_LABEL_MAP, GENDER_OPTIONS, type Gender } from '@/constants/gender.constants';

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

  const mappedGenders =
    data?.genders && data.genders.length > 0
      ? data.genders.map((g) => ({
          ...g,
          label: GENDER_LABEL_MAP[g.value as Gender]
        }))
      : GENDER_OPTIONS;

  return {
    bloodTypes: data?.bloodTypes ?? [],
    genders: mappedGenders,
    statuses: data?.statuses ?? [],
    relationships: data?.relationships ?? [],
    provinces: data?.provinces ?? [],
    regions: data?.regions ?? [],
    occupations: data?.occupations ?? [],
    isLoading,
    error
  };
}
