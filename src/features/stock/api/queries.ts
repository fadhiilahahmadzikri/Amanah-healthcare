import { queryOptions } from '@tanstack/react-query';
import { getStockProducts } from './service';
import { GetStockFilters } from './types';

export const stockKeys = {
  all: ['stock'] as const,
  products: () => [...stockKeys.all, 'products'] as const,
  productList: (filters: GetStockFilters) => [...stockKeys.products(), 'list', filters] as const
};

export function stockProductsQueryOptions(filters: GetStockFilters) {
  return queryOptions({
    queryKey: stockKeys.productList(filters),
    queryFn: () => getStockProducts(filters)
  });
}
