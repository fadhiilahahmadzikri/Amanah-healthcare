'use client';

import { clientFetch } from '@/lib/client-fetch';
import { useQuery } from '@tanstack/react-query';
import { catalogService, type ServiceCategoryCatalog } from '../api/catalog.service';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UseClinicFilterOptionsResult {
  poliOptions: FilterOption[];
  serviceOptions: FilterOption[];
  doctorOptions: FilterOption[];
  roomOptions: FilterOption[];
  categories: ServiceCategoryCatalog[];
  getServicesByPoli: (poliklinikName?: string | null) => FilterOption[];
  isLoading: boolean;
  isSuccess: boolean;
}

export function useClinicFilterOptions(): UseClinicFilterOptionsResult {
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isSuccess: isSuccessCategories
  } = useQuery({
    queryKey: ['clinics', 'services', 'catalog'],
    queryFn: () => catalogService.getServiceCatalog(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const {
    data: doctorsData,
    isLoading: isLoadingDoctors,
    isSuccess: isSuccessDoctors
  } = useQuery({
    queryKey: ['clinical', 'practitioners', 'filter-options'],
    queryFn: async () => {
      const res = await clientFetch<{
        success?: boolean;
        data?: Array<{ id: string; name: string }>;
      }>('/api/v1/clinical/practitioners');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    isSuccess: isSuccessRooms
  } = useQuery({
    queryKey: ['schedules', 'reference', 'rooms', 'filter-options'],
    queryFn: async () => {
      const res = await clientFetch<
        Array<{ id: string; name: string }> | { data?: Array<{ id: string; name: string }> }
      >('/api/v1/schedules/reference/rooms');
      const list = Array.isArray(res)
        ? res
        : (res as { data?: Array<{ id: string; name: string }> })?.data || [];
      return list;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const uniquePoliMap = new Map<string, string>();
  for (const cat of categories) {
    if (cat.poliklinikName && !uniquePoliMap.has(cat.poliklinikName)) {
      uniquePoliMap.set(cat.poliklinikName, cat.poliklinikName);
    }
  }

  const uniqueServiceMap = new Map<string, string>();
  for (const cat of categories) {
    if (Array.isArray(cat.services)) {
      for (const s of cat.services) {
        if (s.name && !uniqueServiceMap.has(s.name)) {
          uniqueServiceMap.set(s.name, s.name);
        }
      }
    }
  }

  const poliOptions: FilterOption[] = Array.from(uniquePoliMap.entries()).map(([value, label]) => ({
    label,
    value
  }));

  const serviceOptions: FilterOption[] = Array.from(uniqueServiceMap.entries()).map(
    ([value, label]) => ({
      label,
      value
    })
  );

  const doctorOptions: FilterOption[] = (doctorsData || []).map((doc) => ({
    label: doc.name,
    value: doc.name
  }));

  const roomOptions: FilterOption[] = (roomsData || []).map((room) => ({
    label: room.name,
    value: room.name
  }));

  const getServicesByPoli = (poliklinikName?: string | null): FilterOption[] => {
    if (!poliklinikName) return serviceOptions;
    const filteredServices = new Map<string, string>();
    for (const cat of categories) {
      if (cat.poliklinikName === poliklinikName && Array.isArray(cat.services)) {
        for (const s of cat.services) {
          if (s.name && !filteredServices.has(s.name)) {
            filteredServices.set(s.name, s.name);
          }
        }
      }
    }
    return Array.from(filteredServices.entries()).map(([value, label]) => ({
      label,
      value
    }));
  };

  return {
    poliOptions,
    serviceOptions,
    doctorOptions,
    roomOptions,
    categories,
    getServicesByPoli,
    isLoading: [isLoadingCategories, isLoadingDoctors, isLoadingRooms].some(Boolean),
    isSuccess: isSuccessCategories && isSuccessDoctors && isSuccessRooms
  };
}
