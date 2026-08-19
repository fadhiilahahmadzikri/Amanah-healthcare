import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { catalogProductByIdQueryOptions } from '@/features/catalog/api/queries';
import { CatalogProductDetail } from '@/features/catalog/components/catalog-product-detail';

export const metadata = {
  title: 'Dashboard: Catalog Product'
};

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function Page(props: PageProps) {
  const { productId } = await props.params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(catalogProductByIdQueryOptions(productId));

  return (
    <PageContainer scrollable>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CatalogProductDetail productId={productId} />
      </HydrationBoundary>
    </PageContainer>
  );
}
