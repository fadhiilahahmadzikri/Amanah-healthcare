'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogService, type ServiceCategoryCatalog } from '@/features/klinik/api/catalog.service';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UseClinicFilterOptionsResult {
  poliOptions: FilterOption[];
  categories: ServiceCategoryCatalog[];
  isLoading: boolean;
}

export function useClinicFilterOptions(): UseClinicFilterOptionsResult {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['clinics', 'services', 'catalog'],
    queryFn: () => catalogService.getServiceCatalog(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const uniquePoliMap = new Map<string, string>();
  for (const cat of categories) {
    if (cat.poliklinikName && !uniquePoliMap.has(cat.poliklinikName)) {
      uniquePoliMap.set(cat.poliklinikName, cat.poliklinikName);
    }
  }

  const poliOptions: FilterOption[] = Array.from(uniquePoliMap.entries()).map(([name]) => ({
    label: name,
    value: name
  }));

  return {
    poliOptions,
    categories,
    isLoading
  };
}
