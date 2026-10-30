import PageContainer from '@/components/layout/page-container';
import { PatientListingPage } from '@/features/data-pasien';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Data Pasien'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  await requireRouteAccess('/admin/data-pasien');
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Data Pasien'
      pageDescription='Daftar rekam medis dan profil pasien klinik. Klik baris pasien untuk membuka panel inspeksi detail mendalam.'
    >
      <PatientListingPage />
    </PageContainer>
  );
}
