import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import PageContainer from '@/components/layout/page-container';
import { categoriesQueryOptions } from '@/features/categories/api/queries';
import { productByIdOptions } from '@/features/products/api/queries';
import { ProductEditPage } from '@/features/products/components/product-edit-page';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Dashboard: Edit Product'
};

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(productByIdOptions(productId));
  void queryClient.prefetchQuery(categoriesQueryOptions({ limit: 100 }));

  return (
    <PageContainer scrollable>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductEditPage productId={productId} />
      </HydrationBoundary>
    </PageContainer>
  );
}
