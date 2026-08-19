import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { catalogProductsQueryOptions } from '../api/queries';
import { CATALOG_MAX_PAGES } from '../api/service';
import { CatalogBrowser } from './catalog-browser';

export default function CatalogListingPage() {
  const page = Math.min(Math.max(searchParamsCache.get('page'), 1), CATALOG_MAX_PAGES);
  const search = searchParamsCache.get('name');
  const filters = {
    page,
    ...(search && { search })
  };
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(catalogProductsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CatalogBrowser />
    </HydrationBoundary>
  );
}
