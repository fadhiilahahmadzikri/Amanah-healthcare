import { queryOptions } from '@tanstack/react-query';
import { getCategories, getCategoryById } from './service';
import type { CategoryFilters } from './types';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const
};

export const categoriesQueryOptions = (filters: CategoryFilters) =>
  queryOptions({
    queryKey: categoryKeys.list(filters),
    queryFn: () => getCategories(filters)
  });

export const categoryByIdOptions = (id: string) =>
  queryOptions({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id)
  });
