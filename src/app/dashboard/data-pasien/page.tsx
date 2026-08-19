import PageContainer from '@/components/layout/page-container';
import PatientListingPage from '@/features/data-pasien/components/patient-listing';
import { PatientExportButton } from '@/features/data-pasien/components/patient-export-button';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Data Pasien'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Data Pasien'
      pageDescription='Daftar rekam medis dan profil pasien klinik. Klik baris pasien untuk membuka panel inspeksi detail mendalam.'
      pageHeaderAction={<PatientExportButton />}
    >
      <PatientListingPage />
    </PageContainer>
  );
}
