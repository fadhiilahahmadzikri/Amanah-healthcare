'use client';

import { useQuery } from '@tanstack/react-query';
import { kiaIntakeService, type VaccineCatalogItem } from '../api/kia-intake-service';
import { klinikKeys } from '../api/query-keys';

export function useVaccineCatalog(enabled = true) {
  const { data: vaccines = [], isLoading } = useQuery<VaccineCatalogItem[]>({
    queryKey: klinikKeys.vaccineCatalog(),
    queryFn: () => kiaIntakeService.getVaccineCatalog(),
    enabled,
    staleTime: 300_000
  });

  return {
    vaccines,
    isLoading
  };
}
