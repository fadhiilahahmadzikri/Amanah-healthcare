import PageContainer from '@/components/layout/page-container';
import { UserListingPage } from '@/features/data-user';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Data User',
  description:
    'Manajemen seluruh identitas akun pengguna, aktivasi massal, dan pencadangan data sistem'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  await requireRouteAccess('/admin/data-user');
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Data User'
      pageDescription='Manajemen terpusat seluruh identitas akun pengguna sistem. Kelola status aktivasi, penghapusan permanen, serta ekspor dan pemulihan cadangan data.'
    >
      <UserListingPage />
    </PageContainer>
  );
}
