'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  catalogService,
  type ServiceCatalogItem,
  type ServiceCategoryCatalog
} from '../api/catalog.service';

export interface UseClinicServiceCatalogResult {
  categories: ServiceCategoryCatalog[];
  selectedCategoryCode: string | null;
  selectedCategory: ServiceCategoryCatalog | null;
  selectedService: ServiceCatalogItem | null;
  isLoading: boolean;
  error: Error | null;
  selectCategory: (categoryCode: string) => void;
  selectService: (service: ServiceCatalogItem | null) => void;
  reload: () => Promise<void>;
}

export function useClinicServiceCatalog(
  initialCategoryCode?: string
): UseClinicServiceCatalogResult {
  const [categories, setCategories] = useState<ServiceCategoryCatalog[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(
    initialCategoryCode || null
  );
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCatalog = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getServiceCatalog(forceRefresh);
      setCategories(data);

      setSelectedCategoryCode((prev) => {
        if (prev && data.some((cat) => cat.code === prev)) {
          return prev;
        }
        return data[0]?.code || null;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat katalog layanan klinik'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryCode) return categories[0] || null;
    return categories.find((cat) => cat.code === selectedCategoryCode) || categories[0] || null;
  }, [categories, selectedCategoryCode]);

  const selectCategory = useCallback(
    (categoryCode: string) => {
      setSelectedCategoryCode(categoryCode);
      if (selectedService && selectedCategory?.code !== categoryCode) {
        setSelectedService(null);
      }
    },
    [selectedCategory?.code, selectedService]
  );

  const selectService = useCallback((service: ServiceCatalogItem | null) => {
    setSelectedService(service);
  }, []);

  const reload = useCallback(async () => {
    await fetchCatalog(true);
  }, [fetchCatalog]);

  return {
    categories,
    selectedCategoryCode,
    selectedCategory,
    selectedService,
    isLoading,
    error,
    selectCategory,
    selectService,
    reload
  };
}
