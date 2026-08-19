import PageContainer from '@/components/layout/page-container';
import CatalogListingPage from '@/features/catalog/components/catalog-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Catalog'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Catalog'
      pageDescription='Storefront preview for browsing products and cart quantities.'
    >
      <CatalogListingPage />
    </PageContainer>
  );
}
