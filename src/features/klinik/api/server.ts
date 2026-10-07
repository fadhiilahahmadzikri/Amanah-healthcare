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

  let rawList: ServiceCategoryCatalog[] = [];
  const candidate =
    (response as any)?.data?.categories ||
    (response as any)?.categories ||
    (response as any)?.data ||
    response;

  if (Array.isArray(candidate)) {
    rawList = candidate;
  }

  return rawList.filter((c) => Array.isArray(c.services) && c.services.length > 0);
}

export async function prefetchClinicCatalog(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['clinics', 'services', 'catalog'],
    queryFn: () => getClinicCatalogOnServer(),
    staleTime: 5 * 60 * 1000
  });
}
