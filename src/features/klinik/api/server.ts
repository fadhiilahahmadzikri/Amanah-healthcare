import 'server-only';

import { z } from 'zod';
import type { QueryClient } from '@tanstack/react-query';
import { httpClient } from '@/server/http/http-client';
import { paths } from '@/server/api/paths';
import type { ServiceCategoryCatalog, ServiceCatalogResponse } from './catalog.service';

export async function getClinicCatalogOnServer(): Promise<ServiceCategoryCatalog[]> {
  const response = await httpClient.request<ServiceCatalogResponse>(
    paths.clinics.catalog(),
    z.any(),
    {
      method: 'GET',
      cache: 'no-store'
    }
  );

  const rawList = response.categories ?? [];
  return rawList.filter((c) => Array.isArray(c.services) && c.services.length > 0);
}

export type ClinicFacilityServerItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  ctaUrl: string;
  displayOrder: number;
  isPublished: boolean;
  serviceId: string | null;
  serviceName: string | null;
};

export async function getClinicFacilitiesOnServer(): Promise<ClinicFacilityServerItem[]> {
  const response = await httpClient.request<ClinicFacilityServerItem[]>(
    paths.clinics.facilities(),
    z.any(),
    {
      method: 'GET',
      cache: 'no-store'
    }
  );

  return Array.isArray(response) ? response : [];
}

export type SupportFaqServerItem = {
  id: string;
  category: string;
  title: string;
  solutionSteps: string[];
  paths: string[];
  displayOrder: number;
  isPublished: boolean;
  serviceId: string | null;
  serviceName: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export async function getClinicFaqsOnServer(path?: string): Promise<SupportFaqServerItem[]> {
  const response = await httpClient.request<SupportFaqServerItem[]>(
    paths.clinics.faqs(path),
    z.any(),
    {
      method: 'GET',
      cache: 'no-store'
    }
  );

  return Array.isArray(response) ? response : [];
}

export async function prefetchClinicCatalog(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['clinics', 'services', 'catalog'],
    queryFn: () => getClinicCatalogOnServer(),
    staleTime: 5 * 60 * 1000
  });
}
