import { queryOptions } from '@tanstack/react-query';

import { getCatalogProductById, getCatalogProducts } from './service';
import type { CatalogFilters } from './types';

export const catalogKeys = {
  all: ['catalog'] as const,
  list: (filters: CatalogFilters) => [...catalogKeys.all, 'list', filters] as const,
  detail: (id: string) => [...catalogKeys.all, 'detail', id] as const
};

export const catalogProductsQueryOptions = (filters: CatalogFilters) =>
  queryOptions({
    queryKey: catalogKeys.list(filters),
    queryFn: () => getCatalogProducts(filters)
  });

export const catalogProductByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: catalogKeys.detail(id),
    queryFn: () => getCatalogProductById(id)
  });
