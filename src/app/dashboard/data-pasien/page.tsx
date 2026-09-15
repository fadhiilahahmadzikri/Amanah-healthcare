import PageContainer from '@/components/layout/page-container';
import { PatientExportButton, PatientListingPage } from '@/features/data-pasien';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

import { getPatients } from '@/features/data-pasien/api/service';

export const metadata = {
  title: 'Dashboard: Data Pasien'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const initialData = await getPatients({ limit: 1 });
  const hasPatients = initialData.total_patients > 0;

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Data Pasien'
      pageDescription='Daftar rekam medis dan profil pasien klinik. Klik baris pasien untuk membuka panel inspeksi detail mendalam.'
      pageHeaderAction={hasPatients ? <PatientExportButton /> : undefined}
    >
      <PatientListingPage />
    </PageContainer>
  );
}
