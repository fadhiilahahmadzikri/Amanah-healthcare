import PageContainer from '@/components/layout/page-container';
import CategoryListingPage from '@/features/categories/components/category-listing';
import { CategoryAddButton } from '@/features/categories/components/category-add-button';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Categories'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Categories'
      pageDescription='Manage product categories'
      pageHeaderAction={<CategoryAddButton />}
    >
      <CategoryListingPage />
    </PageContainer>
  );
}
